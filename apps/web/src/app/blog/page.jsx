import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Plus, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CreateBlogModal from '@/components/CreateBlogModal';
import PageFadeIn from '@/components/PageFadeIn';
import { useBlogsAPI } from '@/hooks/useBlogsAPI';
import { useAuthAPI } from '@/hooks/useAuthAPI';

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

export default function PostsFeedPage() {
  const { getAllBlogs, likeBlog, addComment, createBlog, getBlogLikes, loading, error } = useBlogsAPI();
  const { isAuthenticated, user } = useAuthAPI();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingBlog, setCreatingBlog] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [currentPostLikes, setCurrentPostLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const sentinelRef = useRef(null);
  const pageRef = useRef(0);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showLikesModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLikesModal]);
  
  // Helper function to check authentication and redirect if needed
  const requireAuth = (action) => {
    if (!isAuthenticated) {
      navigate('/account/signin', { state: { returnUrl: '/blog', message: `Please sign in to ${action}` } });
      return false;
    }
    return true;
  };

  const load = useCallback(async (isInitialLoad = false) => {
    if (loading || (!isInitialLoad && !hasMore)) return;
    try {
      const currentPage = isInitialLoad ? 0 : pageRef.current;
      const response = await getAllBlogs(currentPage, 10);
      if (response) {
        console.log('Loaded posts:', response.content);
        if (isInitialLoad) {
          // Replace posts on initial load
          setPosts(response.content || []);
          setPage(1);
          pageRef.current = 1;
          setInitialLoadComplete(true);
        } else {
          // Append posts for pagination
          setPosts((prev) => [...prev, ...(response.content || [])]);
          setPage((p) => p + 1);
          pageRef.current += 1;
        }
        setHasMore(response.page < response.totalPages - 1);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  }, [loading, hasMore, getAllBlogs]);

  useEffect(() => {
    // Reset state when component mounts
    setPosts([]);
    setHasMore(true);
    setPage(0);
    pageRef.current = 0;
    setInitialLoadComplete(false);
    
    load(true); // Initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setPosts([]);
      setHasMore(true);
      setPage(0);
      pageRef.current = 0;
      setInitialLoadComplete(false);
    };
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !initialLoadComplete) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading && initialLoadComplete) {
        load(false); // Pagination load
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, initialLoadComplete]); // Added initialLoadComplete dependency

  const toggleLike = async (postId) => {
    if (!requireAuth('like posts')) return;
    
    try {
      await likeBlog(postId);
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p;
        const wasLiked = p.likedByCurrentUser;
        return { 
          ...p, 
          likedByCurrentUser: !wasLiked, 
          likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1
        };
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const addCommentToPost = async (postId, content, parentId = null) => {
    if (!content) return;
    if (!requireAuth('comment on posts')) return;
    
    try {
      const newComment = await addComment(postId, content, parentId);
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p;
        const newComments = p.comments ? [newComment, ...p.comments] : [newComment];
        return { ...p, comments: newComments, commentCount: (p.commentCount || 0) + 1 };
      }));
      return newComment; // Return the comment for optimistic updates
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err; // Re-throw to handle in the calling function
    }
  };

  const handleCreateBlog = async (content, mediaType, file) => {
    console.log('Creating blog with:', { content, mediaType, file });
    setCreatingBlog(true);
    try {
      const newPost = await createBlog(content, mediaType, file);
      console.log('Blog created successfully:', newPost);
      // Add the new post to the beginning of the list
      setPosts((prev) => [newPost, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating blog:', err);
      console.error('Error details:', err);
      
      // More specific error messages
      if (err.message?.includes('413') || err.message?.includes('Payload Too Large')) {
        toast.error('File too large. Please select a smaller file (max 100MB).');
      } else if (err.message?.includes('400') || err.message?.includes('Bad Request')) {
        toast.error('Invalid file format. Please select an image or video file.');
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        toast.error('Please log in to create posts.');
      } else {
        toast.error(`Failed to create post: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setCreatingBlog(false);
    }
  };

  const handleViewLikes = async (postId) => {
    if (!requireAuth('view likes')) return;
    
    setLoadingLikes(true);
    try {
      console.log('Loading likes for post:', postId);
      const response = await getBlogLikes(postId, 0, 50);
      console.log('Likes response:', response);
      setCurrentPostLikes(response.content || []);
      setShowLikesModal(true);
    } catch (err) {
      console.error('Error loading likes:', err);
      console.error('Error details:', err);
      toast.error('Failed to load likes');
    } finally {
      setLoadingLikes(false);
    }
  };
  
  const handleCreatePostClick = () => {
    if (!requireAuth('create posts')) return;
    setShowCreateModal(true);
  };


  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <button
            onClick={handleCreatePostClick}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-xl p-6 overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                {/* Profile Picture */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                  {(post.username || 'U').charAt(0).toUpperCase()}
                </div>
                {/* Username and Time */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {post.username || 'User'}
                    </span>
                    {post.userRole && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.userRole === 'CANDIDATE' ? 'bg-purple-100 text-purple-700' :
                        post.userRole === 'RECRUITER' ? 'bg-orange-100 text-orange-700' :
                        post.userRole === 'ADMIN' ? 'bg-slate-100 text-slate-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {post.userRole === 'CANDIDATE' ? 'Job Seeker' : post.userRole.charAt(0) + post.userRole.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{formatRelativeTime(post.createdAt)}</div>
                </div>
              </div>
              <div className="text-gray-900 whitespace-pre-wrap break-words mb-4">{post.content}</div>
              {post.mediaUrl && post.mediaType === 'IMAGE' && (
                <img 
                  src={`http://localhost:8080${post.mediaUrl}`} 
                  alt="Post media" 
                  className="w-full h-64 object-cover rounded-lg mb-4" 
                  onError={(e) => {
                    console.error('Failed to load image:', post.mediaUrl);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', post.mediaUrl);
                  }}
                />
              )}
              {post.mediaUrl && post.mediaType === 'VIDEO' && (
                <video 
                  src={`http://localhost:8080${post.mediaUrl}`} 
                  controls 
                  className="w-full h-64 rounded-lg mb-4"
                  onError={(e) => {
                    console.error('Failed to load video:', post.mediaUrl);
                    e.target.style.display = 'none';
                  }}
                  onLoadStart={() => {
                    console.log('Video loading started:', post.mediaUrl);
                  }}
                />
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <button 
                  onClick={() => toggleLike(post.id)} 
                  className={`flex items-center gap-1 hover:text-red-600 transition-colors ${
                    post.likedByCurrentUser ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.likedByCurrentUser ? 'fill-current' : ''}`} /> 
                  {post.likeCount || 0}
                </button>
                
                {/* View Likes Button */}
                {post.likeCount > 0 && (
                  <button 
                    onClick={() => handleViewLikes(post.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    View likes
                  </button>
                )}
              </div>
              <CommentsSection 
                post={post} 
                user={user} 
                isAuthenticated={isAuthenticated}
                onAdd={(content, parentId) => addCommentToPost(post.id, content, parentId)} 
                requireAuth={requireAuth}
              />
            </article>
          ))}
          <div ref={sentinelRef} className="h-10 flex items-center justify-center text-gray-500">
            {loading ? 'Loading…' : hasMore ? 'Scroll to load more' : 'No more posts'}
          </div>
        </div>
      </div>
      
      {/* Create Blog Modal */}
      <CreateBlogModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBlog}
        loading={creatingBlog}
      />
      
      {/* View Likes Modal - Rendered at body level using Portal */}
      {showLikesModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999,
            margin: 0
          }}
          onClick={() => setShowLikesModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden" 
            style={{ 
              position: 'relative',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Likes</h2>
              <button
                onClick={() => setShowLikesModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Likes List */}
            <div className="max-h-96 overflow-y-auto">
              {loadingLikes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : currentPostLikes.length > 0 ? (
                <div className="p-4 space-y-3">
                  {currentPostLikes.map((like) => (
                    <div
                      key={like.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {/* User Profile Picture */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                        {(like.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {like.username || 'User'}
                          </span>
                          {like.userRole && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              like.userRole === 'CANDIDATE' ? 'bg-purple-100 text-purple-700' :
                              like.userRole === 'RECRUITER' ? 'bg-orange-100 text-orange-700' :
                              like.userRole === 'ADMIN' ? 'bg-slate-100 text-slate-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {like.userRole === 'CANDIDATE' ? 'Job Seeker' : like.userRole.charAt(0) + like.userRole.slice(1).toLowerCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {like.createdAt ? formatRelativeTime(like.createdAt) : 'Recently liked'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  No likes yet
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      <Footer />
    </PageFadeIn>
  );
}

function CommentsSection({ post, user, isAuthenticated, onAdd, requireAuth }) {
  const [value, setValue] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const textareaRef = useRef(null);
  const { getComments } = useBlogsAPI();

  const submit = async (e) => { 
    e.preventDefault();
    if (!value.trim()) return;
    if (!requireAuth('comment on posts')) return;
    
    // Make sure comments section is visible
    if (!showComments) {
      setShowComments(true);
    }
    
    // Add the comment using the handleAddComment function
    await handleAddComment(value, null);
    setValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const loadComments = async () => {
    if (comments.length > 0 || loadingComments) return;
    
    setLoadingComments(true);
    try {
      console.log('Loading comments for post:', post.id);
      const response = await getComments(post.id, 0, 50);
      console.log('Comments response:', response);
      if (response && response.content) {
        setComments(response.content);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (content, parentId = null) => {
    if (!requireAuth(parentId ? 'reply to comments' : 'comment on posts')) return;
    
    // Optimistically add the comment to local state
    const tempComment = {
      id: Date.now(), // Temporary ID
      content,
      parent_id: parentId,
      createdAt: new Date().toISOString(),
      username: user?.name || user?.username || 'You',
      likeCount: 0,
      likedByCurrentUser: false
    };
    setComments(prev => [tempComment, ...prev]);
    
    try {
      // Call the parent's addComment function
      const newComment = await onAdd(content, parentId);
      
      if (newComment) {
        // Replace the temporary comment with the real one
        setComments(prev => prev.map(c => 
          c.id === tempComment.id ? { ...newComment, parent_id: parentId } : c
        ));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      // Remove the temporary comment on error
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
    }
  };

  const handleLoadReplies = (parentId, replies) => {
    console.log('Adding replies to comments:', parentId, replies);
    // Add parent_id to each reply so they map correctly
    const repliesWithParent = replies.map(reply => ({
      ...reply,
      parent_id: parentId
    }));
    
    // Add the loaded replies to the comments state
    setComments(prev => {
      // Filter out any existing replies for this parent to avoid duplicates
      const filteredComments = prev.filter(c => c.parent_id !== parentId);
      // Add the new replies with parent_id
      return [...filteredComments, ...repliesWithParent];
    });
  };

  const commentsMap = comments.reduce((acc, c) => { 
    (acc[c.parent_id || 'root'] ||= []).push(c); 
    return acc; 
  }, {});

  return (
    <div className="mt-4">
      {/* Comments Toggle Button */}
      <button
        onClick={handleToggleComments}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors mb-3"
      >
        <MessageCircle className="h-4 w-4" />
        {showComments ? 'Hide Comments' : 'View Comments'} {post.commentCount || 0}
        {loadingComments && <span className="text-xs">Loading...</span>}
      </button>

      {showComments && (
        <>
          {/* Comment Form */}
          <form onSubmit={submit} className="mb-6">
            <div className="flex gap-2 items-start">
              <textarea 
                ref={textareaRef}
                value={value} 
                onChange={(e) => {
                  setValue(e.target.value);
                  // Auto-resize on change
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }} 
                placeholder="Write a comment..." 
                className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none min-h-[44px]"
                rows="1"
              />
              <button 
                type="submit"
                disabled={!value.trim()}
                className="px-4 py-3 bg-red-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {(commentsMap['root'] || []).map((c) => (
              <Comment 
                key={c.id} 
                comment={c} 
                childrenMap={commentsMap} 
                depth={0} 
                onAddReply={handleAddComment}
                onLoadReplies={handleLoadReplies}
                requireAuth={requireAuth}
              />
            ))}
            {comments.length === 0 && !loadingComments && (
              <p className="text-gray-500 text-sm text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Comment({ comment, childrenMap, depth, onAddReply, onLoadReplies, requireAuth }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.likedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const { getReplies, likeComment } = useBlogsAPI();
  
  const replies = childrenMap[comment.id] || [];
  // Check both local replies and backend replyCount (only show if count > 0)
  const replyCount = replies.length > 0 ? replies.length : (comment.replyCount || 0);
  const hasReplies = replyCount > 0;
  
  // Auto-expand replies when they are actually loaded/added to local state
  useEffect(() => {
    if (replies.length > 0 && !loadingReplies) {
      setShowReplies(true);
    }
  }, [replies.length, loadingReplies]);
  
  const submit = async (e) => { 
    e.preventDefault();
    if (!text.trim()) return;
    if (!requireAuth('reply to comments')) return;
    
    // Make sure replies section is visible
    if (!showReplies) {
      setShowReplies(true);
    }
    
    await onAddReply(text, comment.id); 
    setText(''); 
    setReplying(false); 
  };

  const loadReplies = async () => {
    // Only skip if already loading or if we already have replies loaded
    if (loadingReplies) {
      console.log('Already loading replies, skipping');
      return;
    }
    if (replies.length > 0) {
      console.log('Replies already loaded, skipping fetch');
      return;
    }
    
    setLoadingReplies(true);
    try {
      console.log('Loading replies for comment ID:', comment.id);
      console.log('Expected reply count from backend:', comment.replyCount);
      const response = await getReplies(comment.id, 0, 20);
      console.log('Full replies API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response.content:', response?.content);
      console.log('Response.content length:', response?.content?.length);
      
      if (response && response.content && response.content.length > 0) {
        console.log('✅ Replies loaded successfully:', response.content);
        // Pass the loaded replies to the parent component
        if (onLoadReplies) {
          onLoadReplies(comment.id, response.content);
        }
      } else {
        console.warn('⚠️ No replies found in response. Response structure:', {
          hasResponse: !!response,
          hasContent: !!response?.content,
          contentLength: response?.content?.length,
          fullResponse: response
        });
      }
    } catch (err) {
      console.error('❌ Error loading replies:', err);
      console.error('Error details:', err.message, err.stack);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleToggleReplies = async () => {
    console.log('Toggle replies clicked. Current state:', { showReplies, repliesLength: replies.length, replyCount });
    
    if (!showReplies && replies.length === 0 && replyCount > 0) {
      // Load replies first before showing
      console.log('Loading replies before showing...');
      setShowReplies(true); // Show immediately so user sees loading state
      await loadReplies();
    } else {
      setShowReplies(!showReplies);
    }
  };

  const handleLike = async () => {
    if (!requireAuth('like comments')) return;
    
    try {
      await likeComment(comment.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${depth > 0 ? 'ml-4 border-l-2 border-gray-200' : ''}`}>
      {/* Comment Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Profile Picture */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {(comment.username || 'U').charAt(0).toUpperCase()}
        </div>
        
        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.username || 'User'}
            </span>
            {comment.userRole && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                comment.userRole === 'CANDIDATE' ? 'bg-purple-100 text-purple-700' :
                comment.userRole === 'RECRUITER' ? 'bg-orange-100 text-orange-700' :
                comment.userRole === 'ADMIN' ? 'bg-slate-100 text-slate-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {comment.userRole === 'CANDIDATE' ? 'Job Seeker' : comment.userRole.charAt(0) + comment.userRole.slice(1).toLowerCase()}
              </span>
            )}
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">{comment.content}</div>
        </div>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-4 ml-11">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1 text-xs transition-colors ${
            isLiked 
              ? 'text-red-600 hover:text-red-700' 
              : 'text-gray-500 hover:text-red-600'
          }`}
        >
          <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>
        
        <button 
          onClick={() => setReplying((v) => !v)} 
          className="text-xs text-gray-500 hover:text-red-600 transition-colors"
        >
          Reply
        </button>
      </div>
      
      {replying && (
        <form onSubmit={submit} className="mt-3 ml-11">
          <div className="flex gap-2">
            <input 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              placeholder="Write a reply..." 
            />
            <button 
              type="submit"
              disabled={!text.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reply
            </button>
          </div>
        </form>
      )}

      {/* Replies Section */}
      {hasReplies && (
        <div className="mt-3 ml-11">
          <button
            onClick={handleToggleReplies}
            className="text-xs text-red-600 hover:text-red-700 transition-colors mb-3 font-medium"
          >
            {showReplies ? 'Hide' : 'View'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            {loadingReplies && <span className="ml-1">Loading...</span>}
          </button>
          
          {showReplies && (
            <div className="space-y-3">
              {loadingReplies ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : replies.length > 0 ? (
                replies.map((child) => (
                  <Comment 
                    key={child.id} 
                    comment={child} 
                    childrenMap={childrenMap} 
                    depth={depth + 1} 
                    onAddReply={onAddReply}
                    onLoadReplies={onLoadReplies}
                    requireAuth={requireAuth}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No replies found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
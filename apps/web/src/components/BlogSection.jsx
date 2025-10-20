import { Calendar, User, Heart, MessageSquare, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Landing Your Dream Tech Job in 2024",
    excerpt: "Navigate the competitive tech job market with these proven strategies that have helped thousands of professionals secure their ideal positions.",
    author: "Sarah Johnson",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612c93f?auto=format&fit=crop&w=100&h=100&q=80",
    publishDate: "March 15, 2024",
    readTime: "5 min read",
    category: "Career Advice",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&h=400&q=80",
    likes: 128,
    comments: 24,
    featured: true
  },
  {
    id: 2,
    title: "The Rise of Remote Work: How Companies Are Adapting",
    excerpt: "Explore how organizations worldwide are transforming their hiring practices and workplace cultures to embrace the remote work revolution.",
    author: "Michael Chen",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
    publishDate: "March 12, 2024",
    readTime: "7 min read",
    category: "Industry Trends",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=400&q=80",
    likes: 92,
    comments: 18,
    featured: true
  },
  {
    id: 3,
    title: "Building a Strong Personal Brand as a Professional",
    excerpt: "Learn how to showcase your expertise and build a compelling personal brand that attracts the right opportunities and connections.",
    author: "Emily Rodriguez",
    authorImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80",
    publishDate: "March 10, 2024",
    readTime: "6 min read",
    category: "Professional Development",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&h=400&q=80",
    likes: 156,
    comments: 31,
    featured: false
  }
];

function BlogCard({ post }) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-red-200 transition-all duration-300 group">
      {/* Featured Image */}
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {post.featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-3 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {post.publishDate}
          </div>
          <div className="text-gray-300">•</div>
          <div>{post.readTime}</div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        {/* Author Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={post.authorImage}
              alt={post.author}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <User className="w-4 h-4" />
              {post.author}
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {post.likes}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {post.comments}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
    </article>
  );
}

export default function BlogSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stay updated with the latest insights, tips, and trends in the world of recruitment and career development
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg group">
            View All Posts
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
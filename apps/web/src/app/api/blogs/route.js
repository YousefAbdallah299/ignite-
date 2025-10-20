import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Base query
    let queryParts = ['SELECT bp.*, u.first_name, u.last_name, u.profile_image'];
    let countQueryParts = ['SELECT COUNT(*) as total'];
    let fromClause = ` FROM blog_posts bp 
                      LEFT JOIN users u ON bp.author_id = u.id 
                      WHERE bp.is_published = true`;
    
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      conditions.push(`(LOWER(bp.title) LIKE LOWER($${paramIndex}) OR LOWER(bp.excerpt) LIKE LOWER($${paramIndex}) OR LOWER(bp.content) LIKE LOWER($${paramIndex}))`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      conditions.push(`LOWER(bp.category) = LOWER($${paramIndex})`);
      params.push(category);
      paramIndex++;
    }

    // Combine conditions
    if (conditions.length > 0) {
      fromClause += ' AND ' + conditions.join(' AND ');
    }

    // Get total count for pagination
    const countQuery = countQueryParts[0] + fromClause;
    const countResult = await sql(countQuery, params);
    const totalBlogs = parseInt(countResult[0]?.total || 0);

    // Main query with pagination and ordering
    const mainQuery = queryParts[0] + fromClause + 
                     ` ORDER BY bp.created_at DESC 
                       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    const finalParams = [...params, limit, offset];
    const blogs = await sql(mainQuery, finalParams);

    // Get like counts for each blog
    const blogIds = blogs.map(blog => blog.id);
    let likeCounts = [];
    let commentCounts = [];
    
    if (blogIds.length > 0) {
      const placeholders = blogIds.map((_, i) => `$${i + 1}`).join(',');
      
      // Get like counts
      const likeQuery = `SELECT post_id, COUNT(*) as like_count 
                        FROM blog_likes 
                        WHERE post_id IN (${placeholders}) 
                        GROUP BY post_id`;
      likeCounts = await sql(likeQuery, blogIds);
      
      // Get comment counts
      const commentQuery = `SELECT post_id, COUNT(*) as comment_count 
                           FROM blog_comments 
                           WHERE post_id IN (${placeholders}) 
                           GROUP BY post_id`;
      commentCounts = await sql(commentQuery, blogIds);
    }

    // Merge counts with blogs
    const blogsWithCounts = blogs.map(blog => ({
      ...blog,
      like_count: likeCounts.find(lc => lc.post_id === blog.id)?.like_count || 0,
      comment_count: commentCounts.find(cc => cc.post_id === blog.id)?.comment_count || 0,
      author_name: `${blog.first_name || ''} ${blog.last_name || ''}`.trim() || 'Anonymous'
    }));

    // Get available categories
    const categoriesQuery = `SELECT DISTINCT category 
                            FROM blog_posts 
                            WHERE is_published = true AND category IS NOT NULL 
                            ORDER BY category`;
    const categories = await sql(categoriesQuery);

    return Response.json({
      blogs: blogsWithCounts,
      pagination: {
        page,
        limit,
        total: totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        hasNext: page < Math.ceil(totalBlogs / limit),
        hasPrev: page > 1
      },
      categories: categories.map(c => c.category)
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return Response.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, 
      content, 
      excerpt, 
      author_id, 
      featured_image, 
      category,
      is_published = true
    } = body;

    // Validate required fields
    if (!title || !content || !author_id) {
      return Response.json(
        { error: 'Title, content, and author_id are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO blog_posts (title, content, excerpt, author_id, featured_image, category, is_published)
      VALUES (${title}, ${content}, ${excerpt}, ${author_id}, ${featured_image}, ${category}, ${is_published})
      RETURNING *
    `;

    return Response.json({ blog: result[0] });

  } catch (error) {
    console.error('Error creating blog:', error);
    return Response.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
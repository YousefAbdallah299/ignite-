import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const rows = await sql`SELECT id, author_name, content, created_at, like_count, comment_count FROM posts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const count = await sql`SELECT COUNT(*) as total FROM posts`;
    return Response.json({ posts: rows, pagination: { page, limit, total: parseInt(count[0].total), pages: Math.ceil(parseInt(count[0].total)/limit) } });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}



import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const id = params?.id;
    const body = await request.json();
    const content = body?.content?.toString().trim();
    const parentId = body?.parent_id ?? null;
    if (!content) return Response.json({ error: 'content required' }, { status: 400 });
    const rows = await sql`
      INSERT INTO comments (post_id, content, parent_id)
      VALUES (${id}, ${content}, ${parentId})
      RETURNING id, post_id, content, parent_id, created_at
    `;
    await sql`UPDATE posts SET comment_count = COALESCE(comment_count,0) + 1 WHERE id = ${id}`;
    return Response.json({ comment: rows[0] }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to comment' }, { status: 500 });
  }
}



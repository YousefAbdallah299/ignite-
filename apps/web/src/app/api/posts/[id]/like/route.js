import sql from "@/app/api/utils/sql";

export async function POST(_request, { params }) {
  try {
    const id = params?.id;
    await sql`UPDATE posts SET like_count = COALESCE(like_count,0) + 1 WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to like' }, { status: 500 });
  }
}



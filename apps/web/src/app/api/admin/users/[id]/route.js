import sql from "@/app/api/utils/sql";

export async function DELETE(_request, { params }) {
  try {
    const id = params?.id;
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });
    await sql`DELETE FROM users WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}



import sql from "@/app/api/utils/sql";

export async function PATCH(request, { params }) {
  try {
    const id = params?.id;
    const body = await request.json();
    const status = body?.status;
    if (!['accepted', 'declined'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    const rows = await sql`UPDATE offers SET status = ${status} WHERE id = ${id} RETURNING *`;
    if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ offer: rows[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}



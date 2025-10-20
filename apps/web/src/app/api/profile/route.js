import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const userId = 1; // TODO: from auth
    const rows = await sql`SELECT title, summary, resume_url, available_from FROM users WHERE id = ${userId}`;
    const profile = rows[0] || { title: '', summary: '', resume_url: '', available_from: '' };
    return Response.json({ profile });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const userId = 1; // TODO: from auth
    await sql`UPDATE users SET title = ${body.title}, summary = ${body.summary}, resume_url = ${body.resume_url}, available_from = ${body.available_from} WHERE id = ${userId}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}



import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const query = role ? sql`SELECT id, email, name, role FROM users WHERE role = ${role}` : sql`SELECT id, email, name, role FROM users`;
    const users = await query;
    return Response.json({ users });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}



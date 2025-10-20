import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // TODO: use auth to filter by current user; for now assume recruiter_id=1 OR candidate_id=1 based on role param
    const role = searchParams.get('role') || 'candidate';
    const userId = parseInt(searchParams.get('user_id') || '1');

    const where = role === 'recruiter' ? sql`o.recruiter_id = ${userId}` : sql`o.candidate_id = ${userId}`;

    const rows = await sql`
      SELECT o.id, o.job_id, o.recruiter_id, o.candidate_id, o.status, o.created_at
      FROM offers o
      WHERE ${where}
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const count = await sql`SELECT COUNT(*) as total FROM offers o WHERE ${where}`;

    return Response.json({
      offers: rows,
      pagination: { page, limit, total: parseInt(count[0].total), pages: Math.ceil(parseInt(count[0].total) / limit) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const candidateId = body.candidate_id;
    const jobId = body.job_id ?? null;
    const recruiterId = body.recruiter_id ?? 1; // TODO: from auth
    if (!candidateId) return Response.json({ error: 'candidate_id required' }, { status: 400 });
    const rows = await sql`
      INSERT INTO offers (candidate_id, recruiter_id, job_id, status)
      VALUES (${candidateId}, ${recruiterId}, ${jobId}, 'pending')
      RETURNING *
    `;
    return Response.json({ offer: rows[0] }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}



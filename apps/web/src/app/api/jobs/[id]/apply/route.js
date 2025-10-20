const BACKEND_URL = 'http://localhost:8080/api/v1';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/jobs/${id}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend responded with status: ${response.status}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error applying for job:', error);
    return Response.json(
      { error: error.message || 'Failed to apply for job' },
      { status: 500 }
    );
  }
}

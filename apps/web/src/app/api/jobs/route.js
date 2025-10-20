const BACKEND_URL = 'http://localhost:8080/api/v1';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log(`Fetching jobs from: ${BACKEND_URL}/jobs?${queryString}`);
    
    const response = await fetch(`${BACKEND_URL}/jobs?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error response: ${errorText}`);
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Jobs data received:`, data);
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    console.log(`Creating job at: ${BACKEND_URL}/jobs`);
    console.log(`Job data:`, body);
    console.log(`Auth header present:`, !!authHeader);
    
    const response = await fetch(`${BACKEND_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    console.log(`Job creation response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Job creation error response:`, errorData);
      throw new Error(errorData.message || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Job created successfully:`, data);
    return Response.json(data);
  } catch (error) {
    console.error('Error creating job:', error);
    return Response.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}

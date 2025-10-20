import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const skill_level = searchParams.get('skill_level') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build dynamic query
    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereConditions.push(`(LOWER(title) LIKE LOWER($${paramCount}) OR LOWER(description) LIKE LOWER($${paramCount}) OR LOWER(instructor_name) LIKE LOWER($${paramCount}))`);
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      params.push(category);
    }

    if (skill_level) {
      paramCount++;
      whereConditions.push(`skill_level = $${paramCount}`);
      params.push(skill_level);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get courses
    const coursesQuery = `
      SELECT 
        id,
        title,
        description,
        instructor_name,
        duration,
        skill_level,
        category,
        price,
        thumbnail_url,
        course_url,
        is_featured,
        created_at
      FROM courses
      ${whereClause}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const courses = await sql(coursesQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses
      ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return Response.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      instructor_name,
      duration,
      skill_level,
      category,
      price,
      thumbnail_url,
      course_url,
      sections
    } = body;

    // Validate required fields
    if (!title || !description || !instructor_name || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO courses (
        title, description, instructor_name, duration, skill_level,
        category, price, thumbnail_url, course_url
      ) VALUES (
        ${title}, ${description}, ${instructor_name}, ${duration}, ${skill_level},
        ${category}, ${price}, ${thumbnail_url}, ${course_url}
      )
      RETURNING *
    `;

    const course = result[0];

    // Optionally persist sections/lessons if backing tables exist
    if (Array.isArray(sections) && sections.length > 0) {
      for (const s of sections) {
        const secRows = await sql`
          INSERT INTO course_sections (course_id, title)
          VALUES (${course.id}, ${s.title || 'Section'})
          RETURNING id
        `;
        const sectionId = secRows[0]?.id;
        if (sectionId && Array.isArray(s.lessons)) {
          for (const l of s.lessons) {
            await sql`
              INSERT INTO course_lessons (section_id, title, text_content, video_url, image_url)
              VALUES (${sectionId}, ${l.title || 'Lesson'}, ${l.text || null}, ${l.videoUrl || null}, ${l.imageUrl || null})
            `;
          }
        }
      }
    }

    return Response.json({ course }, { status: 201 });

  } catch (error) {
    console.error('Error creating course:', error);
    return Response.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
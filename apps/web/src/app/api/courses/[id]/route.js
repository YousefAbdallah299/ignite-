// Dummy course detail for preview/testing
export async function GET(_request, { params }) {
  const id = params?.id;
  const course = {
    id,
    title: 'Mastering Full-Stack Web Development',
    description: 'A comprehensive, hands-on program that takes you from fundamentals to advanced topics across the full web stack.',
    skillLevel: 'INTERMEDIATE',
    categories: ['Web Development', 'Programming'],
    sections: [
      {
        id: 's1',
        title: 'Introduction & Setup',
        lessons: [
          { id: 'l1', title: 'Welcome & Course Overview', content: 'Welcome to the course! Here is what you will learn...' },
          { id: 'l2', title: 'Setting Up Your Environment', content: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=80' },
        ],
      },
      {
        id: 's2',
        title: 'Frontend Foundations',
        lessons: [
          { id: 'l3', title: 'Modern JavaScript Essentials', content: 'Let\'s review modern JavaScript features used throughout the course.' },
          { id: 'l4', title: 'React Components & State', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        id: 's3',
        title: 'Backend & APIs',
        lessons: [
          { id: 'l5', title: 'Designing RESTful APIs', content: 'Principles for designing resilient and scalable APIs.' },
          { id: 'l6', title: 'Database Modeling Basics', content: 'Relational vs NoSQL, normalization, indexing, and more.' },
        ],
      },
    ],
  };
  return Response.json({ course });
}



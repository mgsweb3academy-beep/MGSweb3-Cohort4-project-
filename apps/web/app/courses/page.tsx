import { Course } from 'types';
import { Card, Badge, Button } from 'ui';
import Link from 'next/link';
import DeleteCourseButton from './DeleteCourseButton';

async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch('http://localhost:3001/courses', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch courses');
    }
    return res.json();
  } catch (err) {
    console.error(err);
    // Return mock data if API is not running
    return [
      {
        id: 'course_1',
        title: 'Introduction to Web3',
        programId: 'prog_abc',
        programName: 'Web3 Foundations',
        instructorId: 'inst_1',
        instructorName: 'Alice',
        status: 'published',
        lessonCount: 5,
        enrollmentCount: 120,
      }
    ];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="wrap py-12 rise">
      <div className="mb-8">
        <span className="pill pill-dim mb-2">CURRICULUM</span>
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-4xl font-display font-bold">Programs & Courses</h1>
          <Link href="/courses/new">
            <Button variant="solid">Create Course</Button>
          </Link>
          <DeleteCourseButton courses={courses} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <Card key={course.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Badge variant={course.status === 'published' ? 'teal' : 'amber'}>
                {course.status.replace('_', ' ')}
              </Badge>
              <span className="mono text-dim">{course.lessons?.length || 0} Lessons</span>
            </div>
            <h3 className="text-xl font-display font-bold mb-2">{course.title}</h3>
            <p className="text-dim text-sm mb-6 flex-grow">{course.program?.name || 'Unknown Program'} • {course.instructorName || 'Instructor'}</p>
            
            <Link href={`/courses/${course.id}`} className="block mt-auto">
              <Button className="w-full justify-center">View Course</Button>
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}

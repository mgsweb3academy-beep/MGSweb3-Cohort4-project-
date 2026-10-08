import { Course } from 'types';
import { Card, Badge, Button, Nav } from 'ui';
import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import DeleteCourseButton from './DeleteCourseButton';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const courses = (await fetchQuery(api.courses.list, {})) as Course[];

  return (
    <>
      <Nav currentPath="/courses" />
      <main className="wrap pt-[clamp(5rem,12vh,8rem)] pb-12 rise">
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
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={course.status === 'published' ? 'teal' : 'amber'}>
                  {course.status.replace('_', ' ')}
                </Badge>
                <span className="mono text-dim">{course.lessonCount} Lessons</span>
              </div>
              <h3 className="text-xl font-display font-bold mb-2">{course.title}</h3>
              <p className="text-dim text-sm mb-6 flex-grow">{course.programName} • {course.instructorName}</p>

              <Link href={`/courses/${course.id}`} className="block mt-auto">
                <Button className="w-full justify-center">View Course</Button>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

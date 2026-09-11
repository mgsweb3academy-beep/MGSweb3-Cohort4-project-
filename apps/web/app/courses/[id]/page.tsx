import { Course, Lesson } from 'types';
import { Card, Badge, Button, Nav } from 'ui';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = (await fetchQuery(api.courses.get, { id })) as Course | null;
  const lessons = (await fetchQuery(api.lessons.listByCourse, { courseId: id })) as Lesson[];

  if (!course) {
    return (
      <>
        <Nav currentPath="/courses" />
        <div className="wrap pt-[clamp(5rem,12vh,8rem)] text-chalk">Course not found</div>
      </>
    );
  }

  return (
    <>
      <Nav currentPath="/courses" />
      <main className="wrap pt-[clamp(5rem,12vh,8rem)] pb-12 rise">
        <Link href="/courses" className="text-dim hover:text-chalk mb-6 inline-block text-sm flex items-center gap-2">
          &larr; Back to Courses
        </Link>

        <div className="flex items-start justify-between mb-12 border-b border-line pb-8">
          <div>
            <Badge variant={course.status === 'published' ? 'teal' : 'amber'} className="mb-4">
              {course.status.replace('_', ' ')}
            </Badge>
            <h1 className="text-4xl font-display font-bold mb-2">{course.title}</h1>
            <p className="text-dim">{course.programName} • {course.instructorName}</p>
          </div>

          {course.status === 'draft' && (
            <div className="flex gap-4">
              <Link href={`/courses/${id}/edit`}>
                <Button variant="outline">Author Mode</Button>
              </Link>
              <form action={async () => {
                'use server';
                await fetchMutation(api.courses.setStatus, { id, status: 'in_review' });
                revalidatePath(`/courses/${id}`);
              }}>
                <Button type="submit" variant="solid">Request Review</Button>
              </form>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold mb-6">Lessons</h2>
          <div className="flex flex-col gap-4">
            {lessons.length === 0 ? (
              <p className="text-dim italic">No lessons available yet.</p>
            ) : (
              lessons.map((lesson) => (
                <Link href={`/lessons/${lesson.id}`} key={lesson.id}>
                  <Card className="hover:border-signal transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-ink-3 flex items-center justify-center mono text-dim text-xs border border-line">
                        {lesson.order}
                      </div>
                      <div>
                        <h3 className="font-display font-bold group-hover:text-signal transition-colors">{lesson.title}</h3>
                        <span className="mono text-dim text-xs uppercase">{lesson.contentType}</span>
                      </div>
                    </div>
                    <Button size="sm">Start</Button>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}

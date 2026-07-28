'use client';

import * as React from 'react';
import { Course, Lesson, LessonContentType } from 'types';
import { Card, Button, Badge } from 'ui';
import Link from 'next/link';
import { use } from 'react';

const API_URL = 'http://localhost:3001';

export default function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = React.useState<Course | null>(null);
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Authoring Form State
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [contentType, setContentType] = React.useState<LessonContentType>('video');
  const [contentUrl, setContentUrl] = React.useState('');
  const [textContent, setTextContent] = React.useState('');
  const [order, setOrder] = React.useState(1);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          fetch(`${API_URL}/courses/${id}`),
          fetch(`${API_URL}/lessons?courseId=${id}`)
        ]);

        if (courseRes.ok) setCourse(await courseRes.json());
        if (lessonsRes.ok) {
          const l = await lessonsRes.json();
          setLessons(l);
          setOrder(l.length + 1);
        }
      } catch (err) {
        console.error('Failed to fetch course data for authoring', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setContentType(lesson.contentType);
    setContentUrl(lesson.contentUrl || '');
    setTextContent(lesson.textContent || '');
    setOrder(lesson.order);
  };

  const handleResetForm = () => {
    setEditingLessonId(null);
    setTitle('');
    setContentType('video');
    setContentUrl('');
    setTextContent('');
    setOrder(lessons.length + 1);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      courseId: id,
      title,
      contentType,
      contentUrl: contentUrl || undefined,
      textContent: textContent || undefined,
      order
    };

    try {
      if (editingLessonId) {
        // Update
        const res = await fetch(`${API_URL}/lessons/${editingLessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setLessons(lessons.map(l => l.id === updated.id ? updated : l));
        }
      } else {
        // Create
        const res = await fetch(`${API_URL}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setLessons([...lessons, created]);
        }
      }
      handleResetForm();
    } catch (err) {
      alert('Failed to save lesson');
    }
  };

  if (loading) return <div className="wrap py-12 text-chalk">Loading authoring environment...</div>;
  if (!course) return <div className="wrap py-12 text-chalk">Course not found.</div>;

  return (
    <main className="wrap py-12 rise">
      <Link href={`/courses/${id}`} className="text-dim hover:text-chalk mb-6 inline-block text-sm">
        &larr; Back to Course View
      </Link>
      
      <div className="flex items-start justify-between mb-8 border-b border-line pb-8">
        <div>
          <Badge variant="dim" className="mb-4">AUTHORING MODE</Badge>
          <h1 className="text-3xl font-display font-bold mb-2">Editing: {course.title}</h1>
          <p className="text-dim">Add and edit lessons for this course.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Lesson List */}
        <div>
          <h2 className="text-xl font-display font-bold mb-6 text-chalk">Curriculum</h2>
          <div className="flex flex-col gap-4">
            {lessons.length === 0 ? (
              <p className="text-dim italic">No lessons yet. Author one to get started.</p>
            ) : (
              lessons.sort((a,b) => a.order - b.order).map(lesson => (
                <Card key={lesson.id} className={`flex items-center justify-between ${editingLessonId === lesson.id ? 'border-mark' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mono text-dim text-xs">#{lesson.order}</span>
                      <span className="mono text-dim text-xs uppercase bg-ink px-1 rounded">{lesson.contentType}</span>
                    </div>
                    <h3 className="font-bold text-chalk">{lesson.title}</h3>
                  </div>
                  <Button size="sm" onClick={() => handleEditLesson(lesson)}>Edit</Button>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Authoring Form */}
        <div>
          <Card className="sticky top-24">
            <h2 className="text-xl font-display font-bold mb-6 text-chalk">
              {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>
            <form onSubmit={handleSaveLesson} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-dim mb-1 font-mono">TITLE</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-ink border border-line rounded p-2 text-chalk focus:border-signal outline-none"
                  placeholder="e.g. Introduction to Smart Contracts"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dim mb-1 font-mono">CONTENT TYPE</label>
                  <select 
                    value={contentType}
                    onChange={e => setContentType(e.target.value as LessonContentType)}
                    className="w-full bg-ink border border-line rounded p-2 text-chalk focus:border-signal outline-none"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="markdown">Markdown</option>
                    <option value="audio">Audio</option>
                    <option value="code">Code Snippet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dim mb-1 font-mono">ORDER</label>
                  <input 
                    required
                    type="number" 
                    value={order}
                    onChange={e => setOrder(Number(e.target.value))}
                    className="w-full bg-ink border border-line rounded p-2 text-chalk focus:border-signal outline-none"
                    min="1"
                  />
                </div>
              </div>

              {['video', 'audio', 'pdf'].includes(contentType) && (
                <div>
                  <label className="block text-sm text-dim mb-1 font-mono">MEDIA URL</label>
                  <input 
                    required
                    type="url" 
                    value={contentUrl}
                    onChange={e => setContentUrl(e.target.value)}
                    className="w-full bg-ink border border-line rounded p-2 text-chalk focus:border-signal outline-none"
                    placeholder="https://example.com/file.mp4"
                  />
                </div>
              )}

              {['markdown', 'code'].includes(contentType) && (
                <div>
                  <label className="block text-sm text-dim mb-1 font-mono">TEXT CONTENT</label>
                  <textarea 
                    required
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    className="w-full bg-ink border border-line rounded p-2 text-chalk focus:border-signal outline-none font-mono text-sm min-h-[150px]"
                    placeholder={contentType === 'markdown' ? '# Markdown Title...' : 'const a = 1;'}
                  />
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-line">
                <Button type="submit" variant="solid" className="flex-1">
                  {editingLessonId ? 'Update Lesson' : 'Create Lesson'}
                </Button>
                {editingLessonId && (
                  <Button type="button" onClick={handleResetForm}>Cancel</Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}

'use client';

import * as React from 'react';
import { Lesson, LessonProgress } from 'types';
import { Button, VideoPlayer, AudioPlayer, PdfViewer, MarkdownViewer, CodeSnippet } from 'ui';
import Link from 'next/link';
import { use } from 'react';

// Client-side fetch since we need to track state dynamically
const API_URL = 'http://localhost:3001';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lesson, setLesson] = React.useState<Lesson | null>(null);
  const [progress, setProgress] = React.useState<LessonProgress | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'content' | 'notes' | 'bookmarks'>('content');
  const [noteInput, setNoteInput] = React.useState('');
  const [currentPosition, setCurrentPosition] = React.useState(0);

  const userId = 'user_demo'; // Mock user

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonRes, progressRes] = await Promise.all([
          fetch(`${API_URL}/lessons/${id}`),
          fetch(`${API_URL}/lessons/${id}/progress?userId=${userId}`)
        ]);

        if (lessonRes.ok) setLesson(await lessonRes.json());
        else {
          // Fallback
          setLesson({ id, courseId: 'course_1', title: 'Sample Lesson', contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1 });
        }

        if (progressRes.ok) {
          const prog = await progressRes.json();
          setProgress(prog);
          setCurrentPosition(prog.lastPosition || 0);
        } else {
          setProgress({ lessonId: id, userId, lastPosition: 0, isCompleted: false, bookmarks: [], notes: [] });
        }
      } catch (err) {
        setLesson({ id, courseId: 'course_1', title: 'Sample Lesson (Mock)', contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1 });
        setProgress({ lessonId: id, userId, lastPosition: 0, isCompleted: false, bookmarks: [], notes: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleProgress = (pos: number) => {
    setCurrentPosition(pos);
    // Debounced or periodic save would go here
    // fetch(`${API_URL}/lessons/${id}/progress?userId=${userId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ lastPosition: pos })
    // });
  };

  const saveProgress = async () => {
    await fetch(`${API_URL}/lessons/${id}/progress?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastPosition: currentPosition })
    });
    alert('Progress saved!');
  };

  const addNote = async () => {
    if (!noteInput.trim()) return;
    const res = await fetch(`${API_URL}/lessons/${id}/progress/notes?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: currentPosition, content: noteInput })
    });
    if (res.ok) {
      const newNote = await res.json();
      setProgress(p => p ? { ...p, notes: [...p.notes, newNote] } : null);
      setNoteInput('');
    }
  };

  const addBookmark = async () => {
    const label = prompt('Bookmark label:');
    if (!label) return;
    const res = await fetch(`${API_URL}/lessons/${id}/progress/bookmarks?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: currentPosition, label })
    });
    if (res.ok) {
      const newBm = await res.json();
      setProgress(p => p ? { ...p, bookmarks: [...p.bookmarks, newBm] } : null);
    }
  };

  if (loading) return <div className="wrap py-12 text-chalk">Loading...</div>;
  if (!lesson) return <div className="wrap py-12 text-chalk">Lesson not found</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-ink">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 border-b border-line flex items-center justify-between sticky top-0 bg-ink z-10">
          <div className="flex items-center gap-4">
            <Link href={`/courses/${lesson.courseId}`} className="text-dim hover:text-chalk">
              &larr; Back
            </Link>
            <h1 className="text-xl font-display font-bold">{lesson.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveProgress}>Save Progress</Button>
            <Button size="sm" onClick={addBookmark}>Bookmark Here</Button>
          </div>
        </div>
        
        <div className="p-6 max-w-4xl mx-auto">
          {lesson.contentType === 'video' && <VideoPlayer url={lesson.contentUrl!} onProgress={handleProgress} startPosition={progress?.lastPosition} />}
          {lesson.contentType === 'audio' && <AudioPlayer url={lesson.contentUrl!} onProgress={handleProgress} startPosition={progress?.lastPosition} />}
          {lesson.contentType === 'pdf' && <PdfViewer url={lesson.contentUrl!} startPosition={progress?.lastPosition ? Math.floor(progress.lastPosition) : 1} />}
          {lesson.contentType === 'markdown' && <MarkdownViewer content={lesson.textContent!} />}
          {lesson.contentType === 'code' && <CodeSnippet code={lesson.textContent!} />}
        </div>
      </main>

      {/* Sidebar (Notes & Bookmarks) */}
      <aside className="w-80 border-l border-line bg-ink-2 flex flex-col h-full shrink-0">
        <div className="flex border-b border-line text-sm font-display">
          <button 
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${activeTab === 'notes' ? 'border-signal text-signal' : 'border-transparent text-dim hover:text-chalk'}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
          <button 
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${activeTab === 'bookmarks' ? 'border-signal text-signal' : 'border-transparent text-dim hover:text-chalk'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bookmarks
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'notes' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {progress?.notes.map(n => (
                  <div key={n.id} className="bg-ink p-3 rounded border border-line text-sm">
                    <div className="mono text-[10px] text-signal mb-1">@ {Math.floor(n.position)}s</div>
                    <p className="text-chalk">{n.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <textarea 
                  className="w-full bg-ink border border-line rounded p-2 text-sm text-chalk resize-none focus:border-signal outline-none" 
                  rows={3} 
                  placeholder="Add a note..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                />
                <Button size="sm" className="w-full mt-2" onClick={addNote}>Save Note</Button>
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {progress?.bookmarks.map(b => (
                <div key={b.id} className="bg-ink p-3 rounded border border-line text-sm flex items-center justify-between group cursor-pointer hover:border-signal transition-colors" onClick={() => handleProgress(b.position)}>
                  <div>
                    <p className="text-chalk">{b.label}</p>
                    <div className="mono text-[10px] text-signal mt-1">@ {Math.floor(b.position)}s</div>
                  </div>
                  <div className="text-signal opacity-0 group-hover:opacity-100 transition-opacity">
                    &rarr;
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

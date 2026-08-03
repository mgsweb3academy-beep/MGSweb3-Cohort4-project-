'use client';

import { useState } from 'react';
import { Course } from 'types';
import { Button } from 'ui';
import { useRouter } from 'next/navigation';

interface Props {
  courses: Course[];
}

export default function DeleteCourseButton({ courses }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!selectedCourseId) return;
    
    // The modal itself acts as the confirmation per the new design

    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:3001/courses/${selectedCourseId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete course');
      }

      setIsOpen(false);
      setSelectedCourseId('');
      router.refresh(); // refresh the page to update the course list
    } catch (err) {
      console.error(err);
      alert('Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
      >
        <span>⚠️</span> Delete Course
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> Delete Course
            </h2>
            <p className="text-dim mb-4 text-sm font-medium">
              Are you sure you want to delete this course? You can not undo the effect of this action
            </p>
            
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white mb-6 focus:outline-none focus:border-amber-500"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="" disabled>Select a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.status.replace('_', ' ')})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <button 
                onClick={handleDelete}
                disabled={!selectedCourseId || isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

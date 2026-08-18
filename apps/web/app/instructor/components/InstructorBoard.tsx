import * as React from 'react';
import { Card } from 'ui';
import { MOCK_TASKS } from '@/lib/mock-data';

export function InstructorBoard() {
  // Taking the first 4 tasks to match the design description
  const boardTasks = MOCK_TASKS.slice(0, 4);

  return (
    <Card className="bg-[var(--ink-2)] p-6">
      <div className="mb-4">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">The board</p>
        <h3 className="text-[1.1rem] font-semibold text-[var(--chalk)] tracking-[-0.01em]">Every task, and who has it</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {boardTasks.map((task) => {
          // Hardcode the "3d" amber state for task-10 to match the exact requirement if it's "In Review"
          const isAmber = task.id === 'task-10' && task.state === 'In Review';
          const statusText = isAmber ? 'in review · 3d' : task.state.toLowerCase();
          
          return (
            <div key={task.id} className="flex items-center justify-between p-3 bg-[var(--ink)] border border-[var(--line)] rounded-[8px]">
              <div className="flex flex-col">
                <span className="font-semibold text-[0.9rem] text-[var(--chalk)]">{task.title}</span>
                <span className="text-[0.8rem] text-[var(--dim)]">{task.teamName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[0.75rem] uppercase tracking-[0.06em] px-2 py-1 rounded-full border ${isAmber ? 'text-[var(--mark)] border-[var(--mark)]/30 bg-[var(--mark)]/10' : 'text-[var(--dim)] border-[var(--line)]'}`}>
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Contextual manager log */}
      <div className="mt-4 pt-4 border-t border-[var(--line)]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_8px_var(--signal)] animate-pulse" />
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">Manager</span>
        </div>
        <p className="text-[0.9rem] text-[var(--dim)] mt-1">Reopened 3 tasks that were merged without a review.</p>
      </div>
    </Card>
  );
}

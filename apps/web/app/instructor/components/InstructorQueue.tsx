import * as React from 'react';
import { Card } from 'ui';

export function InstructorQueue() {
  return (
    <Card className="bg-[var(--ink-2)] p-6">
      <div className="mb-4">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">The queue</p>
        <h3 className="text-[1.1rem] font-semibold text-[var(--chalk)] tracking-[-0.01em]">Work waiting on you</h3>
      </div>
      
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex items-center justify-between p-3 bg-[var(--ink)] border border-[var(--line)] rounded-[8px]">
          <span className="text-[0.9rem] text-[var(--chalk)]">Escalated by manager</span>
          <span className="font-mono text-[0.9rem] text-[var(--mark)]">3</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-[var(--ink)] border border-[var(--line)] rounded-[8px]">
          <span className="text-[0.9rem] text-[var(--chalk)]">Peer review stalled</span>
          <span className="font-mono text-[0.9rem] text-[var(--signal)]">2</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-[var(--ink)] border border-[var(--line)] rounded-[8px]">
          <span className="text-[0.9rem] text-[var(--chalk)]">Resits</span>
          <span className="font-mono text-[0.9rem] text-[var(--signal)]">0</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-[var(--ink)] border border-[var(--line)] rounded-[8px]">
          <span className="text-[0.9rem] text-[var(--chalk)]">Oldest in queue</span>
          <span className="font-mono text-[0.9rem] text-[var(--mark)]">3d</span>
        </div>
      </div>
      
      {/* Contextual manager log */}
      <div className="mt-4 pt-4 border-t border-[var(--line)]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_8px_var(--signal)] animate-pulse" />
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">Manager</span>
        </div>
        <p className="text-[0.9rem] text-[var(--dim)] mt-1">Escalated 3 stalled task reviews to instructor.</p>
      </div>
    </Card>
  );
}

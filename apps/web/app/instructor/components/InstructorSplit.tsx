import * as React from 'react';
import { Card } from 'ui';

export function InstructorSplit() {
  return (
    <Card className="bg-[var(--ink-2)] p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">The split</p>
          <h3 className="text-[1.1rem] font-semibold text-[var(--chalk)] tracking-[-0.01em]">Who actually wrote it</h3>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          {/* Team 2 - Healthy Split (Teal) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-[0.9rem] font-medium text-[var(--chalk)]">Team 2</span>
              <span className="font-mono text-[0.8rem] text-[var(--signal)]">31 / 27 / 24 / 18</span>
            </div>
            <div className="flex h-[8px] w-full rounded-[3px] overflow-hidden gap-[1px]">
              <div className="h-full bg-[var(--signal)]/80" style={{ width: '31%' }} />
              <div className="h-full bg-[var(--signal)]/60" style={{ width: '27%' }} />
              <div className="h-full bg-[var(--signal)]/40" style={{ width: '24%' }} />
              <div className="h-full bg-[var(--signal)]/20" style={{ width: '18%' }} />
            </div>
          </div>

          {/* Team 4 - Lopsided Split (Amber) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-[0.9rem] font-medium text-[var(--chalk)]">Team 4</span>
              <span className="font-mono text-[0.8rem] text-[var(--mark)]">82 / 11 / 5 / 2</span>
            </div>
            <div className="flex h-[8px] w-full rounded-[3px] overflow-hidden gap-[1px]">
              <div className="h-full bg-[var(--mark)]/80" style={{ width: '82%' }} />
              <div className="h-full bg-[var(--mark)]/60" style={{ width: '11%' }} />
              <div className="h-full bg-[var(--mark)]/40" style={{ width: '5%' }} />
              <div className="h-full bg-[var(--mark)]/20" style={{ width: '2%' }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Contextual manager log */}
      <div className="mt-6 pt-4 border-t border-[var(--line)]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_8px_var(--signal)] animate-pulse" />
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">Manager</span>
        </div>
        <p className="text-[0.9rem] text-[var(--dim)] mt-1">Flagged Team 4 — one member wrote 82% of the contribution.</p>
      </div>
    </Card>
  );
}

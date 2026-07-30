import React from 'react';

type CohortPanelProps = {
  children: React.ReactNode;
  cohortName: string;
  learnersCount: number;
  teamsCount: number;
  currentWeek: number;
  totalWeeks: number;
  managerLog?: React.ReactNode;
};

export const CohortPanel = ({
  children,
  cohortName,
  learnersCount,
  teamsCount,
  currentWeek,
  totalWeeks,
  managerLog,
}: CohortPanelProps) => {
  return (
    <div className="mt-[4rem] bg-[linear-gradient(180deg,var(--ink-2),#131924)] border border-line rounded-[18px] p-[clamp(1rem,3vw,1.6rem)] text-left shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)] rise" style={{ '--d': '.55s' } as React.CSSProperties}>
      <div className="flex flex-wrap items-baseline gap-[.75rem] pb-[1.2rem] border-b border-line">
        <h2 className="font-display text-[1.05rem] font-semibold m-0 tracking-[-.01em]">{cohortName}</h2>
        <span className="mono">{learnersCount} learners · {teamsCount} teams</span>
        <span className="ml-auto font-mono text-[.72rem] tracking-[.1em] text-mark">
          Week {currentWeek} of {totalWeeks}
        </span>
      </div>

      {children}

      {managerLog && (
        <div className="flex items-start gap-[.7rem] flex-wrap mt-[1.4rem] pt-[1.2rem] border-t border-line manager">
          {managerLog}
        </div>
      )}
    </div>
  );
};

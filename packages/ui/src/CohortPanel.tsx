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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <h2 className="text-2xl font-semibold m-0 text-[var(--chalk)] tracking-tight">{cohortName}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-[var(--dim)] font-mono">
            <span>{learnersCount} learners</span>
            <span>·</span>
            <span>{teamsCount} teams</span>
          </div>
        </div>
        <div className="font-mono text-[0.72rem] tracking-[0.1em] text-[var(--signal)] uppercase px-3 py-1.5 bg-[var(--ink)] border border-[var(--line)] rounded-full self-start md:self-auto">
          Week {currentWeek} of {totalWeeks}
        </div>
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

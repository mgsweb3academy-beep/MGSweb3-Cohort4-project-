import React from 'react';

type Learner = [string, number[]];

type ContributionMatrixProps = {
  learners: Learner[];
  weeks?: number;
  currentWeek: number;
};

export const ContributionMatrix = ({ learners, weeks = 8, currentWeek }: ContributionMatrixProps) => {
  return (
    <div 
      className="grid gap-2 items-center mt-6 grid-cols-[90px_repeat(8,minmax(0,1fr))_40px] md:grid-cols-[140px_repeat(8,minmax(0,1fr))_60px] md:gap-3" 
      role="img" 
      aria-label={`Commit activity by learner across ${weeks} weeks. Weeks one to ${currentWeek} complete, week ${currentWeek + 1} in progress.`}
    >
      {/* Header row */}
      <div></div>
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={`head-${w}`} className={`font-mono text-xs tracking-wider text-center ${w === currentWeek ? 'text-[var(--signal)]' : 'text-[var(--dim)]'}`}>
          {w === currentWeek ? 'now' : `w${w + 1}`}
        </div>
      ))}
      <div></div>

      {/* Learner rows */}
      {learners.map(([name, weekData], r) => {
        let total = 0;
        return (
          <React.Fragment key={name}>
            <div className="text-sm font-medium text-[var(--chalk)] whitespace-nowrap overflow-hidden text-ellipsis">
              {name}
            </div>
            {Array.from({ length: weeks }).map((_, w) => {
              const c = weekData[w];
              let cls = 'h-6 md:h-8 rounded-md opacity-0 animate-[pop_.3s_ease_forwards] transition-all duration-300 hover:scale-110 cursor-pointer';
              if (c === undefined) {
                cls += ' bg-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)]';
              } else {
                total += c;
                if (c >= 6) cls += ' bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]';
                else if (c >= 3) cls += ' bg-emerald-600/70';
                else if (c >= 1) cls += ' bg-emerald-800/50';
                else cls += ' bg-[var(--ink-3)]';
              }
              if (w === currentWeek) {
                cls += ' shadow-[inset_0_0_0_2px_var(--signal)]';
              }
              const delay = (0.9 + (r * 0.05) + (w * 0.03)).toFixed(2);
              
              return (
                <div 
                  key={`cell-${name}-${w}`} 
                  className={cls} 
                  style={{ '--dd': `${delay}s`, animationDelay: `${delay}s` } as React.CSSProperties}
                />
              );
            })}
            <div className="font-mono text-sm font-semibold text-[var(--chalk)] text-right">
              {total}
            </div>
          </React.Fragment>
        );
      })}

      {/* Footer row */}
      <div className="col-[1/-1] font-mono text-xs text-[var(--dim)] pt-4 mt-2 border-t border-[var(--line)]">
        + 34 more learners
      </div>
    </div>
  );
};

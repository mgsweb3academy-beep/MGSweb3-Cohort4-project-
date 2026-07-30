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
      className="grid gap-[4px] items-center mt-[1.3rem] grid-cols-[68px_repeat(8,minmax(0,1fr))_42px] md:grid-cols-[108px_repeat(8,minmax(0,1fr))_54px] md:gap-[5px]" 
      role="img" 
      aria-label={`Commit activity by learner across ${weeks} weeks. Weeks one to ${currentWeek} complete, week ${currentWeek + 1} in progress.`}
    >
      {/* Header row */}
      <div></div>
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={`head-${w}`} className={`font-mono text-[.58rem] tracking-[.06em] text-center ${w === currentWeek ? 'text-mark' : 'text-[#5c6577]'}`}>
          {w === currentWeek ? 'now' : `w${w + 1}`}
        </div>
      ))}
      <div></div>

      {/* Learner rows */}
      {learners.map(([name, weekData], r) => {
        let total = 0;
        return (
          <React.Fragment key={name}>
            <div className="text-[.78rem] text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">
              {name}
            </div>
            {Array.from({ length: weeks }).map((_, w) => {
              const c = weekData[w];
              let cls = 'h-[17px] rounded-[3px] opacity-0 animate-[pop_.3s_ease_forwards]';
              if (c === undefined) {
                cls += ' bg-transparent shadow-[inset_0_0_0_1px_var(--line)]';
              } else {
                total += c;
                if (c >= 6) cls += ' bg-[rgba(127,209,193,.78)]';
                else if (c >= 3) cls += ' bg-[rgba(127,209,193,.45)]';
                else if (c >= 1) cls += ' bg-[rgba(127,209,193,.22)]';
                else cls += ' bg-ink-3';
              }
              if (w === currentWeek) {
                cls += ' shadow-[inset_0_0_0_1px_var(--mark)]';
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
            <div className="font-mono text-[.68rem] text-dim text-right">
              {total}
            </div>
          </React.Fragment>
        );
      })}

      {/* Footer row */}
      <div className="col-[1/-1] font-mono text-[.68rem] text-[#5c6577] pt-[.4rem]">
        + 34 more learners
      </div>
    </div>
  );
};

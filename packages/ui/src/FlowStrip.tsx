import React from 'react';

type FlowStep = {
  title: string;
  description: string;
  managed?: boolean;
};

type FlowStripProps = {
  steps: FlowStep[];
};

export const FlowStrip = ({ steps }: FlowStripProps) => {
  return (
    <div className="grid gap-[1px] bg-line border border-line rounded-[14px] overflow-hidden mt-[1.6rem] md:grid-cols-5">
      {steps.map((step, idx) => (
        <div key={idx} className="bg-ink-2 p-[1.1rem_1rem] flex flex-col gap-[.3rem] group">
          <span className="font-mono text-[.64rem] tracking-[.12em] text-[#5c6577]">
            {String(idx + 1).padStart(2, '0')}
          </span>
          <h3 className="font-display text-[.98rem] font-semibold m-0 tracking-[-.01em] flex items-center flex-wrap gap-1">
            {step.title}
            {step.managed && (
              <span className="font-mono text-[.58rem] tracking-[.1em] text-signal ml-[.5rem] uppercase font-normal whitespace-nowrap before:content-['·_']">
                managed
              </span>
            )}
          </h3>
          <p className="m-0 text-[.82rem] text-dim">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
};

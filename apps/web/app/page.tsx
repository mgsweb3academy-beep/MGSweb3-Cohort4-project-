import React from 'react';
import { 
  Nav, 
  CohortPanel, 
  ContributionMatrix, 
  FlowStrip, 
  Card,
  Tick,
  SplitBar,
  StatusPill
} from 'ui';

const LEARNERS: [string, number[]][] = [
  ['Adaeze O.',  [4, 6, 2, 0, 1]],
  ['Marcus B.',  [7, 5, 8, 6, 3]],
  ['Priya N.',   [2, 3, 3, 4, 2]],
  ['Tobi A.',    [9, 8, 7, 9, 5]],
  ['Ini E.',     [1, 0, 2, 1, 0]],
  ['Sam K.',     [5, 6, 4, 5, 4]],
  ['Zainab M.',  [3, 4, 6, 3, 2]]
];

const FLOW_STEPS = [
  { title: "Assigned", description: "The manager splits the brief into tasks and hands each one to a team.", managed: true },
  { title: "Branched", description: "A branch opens with the task. Everything after this happens in the repo." },
  { title: "Pushed", description: "Commits land against the task. Every learner's share is counted as it goes.", managed: true },
  { title: "Reviewed", description: "Two teammates read it first. You only see what survives that." },
  { title: "Closed", description: "Merged, marked, and written back to the learner's record.", managed: true }
];

export default function LandingPage() {
  return (
    <>
      <Nav />
      
      <main id="top">
        <section className="wrap pt-[clamp(7rem,16vh,11rem)] pb-[4rem] text-center">
          <div className="inline-flex items-center gap-[.65rem] p-[.35rem_.85rem] border border-line rounded-full bg-ink-2 font-mono text-[.72rem] tracking-[.08em] text-dim rise" style={{ '--d': '.05s' } as React.CSSProperties}>
            <span className="pulse" aria-hidden="true"></span>
            <span><b className="text-chalk font-medium">312 pushes</b> across 41 learners this week</span>
          </div>

          <h1 className="font-display font-extrabold text-[clamp(2.5rem,7vw,4.6rem)] leading-[.98] tracking-[-.035em] my-[1.8rem] mx-auto max-w-[16ch] text-balance rise" style={{ '--d': '.15s' } as React.CSSProperties}>
            Turning it in is <span className="relative whitespace-nowrap after:content-[''] after:absolute after:-left-[.06em] after:-right-[.06em] after:bottom-[.05em] after:h-[.16em] after:bg-mark after:opacity-85 after:-z-10 after:scale-x-0 after:origin-left after:animate-[swipe_.7s_cubic-bezier(.16,1,.3,1)_1.2s_forwards]">a push</span>.
          </h1>

          <p className="max-w-[50ch] mx-auto text-dim text-[clamp(1rem,2vw,1.12rem)] text-balance rise" style={{ '--d': '.28s' } as React.CSSProperties}>
            Corridor runs cohort programs where the work lives in git. Learners team up on tasks,
            push to a branch, and review each other. A manager watches every task and tells you
            who is stuck before they say so.
          </p>

          <div className="flex flex-wrap gap-[.7rem] justify-center mt-[2rem] rise" style={{ '--d': '.4s' } as React.CSSProperties}>
            <a className="btn btn-solid btn-lg" href="#demo">Start a cohort</a>
            <a className="btn btn-lg" href="#flow">See how a task moves</a>
          </div>

          <CohortPanel 
            cohortName="Backend Engineering — Cohort 07"
            learnersCount={41}
            teamsCount={9}
            currentWeek={5}
            totalWeeks={8}
            managerLog={
              <>
                <span className="pulse mt-[.45rem]" aria-hidden="true"></span>
                <div>
                  <div className="font-mono text-[.68rem] tracking-[.12em] uppercase text-signal mt-[.2rem]">Manager</div>
                </div>
                <p className="m-0 text-[.88rem] text-dim flex-[1_1_240px]">
                  Reopened <b className="text-chalk font-medium">3 tasks</b> that were merged without a review. Moved <b className="text-chalk font-medium">Auth service</b> into review. Flagged <b className="text-chalk font-medium">Team 4</b> — one member wrote 82% of the commits.
                </p>
                <span className="font-mono text-[.68rem] text-[#5c6577]">06:12</span>
              </>
            }
          >
            <ContributionMatrix 
              learners={LEARNERS} 
              weeks={8} 
              currentWeek={4} 
            />
          </CohortPanel>
        </section>

        <section className="wrap pt-[5.5rem] pb-[1rem]" id="flow">
          <p className="mono">How a task moves</p>
          <FlowStrip steps={FLOW_STEPS} />
        </section>

        <section className="wrap pt-[5.5rem] pb-[2rem]" id="views">
          <div className="max-w-[36ch]">
            <p className="mono">What you open on Monday</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-[-.03em] leading-[1.05] mt-[.6rem]">
              Three screens. The manager keeps them current.
            </h2>
          </div>

          <div className="grid gap-[1rem] mt-[2.5rem] md:grid-cols-3">
            <Card>
              <p className="mono">The board</p>
              <h3 className="font-display text-[1.1rem] font-semibold my-[.35rem] tracking-[-.01em]">Every task, and who has it</h3>
              <p className="m-0 text-dim text-[.9rem]">Tasks move on their own as commits land. Nobody drags a card.</p>
              <div className="mt-[1rem] border-t border-line pt-[.9rem] grid gap-[.55rem] text-[.85rem]">
                <div className="flex items-center gap-[.6rem]"><Tick status="done" /><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Request lifecycle</span><span className="ml-auto font-mono text-[.7rem] text-dim whitespace-nowrap">Team 2 · merged</span></div>
                <div className="flex items-center gap-[.6rem]"><Tick status="late" /><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Auth service</span><span className="ml-auto font-mono text-[.7rem] text-mark whitespace-nowrap">in review · 3d</span></div>
                <div className="flex items-center gap-[.6rem]"><Tick status="open" /><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Rate limiter</span><span className="ml-auto font-mono text-[.7rem] text-dim whitespace-nowrap">Team 6 · open</span></div>
                <div className="flex items-center gap-[.6rem]"><Tick status="open" /><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Queue worker</span><span className="ml-auto font-mono text-[.7rem] text-dim whitespace-nowrap">unassigned</span></div>
              </div>
            </Card>

            <Card>
              <p className="mono">The split</p>
              <h3 className="font-display text-[1.1rem] font-semibold my-[.35rem] tracking-[-.01em]">Who actually wrote it</h3>
              <p className="m-0 text-dim text-[.9rem]">Commit share per team, so one person carrying four is visible in a glance.</p>
              <div className="mt-[1rem] border-t border-line pt-[.9rem] grid gap-[.55rem] text-[.85rem]">
                <div className="flex items-center gap-[.6rem]"><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Team 4</span><span className="ml-auto font-mono text-[.7rem] text-mark whitespace-nowrap">82 / 11 / 5 / 2</span></div>
                <SplitBar shares={[
                  { share: 82, color: '#e8a54b' },
                  { share: 11, color: '#7fd1c1' },
                  { share: 5, color: 'rgba(127,209,193,.5)' },
                  { share: 2, color: 'rgba(127,209,193,.3)' }
                ]} />
                <div className="flex items-center gap-[.6rem] mt-[.5rem]"><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Team 2</span><span className="ml-auto font-mono text-[.7rem] text-dim whitespace-nowrap">31 / 27 / 24 / 18</span></div>
                <SplitBar shares={[
                  { share: 31, color: '#7fd1c1' },
                  { share: 27, color: 'rgba(127,209,193,.8)' },
                  { share: 24, color: 'rgba(127,209,193,.6)' },
                  { share: 18, color: 'rgba(127,209,193,.4)' }
                ]} />
              </div>
            </Card>

            <Card>
              <p className="mono">The queue</p>
              <h3 className="font-display text-[1.1rem] font-semibold my-[.35rem] tracking-[-.01em]">Work waiting on you</h3>
              <p className="m-0 text-dim text-[.9rem]">Peer review clears most of it. What reaches you is what needed a person.</p>
              <div className="mt-[1rem] border-t border-line pt-[.9rem] grid gap-[.55rem] text-[.85rem]">
                <div className="flex items-center gap-[.6rem]"><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Escalated by manager</span><span className="ml-auto font-mono text-[.7rem] text-mark whitespace-nowrap">4</span></div>
                <div className="flex items-center gap-[.6rem]"><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Peer review stalled</span><span className="ml-auto font-mono text-[.7rem] text-dim whitespace-nowrap">6</span></div>
                <div className="flex items-center gap-[.6rem]"><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Resits</span><span className="ml-auto font-mono text-[.7rem] text-dim whitespace-nowrap">2</span></div>
                <div className="flex items-center gap-[.6rem]"><span className="text-[#b9c0cc] whitespace-nowrap overflow-hidden text-ellipsis">Oldest in queue</span><span className="ml-auto font-mono text-[.7rem] text-dim whitespace-nowrap">3 days</span></div>
              </div>
            </Card>
          </div>
        </section>

        <section className="wrap pt-[6rem] pb-[4rem] text-center" id="demo">
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.2rem)] tracking-[-.03em] mx-auto max-w-[18ch] leading-[1.02] text-balance mb-[.8rem]">
            Bring your next intake in.
          </h2>
          <p className="text-dim max-w-[44ch] mx-auto mb-[2rem]">
            Set the start date, connect the org on GitHub, invite the roster. A cohort takes about an afternoon to stand up.
          </p>
          <div className="flex flex-wrap gap-[.7rem] justify-center mt-[2rem]">
            <a className="btn btn-solid btn-lg" href="#demo">Start a cohort</a>
            <a className="btn btn-lg" href="#docs">Read the docs</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line pt-[2rem] pb-[3rem]">
        <div className="wrap flex flex-wrap gap-[1rem] items-center text-[.85rem] text-dim">
          <span>Corridor</span>
          <nav className="flex gap-[1.2rem] ml-auto">
            <a href="#docs" className="hover:text-chalk">Docs</a>
            <a href="#pricing" className="hover:text-chalk">Pricing</a>
            <a href="#changelog" className="hover:text-chalk">Changelog</a>
            <a href="#contact" className="hover:text-chalk">Contact</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

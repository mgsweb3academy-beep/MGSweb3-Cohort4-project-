// apps/web/lib/cohort-utils.ts
// Utility for dynamic current-week calculations across timezone boundaries for Cohorts.

export interface CohortWeekStatus {
  currentWeek: number;
  weekCount: number;
  isUpcoming: boolean;
  isCompleted: boolean;
  formatted: string; // e.g. "Week 5 of 8"
  headerFormatted: string; // e.g. "Week 5 of 8"
}

/**
 * Calculates the current week of a Cohort dynamically based on its start date and total week count.
 * @param startDateISO YYYY-MM-DD or ISO date string representing cohort launch
 * @param weekCount Total weeks scheduled for the cohort
 * @param referenceDate Optional date object for testing (defaults to now)
 */
export function calculateCohortWeek(
  startDateISO: string,
  weekCount: number,
  referenceDate: Date = new Date()
): CohortWeekStatus {
  const start = new Date(startDateISO);
  start.setHours(0, 0, 0, 0);

  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerWeek = 7 * msPerDay;

  const diffMs = ref.getTime() - start.getTime();

  if (diffMs < 0) {
    return {
      currentWeek: 0,
      weekCount,
      isUpcoming: true,
      isCompleted: false,
      formatted: `Starts in ${Math.ceil(Math.abs(diffMs) / msPerDay)} days`,
      headerFormatted: `Upcoming (0 of ${weekCount} weeks)`,
    };
  }

  const rawWeek = Math.floor(diffMs / msPerWeek) + 1;

  if (rawWeek > weekCount) {
    return {
      currentWeek: weekCount,
      weekCount,
      isUpcoming: false,
      isCompleted: true,
      formatted: `Completed (${weekCount} of ${weekCount} weeks)`,
      headerFormatted: `Completed (${weekCount} of ${weekCount} weeks)`,
    };
  }

  return {
    currentWeek: rawWeek,
    weekCount,
    isUpcoming: false,
    isCompleted: false,
    formatted: `Week ${rawWeek} of ${weekCount}`,
    headerFormatted: `Week ${rawWeek} of ${weekCount}`,
  };
}

/**
 * Helper to build standard Cohort Header meta string:
 * e.g. "Backend Engineering — Cohort 07 · 41 learners · 9 teams · Week 5 of 8"
 */
export function formatCohortHeaderMeta(
  cohortName: string,
  learnerCount: number,
  teamCount: number,
  startDateISO: string,
  weekCount: number
): {
  fullName: string;
  learnerMeta: string;
  weekMeta: string;
  fullMetaString: string;
} {
  const weekInfo = calculateCohortWeek(startDateISO, weekCount);
  const fullName = cohortName;
  const learnerMeta = `${learnerCount} learners · ${teamCount} teams`;
  const weekMeta = weekInfo.headerFormatted;

  return {
    fullName,
    learnerMeta,
    weekMeta,
    fullMetaString: `${fullName} · ${learnerMeta} · ${weekMeta}`,
  };
}

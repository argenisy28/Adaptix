import type {
  WorkoutHistorySession,
} from "../types/workout";


type TrainingDashboardProps = {
  workoutHistory: WorkoutHistorySession[];
};


type WeeklyActivity = {
  label: string;
  workouts: number;
};


function TrainingDashboard({
  workoutHistory,
}: TrainingDashboardProps) {
  const completedWorkouts =
    workoutHistory.filter(
      (session) =>
        session.completed_at !== null
    );


  const completedSets =
    workoutHistory.flatMap(
      (session) =>
        session.sets.filter(
          (set) =>
            set.completed
        )
    );


  const uniqueExercises =
    new Set(
      completedSets.map(
        (set) =>
          set.exercise_name
      )
    );


  const personalRecordExercises =
    new Set(
      completedSets
        .filter(
          (set) =>
            set.weight !== null
        )
        .map(
          (set) =>
            set.exercise_name
        )
    );


  const latestWorkout =
    getLatestCompletedWorkout(
      workoutHistory
    );


  const weeklyActivity =
    getWeeklyActivity(
      workoutHistory
    );


  const highestWeeklyCount =
    Math.max(
      ...weeklyActivity.map(
        (week) =>
          week.workouts
      ),
      1
    );


  return (
    <section
      id="dashboard"
      className="dashboard-section"
    >

      {/* Header */}

      <div className="dashboard-header">

        <div>
          <span className="dashboard-label">
            Training overview
          </span>

          <h2>
            Dashboard
          </h2>

          <p>
            A summary of your logged
            workouts and training activity.
          </p>
        </div>

      </div>


      {/* Main Statistics */}

      <div className="dashboard-stats-grid">

        <DashboardStat
          label="Completed Workouts"
          value={
            completedWorkouts.length
          }
          icon="✓"
        />

        <DashboardStat
          label="Sets Logged"
          value={
            completedSets.length
          }
          icon="≡"
        />

        <DashboardStat
          label="Exercises Tracked"
          value={
            uniqueExercises.size
          }
          icon="◉"
        />

        <DashboardStat
          label="Personal Records"
          value={
            personalRecordExercises.size
          }
          icon="★"
        />

      </div>


      {/* Secondary Information */}

      <div className="dashboard-details-grid">

        {/* Latest Workout */}

        <article className="dashboard-card">

          <div className="dashboard-card-heading">

            <span>
              Latest Workout
            </span>

          </div>


          {latestWorkout ? (

            <div className="dashboard-latest-workout">

              <h3>
                {
                  latestWorkout.day_name
                }
              </h3>

              <p>
                {
                  latestWorkout.program_name
                }
              </p>

              <div className="dashboard-latest-meta">

                <span>
                  {
                    formatDate(
                      latestWorkout.completed_at ??
                        latestWorkout.started_at
                    )
                  }
                </span>

                <span>
                  {
                    latestWorkout.sets.filter(
                      (set) =>
                        set.completed
                    ).length
                  }{" "}
                  sets logged
                </span>

              </div>

            </div>

          ) : (

            <div className="dashboard-empty">

              <p>
                Complete a workout to
                begin tracking your
                training activity.
              </p>

            </div>

          )}

        </article>


        {/* Weekly Activity */}

        <article className="dashboard-card">

          <div className="dashboard-card-heading">

            <span>
              Weekly Activity
            </span>

            <small>
              Last 4 weeks
            </small>

          </div>


          <div className="weekly-activity-chart">

            {weeklyActivity.map(
              (
                week,
                index
              ) => {

                const height =
                  (
                    week.workouts /
                    highestWeeklyCount
                  ) *
                  100;


                return (
                  <div
                    className="weekly-activity-column"
                    key={
                      `${week.label}-${index}`
                    }
                  >

                    <div className="weekly-bar-area">

                      <span className="weekly-bar-value">
                        {
                          week.workouts
                        }
                      </span>


                      <div
                        className="weekly-bar"
                        style={{
                          height:
                            `${Math.max(
                              height,
                              week.workouts > 0
                                ? 12
                                : 3
                            )}%`,
                        }}
                      />

                    </div>


                    <span className="weekly-label">
                      {
                        week.label
                      }
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </article>

      </div>

    </section>
  );
}


type DashboardStatProps = {
  label: string;
  value: number;
  icon: string;
};


function DashboardStat({
  label,
  value,
  icon,
}: DashboardStatProps) {
  return (
    <article className="dashboard-stat-card">

      <div className="dashboard-stat-icon">
        {icon}
      </div>


      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </div>

    </article>
  );
}


function getLatestCompletedWorkout(
  workoutHistory:
    WorkoutHistorySession[]
) {
  return workoutHistory
    .filter(
      (session) =>
        session.completed_at !== null
    )
    .sort(
      (a, b) =>
        new Date(
          b.completed_at ??
            b.started_at
        ).getTime() -
        new Date(
          a.completed_at ??
            a.started_at
        ).getTime()
    )[0] ?? null;
}


function getWeeklyActivity(
  workoutHistory:
    WorkoutHistorySession[]
): WeeklyActivity[] {
  const weeks:
    WeeklyActivity[] = [];


  const today =
    new Date();


  for (
    let weekOffset = 3;
    weekOffset >= 0;
    weekOffset -= 1
  ) {
    const end =
      new Date(
        today
      );


    end.setHours(
      23,
      59,
      59,
      999
    );


    end.setDate(
      today.getDate() -
        weekOffset * 7
    );


    const start =
      new Date(
        end
      );


    start.setDate(
      end.getDate() -
        6
    );


    start.setHours(
      0,
      0,
      0,
      0
    );


    const workouts =
      workoutHistory.filter(
        (session) => {
          if (
            !session.completed_at
          ) {
            return false;
          }


          const completed =
            new Date(
              session.completed_at
            );


          return (
            completed >=
              start &&
            completed <=
              end
          );
        }
      ).length;


    weeks.push({
      label:
        formatWeekLabel(
          start
        ),

      workouts,
    });
  }


  return weeks;
}


function formatWeekLabel(
  date: Date
) {
  return date.toLocaleDateString(
    [],
    {
      month:
        "short",

      day:
        "numeric",
    }
  );
}


function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    [],
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  );
}


export default TrainingDashboard;
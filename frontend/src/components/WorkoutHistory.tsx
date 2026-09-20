import type {
  WeightUnit,
  WorkoutHistorySession,
  WorkoutSetLog,
} from "../types/workout";

import {
  convertWeight,
  formatWeightNumber,
} from "../utils/weight";


type WorkoutHistoryProps = {
  sessions: WorkoutHistorySession[];

  loading: boolean;

  error: string;

  weightUnit: WeightUnit;

  onRefresh: () => void;
};


function WorkoutHistory({
  sessions,
  loading,
  error,
  weightUnit,
  onRefresh,
}: WorkoutHistoryProps) {
  function formatDate(
    dateString: string
  ) {
    return new Date(
      dateString
    ).toLocaleDateString(
      undefined,
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "numeric",
      }
    );
  }


  function formatTime(
    dateString: string
  ) {
    return new Date(
      dateString
    ).toLocaleTimeString(
      [],
      {
        hour:
          "numeric",

        minute:
          "2-digit",
      }
    );
  }


  function getDuration(
    session:
      WorkoutHistorySession
  ) {
    if (
      !session.completed_at
    ) {
      return "Not completed";
    }


    const start =
      new Date(
        session.started_at
      ).getTime();


    const end =
      new Date(
        session.completed_at
      ).getTime();


    const totalMinutes =
      Math.max(
        0,
        Math.round(
          (
            end -
            start
          ) /
            60000
        )
      );


    if (
      totalMinutes <
      60
    ) {
      return `${totalMinutes} min`;
    }


    const hours =
      Math.floor(
        totalMinutes /
        60
      );


    const minutes =
      totalMinutes %
      60;


    if (
      minutes ===
      0
    ) {
      return `${hours} hr`;
    }


    return (
      `${hours} hr ` +
      `${minutes} min`
    );
  }


  function groupSetsByExercise(
    session:
      WorkoutHistorySession
  ) {
    const groups =
      new Map<
        string,
        WorkoutHistorySession["sets"]
      >();


    session.sets.forEach(
      (set) => {
        const existing =
          groups.get(
            set.exercise_name
          );


        if (
          existing
        ) {
          existing.push(
            set
          );
        } else {
          groups.set(
            set.exercise_name,
            [
              set,
            ]
          );
        }
      }
    );


    return Array.from(
      groups.entries()
    );
  }


  function formatSetWeight(
    set: WorkoutSetLog
  ) {
    if (
      set.weight ===
      null
    ) {
      return "—";
    }


    const convertedWeight =
      convertWeight(
        set.weight,
        set.weight_unit,
        weightUnit
      );


    return (
      `${formatWeightNumber(
        convertedWeight
      )} ${weightUnit}`
    );
  }


  return (
    <section
      id="history"
      className="history-section"
    >

      {/* Header */}

      <div className="history-header">

        <div>

          <h2>
            Workout History
          </h2>

          <p>
            Review your completed
            training sessions and
            logged performance.
          </p>

        </div>


        <button
          type="button"
          onClick={
            onRefresh
          }
          disabled={
            loading
          }
        >
          {
            loading
              ? "Refreshing..."
              : "Refresh History"
          }
        </button>

      </div>


      {/* Error */}

      {error && (

        <p className="error-message">
          {error}
        </p>

      )}


      {/* Empty State */}

      {!loading &&
        sessions.length ===
          0 && (

          <div className="history-empty">

            <h3>
              No workout history yet
            </h3>

            <p>
              Complete a workout and
              your training history
              will appear here.
            </p>

          </div>

        )}


      {/* Workout Sessions */}

      <div className="history-list">

        {sessions.map(
          (session) => {
            const exerciseGroups =
              groupSetsByExercise(
                session
              );


            return (
              <details
                className="history-session"
                key={
                  session.id
                }
              >

                {/* Session Summary */}

                <summary className="history-session-summary">

                  <div>

                    <span className="history-status">
                      {
                        session.completed_at
                          ? "Completed"
                          : "Incomplete"
                      }
                    </span>


                    <h3>
                      {
                        session.day_name
                      }
                    </h3>


                    <p>
                      {
                        session.program_name
                      }
                    </p>

                  </div>


                  <div className="history-summary-meta">

                    <span>
                      {
                        formatDate(
                          session.started_at
                        )
                      }
                    </span>


                    <span className="history-expand-label">
                      View Workout
                    </span>

                  </div>

                </summary>


                {/* Session Information */}

                <div className="history-session-meta">

                  <span>
                    Started:{" "}
                    {
                      formatTime(
                        session.started_at
                      )
                    }
                  </span>


                  <span>
                    Duration:{" "}
                    {
                      getDuration(
                        session
                      )
                    }
                  </span>


                  <span>
                    {
                      session.sets.length
                    }{" "}
                    logged sets
                  </span>


                  <span>
                    Displaying:{" "}
                    <strong>
                      {
                        weightUnit
                      }
                    </strong>
                  </span>

                </div>


                {/* Exercises */}

                {exerciseGroups.length ===
                0 ? (

                  <p className="history-no-sets">
                    No sets were logged
                    during this workout.
                  </p>

                ) : (

                  <div className="history-exercises">

                    {exerciseGroups.map(
                      ([
                        exerciseName,
                        sets,
                      ]) => (

                        <article
                          className="history-exercise"
                          key={
                            exerciseName
                          }
                        >

                          <h4>
                            {
                              exerciseName
                            }
                          </h4>


                          <div className="history-set-list">

                            {sets
                              .slice()
                              .sort(
                                (
                                  a,
                                  b
                                ) =>
                                  a.set_number -
                                  b.set_number
                              )
                              .map(
                                (
                                  set
                                ) => (

                                  <div
                                    className="history-set"
                                    key={
                                      set.id
                                    }
                                  >

                                    <span>
                                      Set{" "}
                                      {
                                        set.set_number
                                      }
                                    </span>


                                    <strong>
                                      {
                                        formatSetWeight(
                                          set
                                        )
                                      }
                                    </strong>


                                    <span>
                                      ×
                                    </span>


                                    <strong>
                                      {
                                        set.reps ??
                                        "—"
                                      }{" "}
                                      reps
                                    </strong>

                                  </div>

                                )
                              )}

                          </div>

                        </article>

                      )
                    )}

                  </div>

                )}


                {/* Notes */}

                {session.notes && (

                  <div className="history-notes">

                    <strong>
                      Notes
                    </strong>

                    <p>
                      {
                        session.notes
                      }
                    </p>

                  </div>

                )}

              </details>
            );
          }
        )}

      </div>

    </section>
  );
}


export default WorkoutHistory;
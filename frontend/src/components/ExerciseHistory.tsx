import ExerciseProgressChart from "./ExerciseProgressChart";

import type {
  WeightUnit,
  WorkoutHistorySession,
  WorkoutSetLog,
} from "../types/workout";

import {
  convertWeight,
  formatWeightNumber,
} from "../utils/weight";


type ExerciseHistoryProps = {
  exerciseName: string;

  workoutHistory:
    WorkoutHistorySession[];

  weightUnit: WeightUnit;

  onClose: () => void;
};


type ExerciseSession = {
  session:
    WorkoutHistorySession;

  sets:
    WorkoutSetLog[];
};


function ExerciseHistory({
  exerciseName,
  workoutHistory,
  weightUnit,
  onClose,
}: ExerciseHistoryProps) {
  const exerciseSessions =
    getExerciseSessions(
      exerciseName,
      workoutHistory
    );


  return (
    <section
      className="exercise-history"
      id="exercise-history"
    >

      <div className="exercise-history-header">

        <div>

          <span className="exercise-history-label">
            Exercise performance
          </span>

          <h2>
            {exerciseName} History
          </h2>

          <p>
            Review your previously logged
            sets and performance.
          </p>

        </div>


        <button
          type="button"
          className="exercise-history-close"
          onClick={
            onClose
          }
        >
          Close
        </button>

      </div>


      <ExerciseProgressChart
        exerciseName={
          exerciseName
        }

        workoutHistory={
          workoutHistory
        }

        weightUnit={
          weightUnit
        }
      />


      {exerciseSessions.length === 0 ? (

        <div className="exercise-history-empty">

          <h3>
            No history available
          </h3>

          <p>
            Complete a workout containing{" "}
            {exerciseName} to begin
            tracking its history.
          </p>

        </div>

      ) : (

        <div className="exercise-history-list">

          {exerciseSessions.map(
            ({
              session,
              sets,
            }) => (

              <article
                className="exercise-history-session"
                key={
                  session.id
                }
              >

                <div className="exercise-history-session-header">

                  <div>

                    <h3>
                      {formatDate(
                        session.started_at
                      )}
                    </h3>

                    <p>
                      {session.program_name}
                      {" • "}
                      {session.day_name}
                    </p>

                  </div>


                  <span className="exercise-history-status">
                    {
                      session.completed_at
                        ? "Completed"
                        : "Incomplete"
                    }
                  </span>

                </div>


                <div className="exercise-history-table">

                  <div
                    className="
                      exercise-history-row
                      exercise-history-heading
                    "
                  >

                    <span>
                      Set
                    </span>

                    <span>
                      Weight
                    </span>

                    <span>
                      Reps
                    </span>

                  </div>


                  {sets.map(
                    (set) => (

                      <div
                        className="exercise-history-row"
                        key={
                          set.id
                        }
                      >

                        <span>
                          {
                            set.set_number
                          }
                        </span>

                        <span>
                          {formatWeight(
                            set,
                            weightUnit
                          )}
                        </span>

                        <span>
                          {
                            set.reps ??
                            "—"
                          }
                        </span>

                      </div>

                    )
                  )}

                </div>

              </article>

            )
          )}

        </div>

      )}

    </section>
  );
}


function getExerciseSessions(
  exerciseName: string,
  workoutHistory:
    WorkoutHistorySession[]
): ExerciseSession[] {
  return workoutHistory
    .map(
      (session) => ({
        session,

        sets:
          session.sets
            .filter(
              (set) =>
                set.exercise_name ===
                  exerciseName &&
                set.completed
            )
            .sort(
              (a, b) =>
                a.set_number -
                b.set_number
            ),
      })
    )
    .filter(
      ({ sets }) =>
        sets.length > 0
    )
    .sort(
      (a, b) =>
        new Date(
          b.session.started_at
        ).getTime() -
        new Date(
          a.session.started_at
        ).getTime()
    );
}


function formatWeight(
  set: WorkoutSetLog,
  weightUnit: WeightUnit
) {
  if (
    set.weight === null
  ) {
    return "—";
  }


  const convertedWeight =
    convertWeight(
      set.weight,
      set.weight_unit,
      weightUnit
    );


  return `${formatWeightNumber(
    convertedWeight
  )} ${weightUnit}`;
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


export default ExerciseHistory;
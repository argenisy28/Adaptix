import type {
  WorkoutHistorySession,
  WorkoutSetLog,
} from "../types/workout";


type PersonalRecordsProps = {
  workoutHistory: WorkoutHistorySession[];
};


type ExerciseRecord = {
  exerciseName: string;
  weight: number;
  weightUnit: "lb" | "kg";
  reps: number | null;
  date: string;
};


function PersonalRecords({
  workoutHistory,
}: PersonalRecordsProps) {
  const records =
    getPersonalRecords(
      workoutHistory
    );


  return (
    <section
      id="records"
      className="records-section"
    >
      <div className="records-header">
        <div>
          <span className="records-label">
            Training milestones
          </span>

          <h2>
            Personal Records
          </h2>

          <p>
            Your heaviest logged set for
            each exercise.
          </p>
        </div>
      </div>


      {records.length === 0 ? (
        <div className="records-empty">
          <span className="records-empty-icon">
            🏆
          </span>

          <h3>
            No personal records yet
          </h3>

          <p>
            Complete workouts and log
            your sets to start building
            your record board.
          </p>
        </div>
      ) : (
        <div className="records-grid">

          {records.map(
            (record) => (
              <article
                className="record-card"
                key={
                  record.exerciseName
                }
              >
                <div className="record-card-top">
                  <span className="record-trophy">
                    🏆
                  </span>

                  <span className="record-badge">
                    PR
                  </span>
                </div>


                <h3>
                  {
                    record.exerciseName
                  }
                </h3>


                <div className="record-performance">

                  <strong>
                    {
                      formatWeight(
                        record.weight
                      )
                    }
                  </strong>

                  <span>
                    {
                      record.weightUnit
                    }
                  </span>

                  {record.reps !== null && (
                    <>
                      <span className="record-divider">
                        ×
                      </span>

                      <strong>
                        {record.reps}
                      </strong>

                      <span>
                        reps
                      </span>
                    </>
                  )}

                </div>


                <p className="record-date">
                  Set on{" "}
                  {
                    formatDate(
                      record.date
                    )
                  }
                </p>
              </article>
            )
          )}

        </div>
      )}
    </section>
  );
}


function getPersonalRecords(
  workoutHistory:
    WorkoutHistorySession[]
) {
  const records =
    new Map<
      string,
      ExerciseRecord
    >();


  workoutHistory.forEach(
    (session) => {

      session.sets.forEach(
        (set) => {

          if (
            !set.completed ||
            set.weight === null
          ) {
            return;
          }


          const currentRecord =
            records.get(
              set.exercise_name
            );


          if (
            !currentRecord ||
            set.weight >
              currentRecord.weight
          ) {
            records.set(
              set.exercise_name,
              createRecord(
                set,
                session.started_at
              )
            );

            return;
          }


          // If the weight is tied,
          // prefer the set with more reps.
          if (
            set.weight ===
              currentRecord.weight &&
            set.reps !== null &&
            (
              currentRecord.reps ===
                null ||
              set.reps >
                currentRecord.reps
            )
          ) {
            records.set(
              set.exercise_name,
              createRecord(
                set,
                session.started_at
              )
            );
          }
        }
      );
    }
  );


  return Array.from(
    records.values()
  ).sort(
    (a, b) =>
      a.exerciseName.localeCompare(
        b.exerciseName
      )
  );
}


function createRecord(
  set: WorkoutSetLog,
  date: string
): ExerciseRecord {
  return {
    exerciseName:
      set.exercise_name,

    weight:
      set.weight ?? 0,

    weightUnit:
      set.weight_unit,

    reps:
      set.reps,

    date,
  };
}


function formatWeight(
  weight: number
) {
  if (
    Number.isInteger(weight)
  ) {
    return weight.toString();
  }

  return weight.toFixed(1);
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


export default PersonalRecords;
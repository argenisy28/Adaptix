import type {
  WorkoutHistorySession,
  WorkoutSetLog,
} from "../types/workout";


type PersonalRecordsProps = {
  workoutHistory: WorkoutHistorySession[];

  onViewHistory: (
    exerciseName: string
  ) => void;
};


type ExerciseRecord = {
  exerciseName: string;
  set: WorkoutSetLog;
};


function PersonalRecords({
  workoutHistory,
  onViewHistory,
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


      {records.length === 0 ? (
        <div className="records-empty">

          <h3>
            No personal records yet
          </h3>

          <p>
            Complete workouts and log
            your sets to begin building
            your record history.
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

                <div className="record-card-header">

                  <span className="record-trophy">
                    🏆
                  </span>

                  <span className="record-badge">
                    PR
                  </span>

                </div>


                <h3>
                  {record.exerciseName}
                </h3>


                <div className="record-performance">

                  <strong>
                    {formatWeight(
                      record.set
                    )}
                  </strong>

                  <span>
                    ×
                  </span>

                  <strong>
                    {record.set.reps ?? "—"}
                  </strong>

                  <span>
                    reps
                  </span>

                </div>


                <p className="record-date">
                  Set on{" "}
                  {formatDate(
                    record.set.created_at
                  )}
                </p>


                <button
                  type="button"
                  className="record-history-button"
                  onClick={() =>
                    onViewHistory(
                      record.exerciseName
                    )
                  }
                >
                  View History
                </button>

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
): ExerciseRecord[] {
  const records =
    new Map<
      string,
      WorkoutSetLog
    >();


  for (
    const session
    of workoutHistory
  ) {
    for (
      const set
      of session.sets
    ) {
      if (
        !set.completed ||
        set.weight === null
      ) {
        continue;
      }


      const existingRecord =
        records.get(
          set.exercise_name
        );


      if (!existingRecord) {
        records.set(
          set.exercise_name,
          set
        );

        continue;
      }


      const currentWeight =
        set.weight;

      const recordWeight =
        existingRecord.weight ?? 0;


      const currentReps =
        set.reps ?? 0;

      const recordReps =
        existingRecord.reps ?? 0;


      if (
        currentWeight >
          recordWeight ||
        (
          currentWeight ===
            recordWeight &&
          currentReps >
            recordReps
        )
      ) {
        records.set(
          set.exercise_name,
          set
        );
      }
    }
  }


  return Array.from(
    records.entries()
  )
    .map(
      ([
        exerciseName,
        set,
      ]) => ({
        exerciseName,
        set,
      })
    )
    .sort(
      (a, b) =>
        a.exerciseName.localeCompare(
          b.exerciseName
        )
    );
}


function formatWeight(
  set: WorkoutSetLog
) {
  if (set.weight === null) {
    return "—";
  }


  const weight =
    Number.isInteger(
      set.weight
    )
      ? set.weight.toString()
      : set.weight.toFixed(1);


  return `${weight} ${set.weight_unit}`;
}


function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


export default PersonalRecords;
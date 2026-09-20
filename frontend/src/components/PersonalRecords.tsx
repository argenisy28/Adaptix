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

  currentRecord:
    WorkoutSetLog;

  previousRecord:
    WorkoutSetLog | null;

  estimatedOneRepMax:
    number | null;

  improvement:
    number | null;

  totalSets:
    number;
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
          Your strongest performances
          and estimated strength
          progression.
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

                {/* Header */}

                <div className="record-card-header">

                  <span className="record-trophy">
                    🏆
                  </span>

                  <span className="record-badge">
                    PR
                  </span>

                </div>


                {/* Exercise */}

                <h3>
                  {record.exerciseName}
                </h3>


                {/* Current Record */}

                <div className="record-performance">

                  <strong>
                    {formatWeight(
                      record.currentRecord
                    )}
                  </strong>

                  <span>
                    ×
                  </span>

                  <strong>
                    {
                      record.currentRecord
                        .reps ??
                      "—"
                    }
                  </strong>

                  <span>
                    reps
                  </span>

                </div>


                {/* Analytics */}

                <div className="record-analytics">

                  <div className="record-analytic">

                    <span>
                      Estimated 1RM
                    </span>

                    <strong>
                      {
                        record
                          .estimatedOneRepMax !==
                        null
                          ? `${formatNumber(
                              record
                                .estimatedOneRepMax
                            )} ${
                              record
                                .currentRecord
                                .weight_unit
                            }`
                          : "—"
                      }
                    </strong>

                  </div>


                  <div className="record-analytic">

                    <span>
                      Previous Best
                    </span>

                    <strong>
                      {
                        record.previousRecord
                          ? formatWeight(
                              record.previousRecord
                            )
                          : "First PR"
                      }
                    </strong>

                  </div>


                  <div className="record-analytic">

                    <span>
                      Improvement
                    </span>

                    <strong
                      className={
                        record.improvement !==
                          null &&
                        record.improvement >
                          0
                          ? "record-improvement-positive"
                          : ""
                      }
                    >
                      {
                        record.improvement !==
                        null
                          ? `${record.improvement > 0 ? "+" : ""}${formatNumber(
                              record.improvement
                            )} ${
                              record
                                .currentRecord
                                .weight_unit
                            }`
                          : "—"
                      }
                    </strong>

                  </div>


                  <div className="record-analytic">

                    <span>
                      Sets Logged
                    </span>

                    <strong>
                      {
                        record.totalSets
                      }
                    </strong>

                  </div>

                </div>


                {/* Date */}

                <p className="record-date">
                  Set on{" "}
                  {formatDate(
                    record.currentRecord
                      .created_at
                  )}
                </p>


                {/* History */}

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
  const exerciseSets =
    new Map<
      string,
      WorkoutSetLog[]
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


      const existing =
        exerciseSets.get(
          set.exercise_name
        ) ?? [];


      existing.push(
        set
      );


      exerciseSets.set(
        set.exercise_name,
        existing
      );
    }
  }


  const records:
    ExerciseRecord[] = [];


  for (
    const [
      exerciseName,
      sets,
    ] of exerciseSets
  ) {
    const sortedByDate =
      [...sets].sort(
        (a, b) =>
          new Date(
            a.created_at
          ).getTime() -
          new Date(
            b.created_at
          ).getTime()
      );


    const recordProgression:
      WorkoutSetLog[] = [];


    let bestSet:
      WorkoutSetLog | null =
        null;


    for (
      const set
      of sortedByDate
    ) {
      if (
        !bestSet
      ) {
        bestSet =
          set;

        recordProgression.push(
          set
        );

        continue;
      }


      if (
        isBetterSet(
          set,
          bestSet
        )
      ) {
        bestSet =
          set;

        recordProgression.push(
          set
        );
      }
    }


    if (
      !bestSet
    ) {
      continue;
    }


    const currentRecord =
      bestSet;


    const previousRecord =
      recordProgression.length >
      1
        ? recordProgression[
            recordProgression.length -
              2
          ]
        : null;


    const improvement =
      previousRecord &&
      previousRecord.weight !==
        null &&
      currentRecord.weight !==
        null
        ? currentRecord.weight -
          previousRecord.weight
        : null;


    records.push({
      exerciseName,

      currentRecord,

      previousRecord,

      estimatedOneRepMax:
        calculateEstimatedOneRepMax(
          currentRecord
        ),

      improvement,

      totalSets:
        sets.length,
    });
  }


  return records.sort(
    (a, b) =>
      a.exerciseName.localeCompare(
        b.exerciseName
      )
  );
}


function isBetterSet(
  candidate: WorkoutSetLog,
  currentBest: WorkoutSetLog
) {
  const candidateWeight =
    candidate.weight ?? 0;

  const currentWeight =
    currentBest.weight ?? 0;


  if (
    candidateWeight >
    currentWeight
  ) {
    return true;
  }


  if (
    candidateWeight <
    currentWeight
  ) {
    return false;
  }


  const candidateReps =
    candidate.reps ?? 0;

  const currentReps =
    currentBest.reps ?? 0;


  return (
    candidateReps >
    currentReps
  );
}


function calculateEstimatedOneRepMax(
  set: WorkoutSetLog
) {
  if (
    set.weight === null ||
    set.reps === null ||
    set.reps <= 0
  ) {
    return null;
  }


  if (
    set.reps === 1
  ) {
    return set.weight;
  }


  return (
    set.weight *
    (
      1 +
      set.reps / 30
    )
  );
}


function formatWeight(
  set: WorkoutSetLog
) {
  if (
    set.weight === null
  ) {
    return "—";
  }


  return `${formatNumber(
    set.weight
  )} ${set.weight_unit}`;
}


function formatNumber(
  value: number
) {
  if (
    Number.isInteger(
      value
    )
  ) {
    return value.toString();
  }


  return value.toFixed(
    1
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


export default PersonalRecords;
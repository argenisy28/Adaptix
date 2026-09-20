import type {
  WeightUnit,
  WorkoutHistorySession,
  WorkoutSetLog,
} from "../types/workout";

import {
  convertWeight,
  formatWeightNumber,
} from "../utils/weight";


type PersonalRecordsProps = {
  workoutHistory: WorkoutHistorySession[];

  weightUnit: WeightUnit;

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
  weightUnit,
  onViewHistory,
}: PersonalRecordsProps) {
  const records =
    getPersonalRecords(
      workoutHistory,
      weightUnit
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
                      record.currentRecord,
                      weightUnit
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


                <div className="record-analytics">

                  <div className="record-analytic">

                    <span>
                      Estimated 1RM
                    </span>

                    <strong>
                      {
                        record.estimatedOneRepMax !==
                        null
                          ? `${formatWeightNumber(
                              record.estimatedOneRepMax
                            )} ${weightUnit}`
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
                              record.previousRecord,
                              weightUnit
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
                          ? `${
                              record.improvement >
                              0
                                ? "+"
                                : ""
                            }${formatWeightNumber(
                              record.improvement
                            )} ${weightUnit}`
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


                <p className="record-date">
                  Set on{" "}
                  {formatDate(
                    record.currentRecord
                      .created_at
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
    WorkoutHistorySession[],
  weightUnit: WeightUnit
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
          bestSet,
          weightUnit
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


    const currentWeight =
      currentRecord.weight !==
      null
        ? convertWeight(
            currentRecord.weight,
            currentRecord.weight_unit,
            weightUnit
          )
        : null;


    const previousWeight =
      previousRecord?.weight !==
      null &&
      previousRecord?.weight !==
        undefined
        ? convertWeight(
            previousRecord.weight,
            previousRecord.weight_unit,
            weightUnit
          )
        : null;


    const improvement =
      currentWeight !== null &&
      previousWeight !== null
        ? currentWeight -
          previousWeight
        : null;


    records.push({
      exerciseName,

      currentRecord,

      previousRecord,

      estimatedOneRepMax:
        calculateEstimatedOneRepMax(
          currentRecord,
          weightUnit
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
  currentBest: WorkoutSetLog,
  weightUnit: WeightUnit
) {
  if (
    candidate.weight ===
      null ||
    currentBest.weight ===
      null
  ) {
    return false;
  }


  const candidateWeight =
    convertWeight(
      candidate.weight,
      candidate.weight_unit,
      weightUnit
    );


  const currentWeight =
    convertWeight(
      currentBest.weight,
      currentBest.weight_unit,
      weightUnit
    );


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


  return (
    (candidate.reps ?? 0) >
    (currentBest.reps ?? 0)
  );
}


function calculateEstimatedOneRepMax(
  set: WorkoutSetLog,
  weightUnit: WeightUnit
) {
  if (
    set.weight === null ||
    set.reps === null ||
    set.reps <= 0
  ) {
    return null;
  }


  const convertedWeight =
    convertWeight(
      set.weight,
      set.weight_unit,
      weightUnit
    );


  if (
    set.reps === 1
  ) {
    return convertedWeight;
  }


  return (
    convertedWeight *
    (
      1 +
      set.reps / 30
    )
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


export default PersonalRecords;
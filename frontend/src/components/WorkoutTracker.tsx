import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ActiveWorkout,
  WeightUnit,
  WorkoutHistorySession,
} from "../types/workout";

import {
  convertWeight,
  formatWeightNumber,
} from "../utils/weight";


type WorkoutTrackerProps = {
  userId: number;

  activeWorkout: ActiveWorkout;

  workoutHistory: WorkoutHistorySession[];

  weightUnit: WeightUnit;

  onWorkoutCompleted: () => void;

  onCancel: () => void;
};


type SetEntry = {
  exerciseId: number;

  exerciseName: string;

  setNumber: number;

  weight: string;

  weightUnit: WeightUnit;

  reps: string;

  saved: boolean;

  saving: boolean;
};


function WorkoutTracker({
  userId,
  activeWorkout,
  workoutHistory,
  weightUnit,
  onWorkoutCompleted,
  onCancel,
}: WorkoutTrackerProps) {
  const {
    session,
    program,
    day,
  } = activeWorkout;


  // ----------------------------------------------------
  // Build initial set rows
  // ----------------------------------------------------

  const initialSets =
    useMemo<SetEntry[]>(
      () => {
        return day.exercises.flatMap(
          (exercise) =>
            Array.from(
              {
                length:
                  exercise.sets,
              },
              (_, index) => ({
                exerciseId:
                  exercise.id,

                exerciseName:
                  exercise.exercise_name,

                setNumber:
                  index + 1,

                weight:
                  "",

                weightUnit:
                  weightUnit,

                reps:
                  "",

                saved:
                  false,

                saving:
                  false,
              })
            )
        );
      },
      [
        day,
        weightUnit,
      ]
    );


  // ----------------------------------------------------
  // State
  // ----------------------------------------------------

  const [
    sets,
    setSets,
  ] =
    useState<SetEntry[]>(
      initialSets
    );


  const [
    notes,
    setNotes,
  ] = useState(
    ""
  );


  const [
    finishing,
    setFinishing,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  const [
    prMessage,
    setPrMessage,
  ] = useState(
    ""
  );


  // ----------------------------------------------------
  // Automatically hide PR notification
  // ----------------------------------------------------

  useEffect(
    () => {
      if (
        !prMessage
      ) {
        return;
      }


      const timeoutId =
        window.setTimeout(
          () => {
            setPrMessage(
              ""
            );
          },
          4000
        );


      return () => {
        window.clearTimeout(
          timeoutId
        );
      };
    },
    [
      prMessage,
    ]
  );


  // ----------------------------------------------------
  // Find previous performance for an exercise
  // ----------------------------------------------------

  function getPreviousExerciseSets(
    exerciseName: string
  ) {
    const previousSession =
      [...workoutHistory]
        .filter(
          (
            historySession
          ) =>
            historySession.completed_at !==
              null &&
            historySession.sets.some(
              (set) =>
                set.exercise_name ===
                  exerciseName &&
                set.completed
            )
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
        )[0];


    if (
      !previousSession
    ) {
      return [];
    }


    return previousSession.sets
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
      );
  }


  // ----------------------------------------------------
  // Format previous set in current display unit
  // ----------------------------------------------------

  function formatPreviousSet(
    exerciseName: string,
    setNumber: number
  ) {
    const previousSets =
      getPreviousExerciseSets(
        exerciseName
      );


    const previousSet =
      previousSets.find(
        (set) =>
          set.set_number ===
          setNumber
      );


    if (
      !previousSet
    ) {
      return "—";
    }


    if (
      previousSet.weight ===
      null
    ) {
      return (
        `${previousSet.reps ?? 0} reps`
      );
    }


    const convertedWeight =
      convertWeight(
        previousSet.weight,
        previousSet.weight_unit,
        weightUnit
      );


    return (
      `${formatWeightNumber(
        convertedWeight
      )} ${weightUnit} × ` +
      `${previousSet.reps ?? 0}`
    );
  }


  // ----------------------------------------------------
  // Fill current fields with previous performance
  // ----------------------------------------------------

  function fillPreviousPerformance(
    exerciseId: number,
    exerciseName: string
  ) {
    const previousSets =
      getPreviousExerciseSets(
        exerciseName
      );


    if (
      previousSets.length ===
      0
    ) {
      return;
    }


    setSets(
      (currentSets) =>
        currentSets.map(
          (currentSet) => {
            if (
              currentSet.exerciseId !==
                exerciseId ||
              currentSet.saved
            ) {
              return currentSet;
            }


            const previousSet =
              previousSets.find(
                (set) =>
                  set.set_number ===
                  currentSet.setNumber
              );


            if (
              !previousSet
            ) {
              return currentSet;
            }


            let convertedWeight =
              currentSet.weight;


            if (
              previousSet.weight !==
              null
            ) {
              convertedWeight =
                formatInputWeight(
                  convertWeight(
                    previousSet.weight,
                    previousSet.weight_unit,
                    weightUnit
                  )
                );
            }


            return {
              ...currentSet,

              weight:
                convertedWeight,

              weightUnit:
                weightUnit,

              reps:
                previousSet.reps !==
                null
                  ? String(
                      previousSet.reps
                    )
                  : currentSet.reps,
            };
          }
        )
    );


    setError(
      ""
    );
  }


  // ----------------------------------------------------
  // Get displayed weight
  //
  // The actual saved entry can remain in its original
  // unit while the UI displays the user's selected unit.
  // ----------------------------------------------------

  function getDisplayWeight(
    entry: SetEntry
  ) {
    if (
      entry.weight.trim() ===
      ""
    ) {
      return "";
    }


    const numericWeight =
      Number(
        entry.weight
      );


    if (
      Number.isNaN(
        numericWeight
      )
    ) {
      return entry.weight;
    }


    if (
      entry.weightUnit ===
      weightUnit
    ) {
      return entry.weight;
    }


    return formatInputWeight(
      convertWeight(
        numericWeight,
        entry.weightUnit,
        weightUnit
      )
    );
  }


  // ----------------------------------------------------
  // Find best historical/current weight
  //
  // Everything is converted into targetUnit before
  // comparing values.
  // ----------------------------------------------------

  function getBestPreviousWeight(
    exerciseId: number,
    exerciseName: string,
    currentSetNumber: number,
    targetUnit: WeightUnit
  ) {
    const historyWeights =
      workoutHistory.flatMap(
        (
          historySession
        ) =>
          historySession.sets
            .filter(
              (set) =>
                set.exercise_name ===
                  exerciseName &&
                set.completed &&
                set.weight !==
                  null
            )
            .map(
              (set) =>
                convertWeight(
                  set.weight as number,
                  set.weight_unit,
                  targetUnit
                )
            )
      );


    const currentWorkoutWeights =
      sets
        .filter(
          (set) =>
            set.exerciseId ===
              exerciseId &&
            set.saved &&
            set.setNumber !==
              currentSetNumber &&
            set.weight.trim() !==
              ""
        )
        .map(
          (set) => {
            const numericWeight =
              Number(
                set.weight
              );


            if (
              Number.isNaN(
                numericWeight
              )
            ) {
              return null;
            }


            return convertWeight(
              numericWeight,
              set.weightUnit,
              targetUnit
            );
          }
        )
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );


    const allPreviousWeights = [
      ...historyWeights,
      ...currentWorkoutWeights,
    ];


    if (
      allPreviousWeights.length ===
      0
    ) {
      return null;
    }


    return Math.max(
      ...allPreviousWeights
    );
  }


  // ----------------------------------------------------
  // Update weight or reps
  // ----------------------------------------------------

  function updateSet(
    exerciseId: number,
    setNumber: number,
    field:
      | "weight"
      | "reps",
    value: string
  ) {
    setSets(
      (previousSets) =>
        previousSets.map(
          (set) => {
            if (
              set.exerciseId !==
                exerciseId ||
              set.setNumber !==
                setNumber
            ) {
              return set;
            }


            if (
              field ===
              "weight"
            ) {
              return {
                ...set,

                weight:
                  value,

                weightUnit:
                  weightUnit,
              };
            }


            return {
              ...set,

              reps:
                value,
            };
          }
        )
    );
  }


  // ----------------------------------------------------
  // Save one completed set
  // ----------------------------------------------------

  async function saveSet(
    entry: SetEntry
  ) {
    if (
      entry.saved
    ) {
      return;
    }


    if (
      entry.weight.trim() ===
        "" ||
      entry.reps.trim() ===
        ""
    ) {
      setError(
        "Enter both weight and reps before saving the set."
      );

      return;
    }


    const enteredWeight =
      Number(
        entry.weight
      );


    const reps =
      Number(
        entry.reps
      );


    if (
      Number.isNaN(
        enteredWeight
      ) ||
      enteredWeight < 0
    ) {
      setError(
        "Weight must be a valid number."
      );

      return;
    }


    if (
      !Number.isInteger(
        reps
      ) ||
      reps < 0
    ) {
      setError(
        "Reps must be a valid whole number."
      );

      return;
    }


    // Convert the stored entry into the currently
    // selected unit before saving if necessary.

    const weight =
      entry.weightUnit ===
        weightUnit
        ? enteredWeight
        : convertWeight(
            enteredWeight,
            entry.weightUnit,
            weightUnit
          );


    // Find the best weight before this set
    // is marked as saved.

    const previousBestWeight =
      getBestPreviousWeight(
        entry.exerciseId,
        entry.exerciseName,
        entry.setNumber,
        weightUnit
      );


    setError(
      ""
    );


    setSets(
      (previousSets) =>
        previousSets.map(
          (set) =>
            set.exerciseId ===
              entry.exerciseId &&
            set.setNumber ===
              entry.setNumber
              ? {
                  ...set,

                  saving:
                    true,
                }
              : set
        )
    );


    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/users/${userId}/sessions/${session.id}/sets`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                workout_exercise_id:
                  entry.exerciseId,

                exercise_name:
                  entry.exerciseName,

                set_number:
                  entry.setNumber,

                weight:
                  weight,

                weight_unit:
                  weightUnit,

                reps:
                  reps,

                completed:
                  true,
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          data.detail ||
            "Unable to save workout set."
        );
      }


      const isNewPR =
        previousBestWeight ===
          null ||
        weight >
          previousBestWeight;


      setSets(
        (previousSets) =>
          previousSets.map(
            (set) =>
              set.exerciseId ===
                entry.exerciseId &&
              set.setNumber ===
                entry.setNumber
                ? {
                    ...set,

                    weight:
                      formatInputWeight(
                        weight
                      ),

                    weightUnit:
                      weightUnit,

                    saved:
                      true,

                    saving:
                      false,
                  }
                : set
          )
      );


      if (
        isNewPR
      ) {
        setPrMessage(
          `New ${entry.exerciseName} PR — ` +
          `${formatWeightNumber(
            weight
          )} ${weightUnit} × ${reps}`
        );
      }

    } catch (
      err
    ) {
      setSets(
        (previousSets) =>
          previousSets.map(
            (set) =>
              set.exerciseId ===
                entry.exerciseId &&
              set.setNumber ===
                entry.setNumber
                ? {
                    ...set,

                    saving:
                      false,
                  }
                : set
          )
      );


      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Unable to save workout set."
        );
      }
    }
  }


  // ----------------------------------------------------
  // Finish workout
  // ----------------------------------------------------

  async function finishWorkout() {
    const unsavedSets =
      sets.filter(
        (set) =>
          !set.saved
      );


    if (
      unsavedSets.length >
      0
    ) {
      const confirmed =
        window.confirm(
          "Some sets have not been saved. Finish the workout anyway?"
        );


      if (
        !confirmed
      ) {
        return;
      }
    }


    setFinishing(
      true
    );

    setError(
      ""
    );


    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/users/${userId}/sessions/${session.id}/complete`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                notes:
                  notes.trim() ||
                  null,
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          data.detail ||
            "Unable to complete workout."
        );
      }


      onWorkoutCompleted();

    } catch (
      err
    ) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Unable to complete workout."
        );
      }

    } finally {
      setFinishing(
        false
      );
    }
  }


  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  return (
    <section className="workout-tracker">

      {/* ----------------------------------------------
          Tracker Header
      ---------------------------------------------- */}

      <div className="tracker-header">

        <div>

          <span className="tracker-label">
            Workout in progress
          </span>


          <h2>
            {day.day_name}
          </h2>


          <p>
            {program.program_name}
          </p>

        </div>


        <button
          type="button"
          className="tracker-cancel-button"
          onClick={
            onCancel
          }
        >
          Close
        </button>

      </div>


      {/* ----------------------------------------------
          Session Information
      ---------------------------------------------- */}

      <div className="tracker-session-info">

        <span>
          Session #{session.id}
        </span>


        <span>
          Started{" "}

          {new Date(
            session.started_at
          ).toLocaleTimeString(
            [],
            {
              hour:
                "numeric",

              minute:
                "2-digit",
            }
          )}
        </span>


        <span>
          Unit:{" "}

          <strong>
            {weightUnit}
          </strong>
        </span>

      </div>


      {/* ----------------------------------------------
          PR Notification
      ---------------------------------------------- */}

      {prMessage && (

        <div
          className="pr-message"
          role="status"
          aria-live="polite"
        >

          <span className="pr-icon">
            🏆
          </span>


          <div>

            <strong>
              Personal Record!
            </strong>


            <span>
              {prMessage}
            </span>

          </div>

        </div>

      )}


      {/* ----------------------------------------------
          Error Message
      ---------------------------------------------- */}

      {error && (

        <p className="error-message">
          {error}
        </p>

      )}


      {/* ----------------------------------------------
          Exercises
      ---------------------------------------------- */}

      <div className="tracker-exercises">

        {day.exercises.map(
          (exercise) => {
            const exerciseSets =
              sets.filter(
                (set) =>
                  set.exerciseId ===
                  exercise.id
              );


            const hasPreviousPerformance =
              getPreviousExerciseSets(
                exercise.exercise_name
              ).length > 0;


            return (
              <article
                className="tracker-exercise"
                key={
                  exercise.id
                }
              >

                {/* Exercise Header */}

                <div className="tracker-exercise-header">

                  <div>

                    <h3>
                      {
                        exercise.exercise_name
                      }
                    </h3>


                    <p>
                      Target:{" "}
                      {exercise.sets} ×{" "}
                      {exercise.reps}
                    </p>

                  </div>


                  {hasPreviousPerformance && (

                    <div className="tracker-exercise-actions">

                      <span className="previous-performance-badge">
                        Previous performance available
                      </span>


                      <button
                        type="button"
                        className="use-previous-button"
                        onClick={
                          () =>
                            fillPreviousPerformance(
                              exercise.id,
                              exercise.exercise_name
                            )
                        }
                      >
                        Use Previous
                      </button>

                    </div>

                  )}

                </div>


                {/* Set Table */}

                <div className="tracker-set-table">

                  <div className="tracker-set-heading">

                    <span>
                      Set
                    </span>

                    <span>
                      Weight
                    </span>

                    <span>
                      Reps
                    </span>

                    <span>
                      Previous
                    </span>

                    <span>
                      Status
                    </span>

                  </div>


                  {exerciseSets.map(
                    (entry) => (

                      <div
                        className="tracker-set-row"
                        key={
                          `${entry.exerciseId}-${entry.setNumber}`
                        }
                      >

                        {/* Set Number */}

                        <strong>
                          {
                            entry.setNumber
                          }
                        </strong>


                        {/* Weight */}

                        <div className="tracker-input-group">

                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={
                              getDisplayWeight(
                                entry
                              )
                            }
                            disabled={
                              entry.saved
                            }
                            onChange={
                              (event) =>
                                updateSet(
                                  entry.exerciseId,
                                  entry.setNumber,
                                  "weight",
                                  event.target.value
                                )
                            }
                          />


                          <span>
                            {
                              weightUnit
                            }
                          </span>

                        </div>


                        {/* Reps */}

                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={
                            entry.reps
                          }
                          disabled={
                            entry.saved
                          }
                          onChange={
                            (event) =>
                              updateSet(
                                entry.exerciseId,
                                entry.setNumber,
                                "reps",
                                event.target.value
                              )
                          }
                        />


                        {/* Previous Performance */}

                        <div className="previous-set">

                          {
                            formatPreviousSet(
                              exercise.exercise_name,
                              entry.setNumber
                            )
                          }

                        </div>


                        {/* Save Set */}

                        <button
                          type="button"
                          className={
                            entry.saved
                              ? "set-saved-button"
                              : "save-set-button"
                          }
                          disabled={
                            entry.saved ||
                            entry.saving
                          }
                          onClick={
                            () =>
                              void saveSet(
                                entry
                              )
                          }
                        >

                          {
                            entry.saved
                              ? "✓ Saved"
                              : entry.saving
                                ? "Saving..."
                                : "Save Set"
                          }

                        </button>

                      </div>

                    )
                  )}

                </div>

              </article>
            );
          }
        )}

      </div>


      {/* ----------------------------------------------
          Workout Notes
      ---------------------------------------------- */}

      <div className="tracker-notes">

        <label>

          Workout Notes


          <textarea
            placeholder="How did the workout feel?"
            value={
              notes
            }
            onChange={
              (event) =>
                setNotes(
                  event.target.value
                )
            }
          />

        </label>

      </div>


      {/* ----------------------------------------------
          Tracker Footer
      ---------------------------------------------- */}

      <div className="tracker-footer">

        <div>

          <strong>
            {
              sets.filter(
                (set) =>
                  set.saved
              ).length
            }
          </strong>

          {" of "}

          <strong>
            {
              sets.length
            }
          </strong>

          {" sets saved"}

        </div>


        <button
          type="button"
          className="finish-workout-button"
          disabled={
            finishing
          }
          onClick={
            () =>
              void finishWorkout()
          }
        >

          {
            finishing
              ? "Finishing..."
              : "Finish Workout"
          }

        </button>

      </div>

    </section>
  );
}


// ----------------------------------------------------
// Format converted weight for editable inputs
// ----------------------------------------------------

function formatInputWeight(
  weight: number
) {
  const rounded =
    Math.round(
      weight * 100
    ) / 100;


  return rounded.toString();
}


export default WorkoutTracker;
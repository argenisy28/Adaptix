import {
  useMemo,
  useState,
} from "react";

import type {
  ActiveWorkout,
} from "../types/workout";


type WorkoutTrackerProps = {
  userId: number;
  activeWorkout: ActiveWorkout;
  onWorkoutCompleted: () => void;
  onCancel: () => void;
};


type SetEntry = {
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  weight: string;
  reps: string;
  saved: boolean;
  saving: boolean;
};


function WorkoutTracker({
  userId,
  activeWorkout,
  onWorkoutCompleted,
  onCancel,
}: WorkoutTrackerProps) {
  const {
    session,
    program,
    day,
  } = activeWorkout;


  // ----------------------------------------------------
  // Build initial set rows from the selected workout day
  // ----------------------------------------------------

  const initialSets =
    useMemo<SetEntry[]>(() => {
      return day.exercises.flatMap(
        (exercise) =>
          Array.from(
            {
              length: exercise.sets,
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

              reps:
                "",

              saved:
                false,

              saving:
                false,
            })
          )
      );
    }, [day]);


  // ----------------------------------------------------
  // State
  // ----------------------------------------------------

  const [
    sets,
    setSets,
  ] = useState<SetEntry[]>(
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


  // ----------------------------------------------------
  // Update a weight or reps field
  // ----------------------------------------------------

  function updateSet(
    exerciseId: number,
    setNumber: number,
    field: "weight" | "reps",
    value: string
  ) {
    setSets(
      (previousSets) =>
        previousSets.map(
          (set) => {
            if (
              set.exerciseId ===
                exerciseId &&
              set.setNumber ===
                setNumber
            ) {
              return {
                ...set,
                [field]: value,
              };
            }

            return set;
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
    if (entry.saved) {
      return;
    }


    if (
      entry.weight.trim() === "" ||
      entry.reps.trim() === ""
    ) {
      setError(
        "Enter both weight and reps before saving the set."
      );

      return;
    }


    const weight =
      Number(entry.weight);

    const reps =
      Number(entry.reps);


    if (
      Number.isNaN(weight) ||
      weight < 0
    ) {
      setError(
        "Weight must be a valid number."
      );

      return;
    }


    if (
      !Number.isInteger(reps) ||
      reps < 0
    ) {
      setError(
        "Reps must be a valid whole number."
      );

      return;
    }


    setError("");


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
                  saving: true,
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
                  "lb",

                reps:
                  reps,

                completed:
                  true,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save workout set."
        );
      }


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
                    saved: true,
                    saving: false,
                  }
                : set
          )
      );

    } catch (err) {
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
                    saving: false,
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
  // Finish workout session
  // ----------------------------------------------------

  async function finishWorkout() {
    const unsavedSets =
      sets.filter(
        (set) =>
          !set.saved
      );


    if (
      unsavedSets.length > 0
    ) {
      const confirmed =
        window.confirm(
          "Some sets have not been saved. Finish the workout anyway?"
        );

      if (!confirmed) {
        return;
      }
    }


    setFinishing(true);
    setError("");


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


      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to complete workout."
        );
      }


      onWorkoutCompleted();

    } catch (err) {
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
      setFinishing(false);
    }
  }


  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  return (
    <section className="workout-tracker">

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
          onClick={onCancel}
        >
          Close
        </button>

      </div>


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

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="tracker-exercises">

        {day.exercises.map(
          (exercise) => {

            const exerciseSets =
              sets.filter(
                (set) =>
                  set.exerciseId ===
                  exercise.id
              );


            return (
              <article
                className="tracker-exercise"
                key={exercise.id}
              >

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

                </div>


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

                        <strong>
                          {
                            entry.setNumber
                          }
                        </strong>


                        <div className="tracker-input-group">

                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={
                              entry.weight
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
                            lb
                          </span>

                        </div>


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


      <div className="tracker-notes">

        <label>
          Workout Notes

          <textarea
            placeholder="How did the workout feel?"
            value={notes}
            onChange={
              (event) =>
                setNotes(
                  event.target.value
                )
            }
          />

        </label>

      </div>


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
            {sets.length}
          </strong>

          {" sets saved"}
        </div>


        <button
          type="button"
          className="finish-workout-button"
          disabled={finishing}
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


export default WorkoutTracker;
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import "./App.css";

import ExerciseHistory from "./components/ExerciseHistory";
import PersonalRecords from "./components/PersonalRecords";
import ProfileBar from "./components/ProfileBar";
import SavedPrograms from "./components/SavedPrograms";
import StartScreen from "./components/StartScreen";
import TopNav from "./components/TopNav";
import TrainingDashboard from "./components/TrainingDashboard";
import WorkoutCard from "./components/WorkoutCard";
import WorkoutForm from "./components/WorkoutForm";
import WorkoutHistory from "./components/WorkoutHistory";
import WorkoutTracker from "./components/WorkoutTracker";

import type {
  ActiveWorkout,
  SavedProgram,
  SavedProgramsResponse,
  SavedWorkoutDay,
  StartWorkoutSessionResponse,
  User,
  WeightUnit,
  WorkoutHistoryResponse,
  WorkoutHistorySession,
  WorkoutResponse,
} from "./types/workout";


function App() {
  // ----------------------------------------------------
  // Backend status
  // ----------------------------------------------------

  const [
    backendStatus,
    setBackendStatus,
  ] = useState(
    "Connecting to backend..."
  );


  // ----------------------------------------------------
  // Current user
  // ----------------------------------------------------

  const [
    currentUser,
    setCurrentUser,
  ] = useState<User | null>(
    () => {
      const storedUser =
        localStorage.getItem(
          "workoutUser"
        );

      if (!storedUser) {
        return null;
      }

      try {
        return JSON.parse(
          storedUser
        ) as User;
      } catch {
        return null;
      }
    }
  );


  // ----------------------------------------------------
  // Workout form
  // ----------------------------------------------------

  const [
    programName,
    setProgramName,
  ] = useState(
    "My Workout Program"
  );

  const [
    goal,
    setGoal,
  ] = useState(
    "strength"
  );

  const [
    experienceLevel,
    setExperienceLevel,
  ] = useState(
    "intermediate"
  );

  const [
    daysPerWeek,
    setDaysPerWeek,
  ] = useState(
    4
  );

  const [
    equipment,
    setEquipment,
  ] = useState(
    "full_gym"
  );


  // ----------------------------------------------------
  // Generated workout
  // ----------------------------------------------------

  const [
    workout,
    setWorkout,
  ] =
    useState<WorkoutResponse | null>(
      null
    );

  const [
    weightUnit,
    setWeightUnit,
  ] =
    useState<WeightUnit>(
    () => {
      const savedUnit =
        localStorage.getItem(
          "adaptixWeightUnit"
        );

      return savedUnit === "kg"
        ? "kg"
        : "lb";
    }
  );




  // ----------------------------------------------------
  // Saved workout programs
  // ----------------------------------------------------

  const [
    savedPrograms,
    setSavedPrograms,
  ] =
    useState<SavedProgram[]>(
      []
    );


  // ----------------------------------------------------
  // Workout history
  // ----------------------------------------------------

  const [
    workoutHistory,
    setWorkoutHistory,
  ] =
    useState<
      WorkoutHistorySession[]
    >(
      []
    );


  // ----------------------------------------------------
  // Active workout
  // ----------------------------------------------------

  const [
    activeWorkout,
    setActiveWorkout,
  ] =
    useState<ActiveWorkout | null>(
      null
    );


  // ----------------------------------------------------
  // Selected exercise history
  // ----------------------------------------------------

  const [
    selectedExercise,
    setSelectedExercise,
  ] =
    useState<string | null>(
      null
    );


  // ----------------------------------------------------
  // Loading states
  // ----------------------------------------------------

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const [
    loadingSaved,
    setLoadingSaved,
  ] = useState(
    false
  );

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(
    false
  );

  const [
    deletingProgramId,
    setDeletingProgramId,
  ] =
    useState<number | null>(
      null
    );


  // ----------------------------------------------------
  // Error states
  // ----------------------------------------------------

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  const [
    savedError,
    setSavedError,
  ] = useState(
    ""
  );

  const [
    historyError,
    setHistoryError,
  ] = useState(
    ""
  );


  // ----------------------------------------------------
  // Success notification
  // ----------------------------------------------------

  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    ""
  );


  // ----------------------------------------------------
  // Check FastAPI connection
  // ----------------------------------------------------

  useEffect(
    () => {
      fetch(
        "http://127.0.0.1:8000/health"
      )
        .then(
          (response) => {
            if (
              !response.ok
            ) {
              throw new Error();
            }

            return response.json();
          }
        )
        .then(
          (data) => {
            setBackendStatus(
              `Backend status: ${data.status}`
            );
          }
        )
        .catch(
          () => {
            setBackendStatus(
              "Unable to connect to backend."
            );
          }
        );
    },
    []
  );


  // ----------------------------------------------------
  // Automatically hide success messages
  // ----------------------------------------------------

  useEffect(
    () => {
      if (
        !successMessage
      ) {
        return;
      }

      const timeoutId =
        window.setTimeout(
          () => {
            setSuccessMessage(
              ""
            );
          },
          3500
        );

      return () => {
        window.clearTimeout(
          timeoutId
        );
      };
    },
    [
      successMessage,
    ]
  );


  // ----------------------------------------------------
  // User profile
  // ----------------------------------------------------

  function handleUserReady(
    user: User
  ) {
    localStorage.setItem(
      "workoutUser",
      JSON.stringify(
        user
      )
    );

    setCurrentUser(
      user
    );

    setWorkout(
      null
    );

    setSavedPrograms(
      []
    );

    setWorkoutHistory(
      []
    );

    setActiveWorkout(
      null
    );

    setSelectedExercise(
      null
    );

    setError(
      ""
    );

    setSavedError(
      ""
    );

    setHistoryError(
      ""
    );

    setSuccessMessage(
      ""
    );
  }

  function handleWeightUnitChange(
  unit: WeightUnit
) {
  setWeightUnit(
    unit
  );

  localStorage.setItem(
    "adaptixWeightUnit",
    unit
  );
}




  function handleSignOut() {
    localStorage.removeItem(
      "workoutUser"
    );

    setCurrentUser(
      null
    );

    setWorkout(
      null
    );

    setSavedPrograms(
      []
    );

    setWorkoutHistory(
      []
    );

    setActiveWorkout(
      null
    );

    setSelectedExercise(
      null
    );

    setError(
      ""
    );

    setSavedError(
      ""
    );

    setHistoryError(
      ""
    );

    setSuccessMessage(
      ""
    );

    setDeletingProgramId(
      null
    );
  }


  // ----------------------------------------------------
  // Fetch saved workout programs
  // ----------------------------------------------------

  const fetchSavedPrograms =
    useCallback(
      async (): Promise<
        SavedProgram[]
      > => {
        if (
          !currentUser
        ) {
          return [];
        }

        const response =
          await fetch(
            `http://127.0.0.1:8000/api/users/${currentUser.id}/workouts`
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.detail ||
              "Unable to load saved programs."
          );
        }

        const savedData =
          data as SavedProgramsResponse;

        return (
          savedData.programs
        );
      },
      [
        currentUser,
      ]
    );


  // ----------------------------------------------------
  // Manually refresh saved programs
  // ----------------------------------------------------

  const loadSavedPrograms =
    useCallback(
      async () => {
        setLoadingSaved(
          true
        );

        setSavedError(
          ""
        );

        try {
          const programs =
            await fetchSavedPrograms();

          setSavedPrograms(
            programs
          );

        } catch (
          err
        ) {
          if (
            err instanceof Error
          ) {
            setSavedError(
              err.message
            );
          } else {
            setSavedError(
              "Unable to load saved programs."
            );
          }

        } finally {
          setLoadingSaved(
            false
          );
        }
      },
      [
        fetchSavedPrograms,
      ]
    );


  // ----------------------------------------------------
  // Automatically load saved programs
  // ----------------------------------------------------

  useEffect(
    () => {
      if (
        !currentUser
      ) {
        return;
      }

      let cancelled =
        false;

      fetchSavedPrograms()
        .then(
          (programs) => {
            if (
              !cancelled
            ) {
              setSavedPrograms(
                programs
              );

              setSavedError(
                ""
              );
            }
          }
        )
        .catch(
          (err) => {
            if (
              cancelled
            ) {
              return;
            }

            if (
              err instanceof Error
            ) {
              setSavedError(
                err.message
              );
            } else {
              setSavedError(
                "Unable to load saved programs."
              );
            }
          }
        );

      return () => {
        cancelled =
          true;
      };
    },
    [
      currentUser,
      fetchSavedPrograms,
    ]
  );


  // ----------------------------------------------------
  // Fetch workout history
  // ----------------------------------------------------

  const fetchWorkoutHistory =
    useCallback(
      async (): Promise<
        WorkoutHistorySession[]
      > => {
        if (
          !currentUser
        ) {
          return [];
        }

        const response =
          await fetch(
            `http://127.0.0.1:8000/api/users/${currentUser.id}/sessions`
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.detail ||
              "Unable to load workout history."
          );
        }

        const historyData =
          data as WorkoutHistoryResponse;

        return (
          historyData.sessions
        );
      },
      [
        currentUser,
      ]
    );


  // ----------------------------------------------------
  // Manually refresh workout history
  // ----------------------------------------------------

  const loadWorkoutHistory =
    useCallback(
      async () => {
        setLoadingHistory(
          true
        );

        setHistoryError(
          ""
        );

        try {
          const sessions =
            await fetchWorkoutHistory();

          setWorkoutHistory(
            sessions
          );

        } catch (
          err
        ) {
          if (
            err instanceof Error
          ) {
            setHistoryError(
              err.message
            );
          } else {
            setHistoryError(
              "Unable to load workout history."
            );
          }

        } finally {
          setLoadingHistory(
            false
          );
        }
      },
      [
        fetchWorkoutHistory,
      ]
    );


  // ----------------------------------------------------
  // Automatically load workout history
  // ----------------------------------------------------

  useEffect(
    () => {
      if (
        !currentUser
      ) {
        return;
      }

      let cancelled =
        false;

      fetchWorkoutHistory()
        .then(
          (sessions) => {
            if (
              !cancelled
            ) {
              setWorkoutHistory(
                sessions
              );

              setHistoryError(
                ""
              );
            }
          }
        )
        .catch(
          (err) => {
            if (
              cancelled
            ) {
              return;
            }

            if (
              err instanceof Error
            ) {
              setHistoryError(
                err.message
              );
            } else {
              setHistoryError(
                "Unable to load workout history."
              );
            }
          }
        );

      return () => {
        cancelled =
          true;
      };
    },
    [
      currentUser,
      fetchWorkoutHistory,
    ]
  );


  // ----------------------------------------------------
  // Start workout session
  // ----------------------------------------------------

  async function startWorkout(
    program: SavedProgram,
    day: SavedWorkoutDay
  ) {
    if (
      !currentUser
    ) {
      return;
    }

    setSavedError(
      ""
    );

    setSuccessMessage(
      ""
    );

    setSelectedExercise(
      null
    );

    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/users/${currentUser.id}/sessions`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                program_id:
                  program.id,

                workout_day_id:
                  day.id,

                program_name:
                  program.program_name,

                day_name:
                  day.day_name,

                notes:
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
            "Unable to start workout."
        );
      }

      const sessionData =
        data as StartWorkoutSessionResponse;

      setActiveWorkout({
        session:
          sessionData.session,

        program:
          program,

        day:
          day,
      });

      window.scrollTo({
        top:
          0,

        behavior:
          "smooth",
      });

    } catch (
      err
    ) {
      if (
        err instanceof Error
      ) {
        setSavedError(
          err.message
        );
      } else {
        setSavedError(
          "Unable to start workout."
        );
      }
    }
  }


  // ----------------------------------------------------
  // Close active workout
  // ----------------------------------------------------

  function closeActiveWorkout() {
    const confirmed =
      window.confirm(
        "Close this workout? Saved sets will remain in workout history and the session will remain incomplete."
      );

    if (
      !confirmed
    ) {
      return;
    }

    setActiveWorkout(
      null
    );

    void loadWorkoutHistory();

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }


  // ----------------------------------------------------
  // Workout completed
  // ----------------------------------------------------

  function handleWorkoutCompleted() {
    setActiveWorkout(
      null
    );

    setSuccessMessage(
      "Workout completed successfully."
    );

    void loadWorkoutHistory();

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }


  // ----------------------------------------------------
  // Delete saved workout program
  // ----------------------------------------------------

  async function deleteSavedProgram(
    programId: number
  ) {
    if (
      !currentUser
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this workout program? This cannot be undone."
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDeletingProgramId(
      programId
    );

    setSavedError(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/users/${currentUser.id}/workouts/${programId}`,
          {
            method:
              "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.detail ||
            "Unable to delete workout program."
        );
      }

      setSavedPrograms(
        (
          previousPrograms
        ) =>
          previousPrograms.filter(
            (
              program
            ) =>
              program.id !==
              programId
          )
      );

      if (
        workout?.program_id ===
        programId
      ) {
        setWorkout(
          null
        );
      }

      setSuccessMessage(
        "Workout program deleted successfully."
      );

    } catch (
      err
    ) {
      if (
        err instanceof Error
      ) {
        setSavedError(
          err.message
        );
      } else {
        setSavedError(
          "Unable to delete workout program."
        );
      }

    } finally {
      setDeletingProgramId(
        null
      );
    }
  }


  // ----------------------------------------------------
  // Generate and save workout
  // ----------------------------------------------------

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !currentUser
    ) {
      return;
    }

    setLoading(
      true
    );

    setError(
      ""
    );

    setSuccessMessage(
      ""
    );

    setWorkout(
      null
    );

    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/users/${currentUser.id}/workouts`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                program_name:
                  programName,

                goal:
                  goal,

                experience_level:
                  experienceLevel,

                days_per_week:
                  daysPerWeek,

                equipment:
                  equipment,
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
            "Unable to generate workout."
        );
      }

      setWorkout(
        data as WorkoutResponse
      );

      setSuccessMessage(
        "Workout generated and saved successfully."
      );

      await loadSavedPrograms();

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
          "Something went wrong."
        );
      }

    } finally {
      setLoading(
        false
      );
    }
  }


  // ----------------------------------------------------
  // Open exercise-specific history
  // ----------------------------------------------------

  function openExerciseHistory(
    exerciseName: string
  ) {
    setSelectedExercise(
      exerciseName
    );

    window.setTimeout(
      () => {
        document
          .getElementById(
            "exercise-history"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });
      },
      0
    );
  }


  // ----------------------------------------------------
  // Close exercise-specific history
  // ----------------------------------------------------

  function closeExerciseHistory() {
    setSelectedExercise(
      null
    );

    window.setTimeout(
      () => {
        document
          .getElementById(
            "records"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });
      },
      0
    );
  }


  // ----------------------------------------------------
  // Start screen
  // ----------------------------------------------------

  if (
    !currentUser
  ) {
    return (
      <StartScreen
        onUserReady={
          handleUserReady
        }
      />
    );
  }


  // ----------------------------------------------------
  // Main Adaptix application
  // ----------------------------------------------------

  return (
    <main className="app">

      {/* Top Navigation */}

      <TopNav
        user={
          currentUser
        }

        weightUnit={
          weightUnit
        }

        onWeightUnitChange={
          handleWeightUnitChange
        }
      />


      {/* Success notification */}

      {successMessage && (
        <div
          className="success-message"
          role="status"
          aria-live="polite"
        >

          <span className="success-icon">
            ✓
          </span>

          <span>
            {successMessage}
          </span>

        </div>
      )}


      {/* Active Workout */}

      {activeWorkout ? (

        <WorkoutTracker
          userId={
            currentUser.id
          }

          activeWorkout={
            activeWorkout
          }

          workoutHistory={
            workoutHistory
          }

          weightUnit={
            weightUnit
          }

          onWorkoutCompleted={
            handleWorkoutCompleted
          }

          onCancel={
            closeActiveWorkout
          }
        />

      ) : (

        <>

          {/* Hero / Header */}

          <header className="header">

            <h1>
              Adaptix
            </h1>


            <p>
              Training built around your
              goals, experience, schedule,
              and available equipment.
            </p>


            <span className="backend-status">
              {backendStatus}
            </span>


            <ProfileBar
              user={
                currentUser
              }

              onSwitchProfile={
                handleSignOut
              }
            />

          </header>


          {/* Training Dashboard */}

          <TrainingDashboard
            workoutHistory={
              workoutHistory
            }
          />


          {/* Workout Generator */}

          <WorkoutForm
            programName={
              programName
            }

            goal={
              goal
            }

            experienceLevel={
              experienceLevel
            }

            daysPerWeek={
              daysPerWeek
            }

            equipment={
              equipment
            }

            loading={
              loading
            }

            onProgramNameChange={
              setProgramName
            }

            onGoalChange={
              setGoal
            }

            onExperienceLevelChange={
              setExperienceLevel
            }

            onDaysPerWeekChange={
              setDaysPerWeek
            }

            onEquipmentChange={
              setEquipment
            }

            onSubmit={
              handleSubmit
            }
          />


          {error && (
            <p className="error-message">
              {error}
            </p>
          )}


          {/* Newly Generated Workout */}

          {workout && (

            <section className="results-section">

              <h2>
                {
                  workout.program_name
                }
              </h2>


              <div className="program-badges">

                <span>
                  {
                    workout
                      .recommendation
                      .split_name
                  }
                </span>

                <span>
                  {
                    goal.replace(
                      "_",
                      " "
                    )
                  }
                </span>

                <span>
                  {
                    experienceLevel
                  }
                </span>

                <span>
                  {
                    daysPerWeek
                  }{" "}
                  Days
                </span>

                <span>
                  {
                    equipment.replace(
                      "_",
                      " "
                    )
                  }
                </span>

              </div>


              <div className="program-summary">

                <p>
                  <strong>
                    Split:
                  </strong>{" "}
                  {
                    workout
                      .recommendation
                      .split_name
                  }
                </p>


                <p>
                  {
                    workout
                      .recommendation
                      .reason
                  }
                </p>


                <p>
                  <strong>
                    Program ID:
                  </strong>{" "}
                  {
                    workout.program_id
                  }
                </p>

              </div>


              <div className="workout-grid">

                {workout.workouts.map(
                  (
                    day,
                    dayIndex
                  ) => (

                    <WorkoutCard
                      key={
                        dayIndex
                      }

                      title={
                        `Day ${
                          dayIndex + 1
                        }: ${
                          day.day_name
                        }`
                      }

                      exercises={
                        day.exercises.map(
                          (
                            exercise,
                            exerciseIndex
                          ) => ({
                            id:
                              exerciseIndex,

                            name:
                              exercise.exercise,

                            sets:
                              exercise.sets,

                            reps:
                              exercise.reps,

                            restSeconds:
                              exercise
                                .rest_seconds,
                          })
                        )
                      }
                    />

                  )
                )}

              </div>

            </section>

          )}


          {/* Saved Programs */}

          <SavedPrograms
            userName={
              currentUser.name
            }

            programs={
              savedPrograms
            }

            loading={
              loadingSaved
            }

            error={
              savedError
            }

            deletingProgramId={
              deletingProgramId
            }

            onLoadPrograms={
              loadSavedPrograms
            }

            onDeleteProgram={
              deleteSavedProgram
            }

            onStartWorkout={
              startWorkout
            }
          />


          {/* Workout History */}

          <WorkoutHistory
            sessions={
              workoutHistory
            }

            loading={
              loadingHistory
            }

            error={
              historyError
            }

            weightUnit={
              weightUnit
            }

            onRefresh={
              loadWorkoutHistory
            }
          />


          {/* Personal Records */}

          <PersonalRecords
            workoutHistory={
              workoutHistory
            }

            weightUnit={
              weightUnit
            }

            onViewHistory={
              openExerciseHistory
            }
          />


          {/* Exercise-Specific History */}

          {selectedExercise && (

            <ExerciseHistory
              exerciseName={
                selectedExercise
              }

              workoutHistory={
                workoutHistory
              }

              weightUnit={
                weightUnit
              }

              onClose={
                closeExerciseHistory
              }
            />

          )}

        </>

      )}

    </main>
  );
}


export default App;
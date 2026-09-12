import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import "./App.css";

import ProfileBar from "./components/ProfileBar";
import StartScreen from "./components/StartScreen";
import WorkoutCard from "./components/WorkoutCard";
import WorkoutForm from "./components/WorkoutForm";
import SavedPrograms from "./components/SavedPrograms";

import type {
  SavedProgram,
  SavedProgramsResponse,
  User,
  WorkoutResponse,
} from "./types/workout";


function App() {
  // ----------------------------------------------------
  // Backend status
  // ----------------------------------------------------

  const [backendStatus, setBackendStatus] = useState(
    "Connecting to backend..."
  );


  // ----------------------------------------------------
  // Current user
  // ----------------------------------------------------

  const [currentUser, setCurrentUser] =
    useState<User | null>(() => {
      const storedUser =
        localStorage.getItem("workoutUser");

      if (!storedUser) {
        return null;
      }

      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    });


  // ----------------------------------------------------
  // Workout form state
  // ----------------------------------------------------

  const [programName, setProgramName] = useState(
    "My Workout Program"
  );

  const [goal, setGoal] = useState(
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

  const [workout, setWorkout] =
    useState<WorkoutResponse | null>(null);


  // ----------------------------------------------------
  // Saved programs
  // ----------------------------------------------------

  const [
    savedPrograms,
    setSavedPrograms,
  ] = useState<SavedProgram[]>([]);


  // ----------------------------------------------------
  // Loading states
  // ----------------------------------------------------

  const [loading, setLoading] =
    useState(false);

  const [
    loadingSaved,
    setLoadingSaved,
  ] = useState(false);


  // ----------------------------------------------------
  // Error states
  // ----------------------------------------------------

  const [error, setError] =
    useState("");

  const [
    savedError,
    setSavedError,
  ] = useState("");


  // ----------------------------------------------------
  // Check backend connection
  // ----------------------------------------------------

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8000/health"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }

        return response.json();
      })
      .then((data) => {
        setBackendStatus(
          `Backend status: ${data.status}`
        );
      })
      .catch(() => {
        setBackendStatus(
          "Unable to connect to backend."
        );
      });
  }, []);


  // ----------------------------------------------------
  // User profile handling
  // ----------------------------------------------------

  function handleUserReady(
    user: User
  ) {
    localStorage.setItem(
      "workoutUser",
      JSON.stringify(user)
    );

    setCurrentUser(user);
  }


  function handleSignOut() {
    localStorage.removeItem(
      "workoutUser"
    );

    setCurrentUser(null);
    setWorkout(null);
    setSavedPrograms([]);
    setError("");
    setSavedError("");
  }


  // ----------------------------------------------------
  // Load saved workout programs
  // ----------------------------------------------------

  async function loadSavedPrograms() {
    if (!currentUser) {
      return;
    }

    setLoadingSaved(true);
    setSavedError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${currentUser.id}/workouts`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to load saved programs."
        );
      }

      const savedData =
        data as SavedProgramsResponse;

      setSavedPrograms(
        savedData.programs
      );

    } catch (err) {
      if (err instanceof Error) {
        setSavedError(
          err.message
        );
      } else {
        setSavedError(
          "Unable to load saved programs."
        );
      }

    } finally {
      setLoadingSaved(false);
    }
  }


  // ----------------------------------------------------
  // Generate and save workout
  // ----------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    setLoading(true);
    setError("");
    setWorkout(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${currentUser.id}/workouts`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
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

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to generate workout."
        );
      }

      setWorkout(
        data as WorkoutResponse
      );

      // Refresh saved programs automatically
      // after generating a new one.
      await loadSavedPrograms();

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      } else {
        setError(
          "Something went wrong."
        );
      }

    } finally {
      setLoading(false);
    }
  }


  // ----------------------------------------------------
  // Start screen
  // ----------------------------------------------------

  if (!currentUser) {
    return (
      <StartScreen
        onUserReady={
          handleUserReady
        }
      />
    );
  }


  // ----------------------------------------------------
  // Main application
  // ----------------------------------------------------

  return (
    <main className="app">

      {/* ----------------------------------------------
          Header
      ---------------------------------------------- */}

      <header className="header">

        <h1>
          Personalized Workout App
        </h1>

        <p>
          Generate a training program
          based on your goals,
          experience, schedule, and
          equipment.
        </p>

        <span className="backend-status">
          {backendStatus}
        </span>


        <ProfileBar
          user={currentUser}
          onSwitchProfile={
            handleSignOut
          }
        />

      </header>


      {/* ----------------------------------------------
          Workout Generator
      ---------------------------------------------- */}

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


      {/* ----------------------------------------------
          Newly Generated Workout
      ---------------------------------------------- */}

      {workout && (

        <section className="results-section">

          <h2>
            {workout.program_name}
          </h2>


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


      {/* ----------------------------------------------
          Saved Programs
      ---------------------------------------------- */}

      <SavedPrograms
       userName={currentUser.name}
       programs={savedPrograms}
       loading={loadingSaved}
       error={savedError}
       onLoadPrograms={loadSavedPrograms}
      />

    </main>
  );
}


export default App;
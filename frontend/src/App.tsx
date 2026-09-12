import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import "./App.css";

import StartScreen from "./components/StartScreen";
import type { User } from "./components/StartScreen";


type Exercise = {
  exercise: string;
  movement_pattern: string;
  sets: number;
  reps: string;
  rest_seconds: number;
};


type WorkoutDay = {
  day_name: string;
  exercises: Exercise[];
};


type WorkoutResponse = {
  message: string;
  program_id: number;
  user_id: number;
  program_name: string;

  recommendation: {
    split_name: string;
    reason: string;
  };

  workouts: WorkoutDay[];
};


type SavedExercise = {
  id: number;
  exercise_name: string;
  movement_pattern: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  exercise_order: number;
};


type SavedWorkoutDay = {
  id: number;
  day_number: number;
  day_name: string;
  exercises: SavedExercise[];
};


type SavedProgram = {
  id: number;
  program_name: string;
  goal: string;
  experience_level: string;
  days_per_week: number;
  equipment: string;
  created_at: string;
  workout_days: SavedWorkoutDay[];
};


type SavedProgramsResponse = {
  user_id: number;
  programs: SavedProgram[];
};


function App() {
  const [backendStatus, setBackendStatus] = useState(
    "Connecting to backend..."
  );

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

  const [programName, setProgramName] = useState(
    "My Workout Program"
  );

  const [goal, setGoal] = useState("strength");

  const [experienceLevel, setExperienceLevel] =
    useState("intermediate");

  const [daysPerWeek, setDaysPerWeek] = useState(4);

  const [equipment, setEquipment] =
    useState("full_gym");

  const [workout, setWorkout] =
    useState<WorkoutResponse | null>(null);

  const [savedPrograms, setSavedPrograms] =
    useState<SavedProgram[]>([]);

  const [loading, setLoading] = useState(false);

  const [loadingSaved, setLoadingSaved] =
    useState(false);

  const [error, setError] = useState("");

  const [savedError, setSavedError] = useState("");


  // ----------------------------------------------------
  // Check backend connection
  // ----------------------------------------------------

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
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

  function handleUserReady(user: User) {
    localStorage.setItem(
      "workoutUser",
      JSON.stringify(user)
    );

    setCurrentUser(user);
  }


  function handleSignOut() {
    localStorage.removeItem("workoutUser");

    setCurrentUser(null);
    setWorkout(null);
    setSavedPrograms([]);
    setError("");
    setSavedError("");
  }


  // ----------------------------------------------------
  // Retrieve saved programs
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to load saved programs."
        );
      }

      const savedData =
        data as SavedProgramsResponse;

      setSavedPrograms(savedData.programs);

    } catch (err) {
      if (err instanceof Error) {
        setSavedError(err.message);
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
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            program_name: programName,
            goal: goal,
            experience_level: experienceLevel,
            days_per_week: daysPerWeek,
            equipment: equipment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to generate workout."
        );
      }

      setWorkout(data);

      await loadSavedPrograms();

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }

    } finally {
      setLoading(false);
    }
  }


  // ----------------------------------------------------
  // Show start screen if no profile is selected
  // ----------------------------------------------------

  if (!currentUser) {
    return (
      <StartScreen
        onUserReady={handleUserReady}
      />
    );
  }


  // ----------------------------------------------------
  // Main application
  // ----------------------------------------------------

  return (
    <main className="app">

      <header className="header">

        <h1>
          Personalized Workout App
        </h1>

        <p>
          Generate a training program based on your
          goals, experience, schedule, and equipment.
        </p>

        <span className="backend-status">
          {backendStatus}
        </span>


        <div className="account-bar">

          <div>
            <strong>
              {currentUser.name}
            </strong>

            <span>
              {currentUser.email}
            </span>
          </div>


          <button
            type="button"
            onClick={handleSignOut}
          >
            Switch Profile
          </button>

        </div>

      </header>


      <section className="generator-section">

        <h2>
          Build Your Workout
        </h2>


        <form
          className="workout-form"
          onSubmit={handleSubmit}
        >

          <label>
            Program Name

            <input
              type="text"
              value={programName}
              onChange={(event) =>
                setProgramName(
                  event.target.value
                )
              }
              required
            />
          </label>


          <label>
            Goal

            <select
              value={goal}
              onChange={(event) =>
                setGoal(event.target.value)
              }
            >

              <option value="strength">
                Strength
              </option>

              <option value="muscle_gain">
                Muscle Gain
              </option>

              <option value="weight_loss">
                Weight Loss
              </option>

              <option value="general_fitness">
                General Fitness
              </option>

            </select>

          </label>


          <label>
            Experience Level

            <select
              value={experienceLevel}
              onChange={(event) =>
                setExperienceLevel(
                  event.target.value
                )
              }
            >

              <option value="beginner">
                Beginner
              </option>

              <option value="intermediate">
                Intermediate
              </option>

              <option value="advanced">
                Advanced
              </option>

            </select>

          </label>


          <label>
            Training Days Per Week

            <select
              value={daysPerWeek}
              onChange={(event) =>
                setDaysPerWeek(
                  Number(event.target.value)
                )
              }
            >

              <option value={2}>
                2 Days
              </option>

              <option value={3}>
                3 Days
              </option>

              <option value={4}>
                4 Days
              </option>

              <option value={5}>
                5 Days
              </option>

              <option value={6}>
                6 Days
              </option>

            </select>

          </label>


          <label>
            Equipment

            <select
              value={equipment}
              onChange={(event) =>
                setEquipment(
                  event.target.value
                )
              }
            >

              <option value="full_gym">
                Full Gym
              </option>

              <option value="home_gym">
                Home Gym
              </option>

              <option value="bodyweight">
                Bodyweight
              </option>

            </select>

          </label>


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Workout"}
          </button>

        </form>


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </section>


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
                workout.recommendation
                  .split_name
              }
            </p>

            <p>
              {
                workout.recommendation
                  .reason
              }
            </p>

            <p>
              <strong>
                Program ID:
              </strong>{" "}
              {workout.program_id}
            </p>

          </div>


          <div className="workout-grid">

            {workout.workouts.map(
              (day, dayIndex) => (

                <article
                  className="workout-card"
                  key={dayIndex}
                >

                  <h3>
                    Day {dayIndex + 1}:{" "}
                    {day.day_name}
                  </h3>


                  {day.exercises.map(
                    (
                      exercise,
                      exerciseIndex
                    ) => (

                      <div
                        className="exercise"
                        key={exerciseIndex}
                      >

                        <h4>
                          {
                            exercise.exercise
                          }
                        </h4>

                        <p>
                          {
                            exercise.sets
                          }{" "}
                          sets ×{" "}
                          {
                            exercise.reps
                          }{" "}
                          reps
                        </p>

                        <p>
                          Rest:{" "}
                          {
                            exercise
                              .rest_seconds
                          }{" "}
                          sec
                        </p>

                      </div>

                    )
                  )}

                </article>

              )
            )}

          </div>

        </section>

      )}


      <section className="saved-section">

        <div className="saved-header">

          <div>

            <h2>
              Saved Programs
            </h2>

            <p>
              View saved workout programs for{" "}
              {currentUser.name}.
            </p>

          </div>


          <button
            type="button"
            onClick={loadSavedPrograms}
            disabled={loadingSaved}
          >
            {loadingSaved
              ? "Loading..."
              : "Load Saved Programs"}
          </button>

        </div>


        {savedError && (
          <p className="error-message">
            {savedError}
          </p>
        )}


        {!loadingSaved &&
          savedPrograms.length === 0 && (

            <p>
              No saved programs loaded.
            </p>

          )}


        <div className="saved-programs">

          {savedPrograms.map(
            (program) => (

              <article
                className="saved-program"
                key={program.id}
              >

                <div className="saved-program-title">

                  <div>

                    <h3>
                      {
                        program.program_name
                      }
                    </h3>

                    <p>
                      Program #{program.id}
                    </p>

                  </div>

                </div>


                <div className="program-details">

                  <span>
                    Goal:{" "}
                    {program.goal.replace(
                      "_",
                      " "
                    )}
                  </span>

                  <span>
                    Experience:{" "}
                    {
                      program
                        .experience_level
                    }
                  </span>

                  <span>
                    Days:{" "}
                    {
                      program.days_per_week
                    }
                  </span>

                  <span>
                    Equipment:{" "}
                    {
                      program.equipment.replace(
                        "_",
                        " "
                      )
                    }
                  </span>

                </div>


                <div className="workout-grid">

                  {program.workout_days.map(
                    (day) => (

                      <article
                        className="workout-card"
                        key={day.id}
                      >

                        <h4>
                          Day{" "}
                          {day.day_number}:{" "}
                          {day.day_name}
                        </h4>


                        {day.exercises.map(
                          (exercise) => (

                            <div
                              className="exercise"
                              key={
                                exercise.id
                              }
                            >

                              <strong>
                                {
                                  exercise
                                    .exercise_name
                                }
                              </strong>

                              <p>
                                {
                                  exercise.sets
                                }{" "}
                                sets ×{" "}
                                {
                                  exercise.reps
                                }{" "}
                                reps
                              </p>

                              <p>
                                Rest:{" "}
                                {
                                  exercise
                                    .rest_seconds
                                }{" "}
                                sec
                              </p>

                            </div>

                          )
                        )}

                      </article>

                    )
                  )}

                </div>

              </article>

            )
          )}

        </div>

      </section>

    </main>
  );
}


export default App;
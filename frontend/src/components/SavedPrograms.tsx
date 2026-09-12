import WorkoutCard from "./WorkoutCard";

import type {
  SavedProgram,
} from "../types/workout";


type SavedProgramsProps = {
  userName: string;
  programs: SavedProgram[];
  loading: boolean;
  error: string;

  deletingProgramId: number | null;

  onLoadPrograms: () => void;

  onDeleteProgram: (
    programId: number
  ) => void;
};


function SavedPrograms({
  userName,
  programs,
  loading,
  error,
  deletingProgramId,
  onLoadPrograms,
  onDeleteProgram,
}: SavedProgramsProps) {
  return (
    <section
      id="programs"
      className="saved-section"
    >

      <div className="saved-header">

        <div>
          <h2>
            Saved Programs
          </h2>

          <p>
            View saved workout programs for{" "}
            {userName}.
          </p>
        </div>


        <button
          type="button"
          onClick={onLoadPrograms}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Load Saved Programs"}
        </button>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {!loading &&
        programs.length === 0 && (
          <p>
            No saved programs loaded.
          </p>
        )}


      <div className="saved-programs">

        {programs.map(
          (program) => (

            <details
              className="saved-program"
              key={program.id}
            >

              <summary className="saved-program-summary">

                <div>
                  <h3>
                    {program.program_name}
                  </h3>

                  <p>
                    {program.days_per_week} days
                    {" • "}
                    {program.goal.replace(
                      "_",
                      " "
                    )}
                  </p>
                </div>


                <span className="expand-label">
                  View Program
                </span>

              </summary>


              <div className="program-actions">

                <button
                  type="button"
                  className="delete-program-button"
                  onClick={() =>
                    onDeleteProgram(
                      program.id
                    )
                  }
                  disabled={
                    deletingProgramId ===
                    program.id
                  }
                >
                  {deletingProgramId ===
                  program.id
                    ? "Deleting..."
                    : "Delete Program"}
                </button>

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
                  {program.experience_level}
                </span>


                <span>
                  Days:{" "}
                  {program.days_per_week}
                </span>


                <span>
                  Equipment:{" "}
                  {program.equipment.replace(
                    "_",
                    " "
                  )}
                </span>

              </div>


              <div className="workout-grid">

                {program.workout_days.map(
                  (day) => (

                    <WorkoutCard
                      key={day.id}

                      title={
                        `Day ${day.day_number}: ${day.day_name}`
                      }

                      exercises={
                        day.exercises.map(
                          (exercise) => ({
                            id:
                              exercise.id,

                            name:
                              exercise
                                .exercise_name,

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

            </details>

          )
        )}

      </div>

    </section>
  );
}


export default SavedPrograms;
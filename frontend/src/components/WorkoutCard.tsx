type DisplayExercise = {
  id?: number | string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
};

type WorkoutCardProps = {
  title: string;
  exercises: DisplayExercise[];
};


function WorkoutCard({
  title,
  exercises,
}: WorkoutCardProps) {
  // Convert seconds into a cleaner
  // minutes-based display.
  function formatRestTime(
    seconds: number
  ) {
    const minutes =
      seconds / 60;

    if (
      Number.isInteger(minutes)
    ) {
      return `${minutes} min`;
    }

    return `${minutes.toFixed(1)} min`;
  }


  return (
    <article className="workout-card">

      <h3>
        {title}
      </h3>


      {exercises.map(
        (
          exercise,
          index
        ) => (
          <div
            className="exercise"
            key={
              exercise.id ??
              index
            }
          >

            <h4>
              {exercise.name}
            </h4>


            <div className="exercise-meta">

              <span>
                {exercise.sets} sets
              </span>

              <span>
                {exercise.reps} reps
              </span>

              <span>
                {formatRestTime(
                  exercise.restSeconds
                )}{" "}
                rest
              </span>

            </div>

          </div>
        )
      )}

    </article>
  );
}


export default WorkoutCard;
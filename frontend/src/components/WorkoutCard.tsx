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
  return (
    <article className="workout-card">

      <h3>
        {title}
      </h3>


      {exercises.map(
        (exercise, index) => (

          <div
            className="exercise"
            key={exercise.id ?? index}
          >

            <h4>
              {exercise.name}
            </h4>

            <p>
              {exercise.sets} sets ×{" "}
              {exercise.reps} reps
            </p>

            <p>
              Rest:{" "}
              {exercise.restSeconds} sec
            </p>

          </div>

        )
      )}

    </article>
  );
}


export default WorkoutCard;
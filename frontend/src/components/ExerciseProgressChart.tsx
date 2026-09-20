import type {
  WorkoutHistorySession,
} from "../types/workout";


type ExerciseProgressChartProps = {
  exerciseName: string;
  workoutHistory: WorkoutHistorySession[];
};


type ProgressPoint = {
  sessionId: number;
  date: string;
  weight: number;
  reps: number | null;
  weightUnit: "lb" | "kg";
};


function ExerciseProgressChart({
  exerciseName,
  workoutHistory,
}: ExerciseProgressChartProps) {
  const points =
    getProgressPoints(
      exerciseName,
      workoutHistory
    );


  if (points.length === 0) {
    return null;
  }


  const latestPoint =
    points[
      points.length - 1
    ];


  const personalRecord =
    points.reduce(
      (best, point) => {
        if (
          point.weight >
          best.weight
        ) {
          return point;
        }

        if (
          point.weight ===
            best.weight &&
          (point.reps ?? 0) >
            (best.reps ?? 0)
        ) {
          return point;
        }

        return best;
      },
      points[0]
    );


  const firstPoint =
    points[0];


  const totalChange =
    latestPoint.weight -
    firstPoint.weight;


  const chartWidth = 900;
  const chartHeight = 320;

  const paddingLeft = 70;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 55;

  const plotWidth =
    chartWidth -
    paddingLeft -
    paddingRight;

  const plotHeight =
    chartHeight -
    paddingTop -
    paddingBottom;


  const weights =
    points.map(
      (point) =>
        point.weight
    );


  const minimumWeight =
    Math.min(
      ...weights
    );

  const maximumWeight =
    Math.max(
      ...weights
    );


  const weightRange =
    maximumWeight -
    minimumWeight;


  const paddingAmount =
    Math.max(
      weightRange * 0.2,
      10
    );


  const yMinimum =
    Math.max(
      0,
      minimumWeight -
        paddingAmount
    );


  const yMaximum =
    maximumWeight +
    paddingAmount;


  const yRange =
    yMaximum -
    yMinimum || 1;


  function getX(
    index: number
  ) {
    if (
      points.length === 1
    ) {
      return (
        paddingLeft +
        plotWidth / 2
      );
    }

    return (
      paddingLeft +
      (
        index /
        (points.length - 1)
      ) *
        plotWidth
    );
  }


  function getY(
    weight: number
  ) {
    return (
      paddingTop +
      (
        1 -
        (
          weight -
          yMinimum
        ) /
          yRange
      ) *
        plotHeight
    );
  }


  const polylinePoints =
    points
      .map(
        (
          point,
          index
        ) =>
          `${getX(index)},${getY(
            point.weight
          )}`
      )
      .join(" ");


  const yTicks =
    Array.from(
      {
        length: 5,
      },
      (_, index) => {
        const percentage =
          index / 4;

        const value =
          yMaximum -
          percentage *
            yRange;

        return {
          value,
          y:
            paddingTop +
            percentage *
              plotHeight,
        };
      }
    );


  return (
    <section className="exercise-progress-chart">

      <div className="progress-chart-header">

        <div>
          <span className="progress-chart-label">
            Performance trend
          </span>

          <h3>
            Progress
          </h3>

          <p>
            Heaviest logged set from
            each workout.
          </p>
        </div>


        <div className="progress-chart-stats">

          <div className="progress-stat">
            <span>
              Latest
            </span>

            <strong>
              {
                latestPoint.weight
              }{" "}
              {
                latestPoint.weightUnit
              }
            </strong>
          </div>


          <div className="progress-stat">
            <span>
              PR
            </span>

            <strong>
              {
                personalRecord.weight
              }{" "}
              {
                personalRecord.weightUnit
              }
            </strong>
          </div>


          <div className="progress-stat">
            <span>
              Change
            </span>

            <strong
              className={
                totalChange > 0
                  ? "progress-positive"
                  : totalChange < 0
                    ? "progress-negative"
                    : ""
              }
            >
              {
                totalChange > 0
                  ? "+"
                  : ""
              }
              {
                formatNumber(
                  totalChange
                )
              }{" "}
              {
                latestPoint.weightUnit
              }
            </strong>
          </div>

        </div>

      </div>


      <div className="progress-chart-container">

        <svg
          className="progress-chart-svg"
          viewBox={
            `0 0 ${chartWidth} ${chartHeight}`
          }
          role="img"
          aria-label={
            `${exerciseName} weight progress chart`
          }
        >

          {/* Horizontal grid lines */}

          {yTicks.map(
            (
              tick,
              index
            ) => (
              <g
                key={
                  index
                }
              >

                <line
                  className="progress-grid-line"
                  x1={
                    paddingLeft
                  }
                  x2={
                    chartWidth -
                    paddingRight
                  }
                  y1={
                    tick.y
                  }
                  y2={
                    tick.y
                  }
                />

                <text
                  className="progress-axis-label"
                  x={
                    paddingLeft -
                    14
                  }
                  y={
                    tick.y + 4
                  }
                  textAnchor="end"
                >
                  {
                    Math.round(
                      tick.value
                    )
                  }
                </text>

              </g>
            )
          )}


          {/* Progress line */}

          {points.length > 1 && (
            <polyline
              className="progress-chart-line"
              points={
                polylinePoints
              }
            />
          )}


          {/* Data points */}

          {points.map(
            (
              point,
              index
            ) => {

              const x =
                getX(index);

              const y =
                getY(
                  point.weight
                );

              return (
                <g
                  key={
                    point.sessionId
                  }
                  className="progress-point-group"
                >

                  <circle
                    className="progress-chart-point-glow"
                    cx={
                      x
                    }
                    cy={
                      y
                    }
                    r="11"
                  />

                  <circle
                    className="progress-chart-point"
                    cx={
                      x
                    }
                    cy={
                      y
                    }
                    r="5"
                  />


                  <text
                    className="progress-point-value"
                    x={
                      x
                    }
                    y={
                      y - 16
                    }
                    textAnchor="middle"
                  >
                    {
                      point.weight
                    }{" "}
                    {
                      point.weightUnit
                    }
                  </text>


                  <text
                    className="progress-date-label"
                    x={
                      x
                    }
                    y={
                      chartHeight -
                      20
                    }
                    textAnchor="middle"
                  >
                    {
                      formatShortDate(
                        point.date
                      )
                    }
                  </text>

                </g>
              );
            }
          )}

        </svg>

      </div>


      {points.length === 1 && (
        <p className="progress-chart-message">
          Log this exercise in more
          workouts to build a progress
          trend.
        </p>
      )}

    </section>
  );
}


function getProgressPoints(
  exerciseName: string,
  workoutHistory:
    WorkoutHistorySession[]
): ProgressPoint[] {
  const points:
    ProgressPoint[] = [];


  for (
    const session
    of workoutHistory
  ) {
    const exerciseSets =
      session.sets.filter(
        (set) =>
          set.exercise_name ===
            exerciseName &&
          set.completed &&
          set.weight !== null
      );


    if (
      exerciseSets.length === 0
    ) {
      continue;
    }


    const heaviestSet =
      exerciseSets.reduce(
        (
          best,
          set
        ) => {
          const bestWeight =
            best.weight ?? 0;

          const setWeight =
            set.weight ?? 0;


          if (
            setWeight >
            bestWeight
          ) {
            return set;
          }


          if (
            setWeight ===
              bestWeight &&
            (set.reps ?? 0) >
              (best.reps ?? 0)
          ) {
            return set;
          }


          return best;
        }
      );


    if (
      heaviestSet.weight ===
      null
    ) {
      continue;
    }


    points.push({
      sessionId:
        session.id,

      date:
        session.started_at,

      weight:
        heaviestSet.weight,

      reps:
        heaviestSet.reps,

      weightUnit:
        heaviestSet.weight_unit,
    });
  }


  return points.sort(
    (a, b) =>
      new Date(
        a.date
      ).getTime() -
      new Date(
        b.date
      ).getTime()
  );
}


function formatShortDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
    }
  );
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


export default ExerciseProgressChart;
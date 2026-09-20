import {
  useState,
} from "react";

import type {
  WeightUnit,
  WorkoutHistorySession,
  WorkoutSetLog,
} from "../types/workout";

import {
  convertWeight,
  formatWeightNumber,
} from "../utils/weight";


type ExerciseProgressChartProps = {
  exerciseName: string;

  workoutHistory:
    WorkoutHistorySession[];

  weightUnit: WeightUnit;
};


type ChartMode =
  | "weight"
  | "estimatedOneRepMax";


type ProgressPoint = {
  sessionId: number;

  date: string;

  weight: number;

  reps: number | null;

  estimatedOneRepMax:
    number;
};


function ExerciseProgressChart({
  exerciseName,
  workoutHistory,
  weightUnit,
}: ExerciseProgressChartProps) {
  const [
    chartMode,
    setChartMode,
  ] =
    useState<ChartMode>(
      "weight"
    );


  const points =
    getProgressPoints(
      exerciseName,
      workoutHistory,
      weightUnit
    );


  if (
    points.length === 0
  ) {
    return null;
  }


  const firstPoint =
    points[0];

  const latestPoint =
    points[
      points.length - 1
    ];


  const getValue = (
    point: ProgressPoint
  ) =>
    chartMode ===
    "weight"
      ? point.weight
      : point.estimatedOneRepMax;


  const firstValue =
    getValue(
      firstPoint
    );

  const latestValue =
    getValue(
      latestPoint
    );


  const totalChange =
    latestValue -
    firstValue;


  const percentImprovement =
    firstValue > 0
      ? (
          totalChange /
          firstValue
        ) *
        100
      : 0;


  const bestValue =
    Math.max(
      ...points.map(
        (point) =>
          getValue(
            point
          )
      )
    );


  const values =
    points.map(
      (point) =>
        getValue(
          point
        )
    );


  const chartWidth =
    900;

  const chartHeight =
    320;

  const paddingLeft =
    70;

  const paddingRight =
    35;

  const paddingTop =
    40;

  const paddingBottom =
    55;


  const plotWidth =
    chartWidth -
    paddingLeft -
    paddingRight;

  const plotHeight =
    chartHeight -
    paddingTop -
    paddingBottom;


  const minimumValue =
    Math.min(
      ...values
    );

  const maximumValue =
    Math.max(
      ...values
    );


  const valueRange =
    maximumValue -
    minimumValue;


  const paddingAmount =
    Math.max(
      valueRange * 0.2,
      10
    );


  const yMinimum =
    Math.max(
      0,
      minimumValue -
        paddingAmount
    );

  const yMaximum =
    maximumValue +
    paddingAmount;


  const yRange =
    yMaximum -
      yMinimum ||
    1;


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
        (
          points.length -
          1
        )
      ) *
        plotWidth
    );
  }


  function getY(
    value: number
  ) {
    return (
      paddingTop +
      (
        1 -
        (
          value -
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
          `${getX(
            index
          )},${getY(
            getValue(
              point
            )
          )}`
      )
      .join(
        " "
      );


  const yTicks =
    Array.from(
      {
        length: 5,
      },
      (
        _,
        index
      ) => {
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
            Track your performance
            across completed training
            sessions.
          </p>

        </div>


        <div className="progress-chart-toggle">

          <button
            type="button"
            className={
              chartMode ===
              "weight"
                ? "progress-toggle-button active"
                : "progress-toggle-button"
            }
            onClick={() =>
              setChartMode(
                "weight"
              )
            }
          >
            Weight
          </button>


          <button
            type="button"
            className={
              chartMode ===
              "estimatedOneRepMax"
                ? "progress-toggle-button active"
                : "progress-toggle-button"
            }
            onClick={() =>
              setChartMode(
                "estimatedOneRepMax"
              )
            }
          >
            Estimated 1RM
          </button>

        </div>

      </div>


      <div className="progress-metrics-grid">

        <ProgressMetric
          label="Sessions"
          value={
            points.length.toString()
          }
        />


        <ProgressMetric
          label="Starting"
          value={
            `${formatWeightNumber(
              firstValue
            )} ${weightUnit}`
          }
        />


        <ProgressMetric
          label="Current"
          value={
            `${formatWeightNumber(
              latestValue
            )} ${weightUnit}`
          }
        />


        <ProgressMetric
          label="Best"
          value={
            `${formatWeightNumber(
              bestValue
            )} ${weightUnit}`
          }
        />


        <ProgressMetric
          label="Change"
          value={
            `${
              totalChange > 0
                ? "+"
                : ""
            }${formatWeightNumber(
              totalChange
            )} ${weightUnit}`
          }
          positive={
            totalChange > 0
          }
          negative={
            totalChange < 0
          }
        />


        <ProgressMetric
          label="Improvement"
          value={
            `${
              percentImprovement >
              0
                ? "+"
                : ""
            }${formatWeightNumber(
              percentImprovement
            )}%`
          }
          positive={
            percentImprovement > 0
          }
          negative={
            percentImprovement < 0
          }
        />

      </div>


      <div className="progress-chart-container">

        <svg
          className="progress-chart-svg"
          viewBox={
            `0 0 ${chartWidth} ${chartHeight}`
          }
          role="img"
          aria-label={
            `${exerciseName} ${
              chartMode ===
              "weight"
                ? "weight"
                : "estimated one rep max"
            } progress chart`
          }
        >

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
                    formatWeightNumber(
                      tick.value
                    )
                  }
                </text>

              </g>

            )
          )}


          {points.length >
            1 && (

            <polyline
              className="progress-chart-line"
              points={
                polylinePoints
              }
            />

          )}


          {points.map(
            (
              point,
              index
            ) => {
              const value =
                getValue(
                  point
                );


              const x =
                getX(
                  index
                );

              const y =
                getY(
                  value
                );


              const isBest =
                value ===
                bestValue;


              return (
                <g
                  key={
                    point.sessionId
                  }
                  className="progress-point-group"
                >

                  <circle
                    className={
                      isBest
                        ? "progress-chart-point-glow progress-best-glow"
                        : "progress-chart-point-glow"
                    }
                    cx={
                      x
                    }
                    cy={
                      y
                    }
                    r={
                      isBest
                        ? 13
                        : 11
                    }
                  />


                  <circle
                    className={
                      isBest
                        ? "progress-chart-point progress-best-point"
                        : "progress-chart-point"
                    }
                    cx={
                      x
                    }
                    cy={
                      y
                    }
                    r={
                      isBest
                        ? 6
                        : 5
                    }
                  />


                  <text
                    className="progress-point-value"
                    x={
                      x
                    }
                    y={
                      y - 17
                    }
                    textAnchor="middle"
                  >
                    {
                      formatWeightNumber(
                        value
                      )
                    }{" "}
                    {
                      weightUnit
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


      <div className="progress-chart-footer">

        <span className="progress-chart-legend-dot" />

        <span>
          {
            chartMode ===
            "weight"
              ? "Heaviest logged set from each session"
              : "Best estimated 1RM from each session"
          }
        </span>

      </div>


      {points.length ===
        1 && (

        <p className="progress-chart-message">
          Log this exercise in more
          workouts to build a complete
          progress trend.
        </p>

      )}

    </section>
  );
}


type ProgressMetricProps = {
  label: string;

  value: string;

  positive?: boolean;

  negative?: boolean;
};


function ProgressMetric({
  label,
  value,
  positive = false,
  negative = false,
}: ProgressMetricProps) {
  let className =
    "progress-metric-value";


  if (
    positive
  ) {
    className +=
      " progress-positive";
  }


  if (
    negative
  ) {
    className +=
      " progress-negative";
  }


  return (
    <div className="progress-metric">

      <span>
        {label}
      </span>

      <strong
        className={
          className
        }
      >
        {value}
      </strong>

    </div>
  );
}


function getProgressPoints(
  exerciseName: string,
  workoutHistory:
    WorkoutHistorySession[],
  weightUnit: WeightUnit
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
          set.weight !== null &&
          set.reps !== null &&
          set.reps > 0
      );


    if (
      exerciseSets.length ===
      0
    ) {
      continue;
    }


    const heaviestSet =
      getHeaviestSet(
        exerciseSets,
        weightUnit
      );


    const bestEstimatedSet =
      getBestEstimatedOneRepMaxSet(
        exerciseSets,
        weightUnit
      );


    if (
      heaviestSet.weight ===
        null ||
      bestEstimatedSet.weight ===
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
        convertWeight(
          heaviestSet.weight,
          heaviestSet.weight_unit,
          weightUnit
        ),

      reps:
        heaviestSet.reps,

      estimatedOneRepMax:
        calculateEstimatedOneRepMax(
          bestEstimatedSet,
          weightUnit
        ),
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


function getHeaviestSet(
  sets: WorkoutSetLog[],
  weightUnit: WeightUnit
) {
  return sets.reduce(
    (
      best,
      set
    ) => {
      if (
        best.weight ===
          null ||
        set.weight ===
          null
      ) {
        return best;
      }


      const bestWeight =
        convertWeight(
          best.weight,
          best.weight_unit,
          weightUnit
        );


      const setWeight =
        convertWeight(
          set.weight,
          set.weight_unit,
          weightUnit
        );


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
}


function getBestEstimatedOneRepMaxSet(
  sets: WorkoutSetLog[],
  weightUnit: WeightUnit
) {
  return sets.reduce(
    (
      best,
      set
    ) => {
      const bestEstimate =
        calculateEstimatedOneRepMax(
          best,
          weightUnit
        );


      const setEstimate =
        calculateEstimatedOneRepMax(
          set,
          weightUnit
        );


      return (
        setEstimate >
        bestEstimate
      )
        ? set
        : best;
    }
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
    return 0;
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


function formatShortDate(
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
    }
  );
}


export default ExerciseProgressChart;
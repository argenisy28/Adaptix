import type { FormEvent } from "react";


type WorkoutFormProps = {
  programName: string;
  goal: string;
  experienceLevel: string;
  daysPerWeek: number;
  equipment: string;
  loading: boolean;

  onProgramNameChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onExperienceLevelChange: (value: string) => void;
  onDaysPerWeekChange: (value: number) => void;
  onEquipmentChange: (value: string) => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
};


function WorkoutForm({
  programName,
  goal,
  experienceLevel,
  daysPerWeek,
  equipment,
  loading,
  onProgramNameChange,
  onGoalChange,
  onExperienceLevelChange,
  onDaysPerWeekChange,
  onEquipmentChange,
  onSubmit,
}: WorkoutFormProps) {
  return (
    <section 
    id = "build"
    className="generator-section">

      <h2>
        Build Your Workout
      </h2>


      <form
        className="workout-form"
        onSubmit={onSubmit}
      >

        <label>
          Program Name

          <input
            type="text"
            value={programName}
            onChange={(event) =>
              onProgramNameChange(
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
              onGoalChange(
                event.target.value
              )
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
              onExperienceLevelChange(
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
              onDaysPerWeekChange(
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
              onEquipmentChange(
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

    </section>
  );
}


export default WorkoutForm;
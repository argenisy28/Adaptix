import type {
  WeightUnit,
} from "../types/workout";


type WeightUnitToggleProps = {
  weightUnit: WeightUnit;

  onChange: (
    unit: WeightUnit
  ) => void;
};


function WeightUnitToggle({
  weightUnit,
  onChange,
}: WeightUnitToggleProps) {
  return (
    <div
      className="weight-unit-toggle"
      aria-label="Weight unit"
    >

      <button
        type="button"
        className={
          weightUnit === "lb"
            ? "weight-unit-button active"
            : "weight-unit-button"
        }
        onClick={() =>
          onChange(
            "lb"
          )
        }
      >
        lb
      </button>


      <button
        type="button"
        className={
          weightUnit === "kg"
            ? "weight-unit-button active"
            : "weight-unit-button"
        }
        onClick={() =>
          onChange(
            "kg"
          )
        }
      >
        kg
      </button>

    </div>
  );
}


export default WeightUnitToggle;
import type {
  WeightUnit,
} from "../types/workout";


const POUNDS_PER_KILOGRAM =
  2.2046226218;


export function convertWeight(
  weight: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
) {
  if (
    fromUnit ===
    toUnit
  ) {
    return weight;
  }


  if (
    fromUnit === "kg" &&
    toUnit === "lb"
  ) {
    return (
      weight *
      POUNDS_PER_KILOGRAM
    );
  }


  return (
    weight /
    POUNDS_PER_KILOGRAM
  );
}


export function formatWeightNumber(
  weight: number
) {
  if (
    Number.isInteger(
      weight
    )
  ) {
    return weight.toString();
  }


  return weight.toFixed(
    1
  );
}


export function formatConvertedWeight(
  weight: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
) {
  const converted =
    convertWeight(
      weight,
      fromUnit,
      toUnit
    );


  return `${formatWeightNumber(
    converted
  )} ${toUnit}`;
}
from backend.exercise_library import EXERCISE_LIBRARY


def get_training_parameters(goal: str):
    """
    Return sets, reps, and rest times based on the user's goal.
    """

    if goal == "strength":
        return {
            "compound_sets": 4,
            "compound_reps": "4-6",
            "accessory_sets": 3,
            "accessory_reps": "8-12",
            "compound_rest_seconds": 180,
            "accessory_rest_seconds": 90,
        }

    if goal == "muscle_gain":
        return {
            "compound_sets": 3,
            "compound_reps": "6-10",
            "accessory_sets": 3,
            "accessory_reps": "10-15",
            "compound_rest_seconds": 120,
            "accessory_rest_seconds": 90,
        }

    if goal == "weight_loss":
        return {
            "compound_sets": 3,
            "compound_reps": "8-12",
            "accessory_sets": 3,
            "accessory_reps": "12-15",
            "compound_rest_seconds": 90,
            "accessory_rest_seconds": 60,
        }

    # General fitness
    return {
        "compound_sets": 3,
        "compound_reps": "8-12",
        "accessory_sets": 2,
        "accessory_reps": "10-15",
        "compound_rest_seconds": 90,
        "accessory_rest_seconds": 60,
    }


def get_movement_patterns(day_name: str):
    """
    Determine which movement patterns belong in a workout.
    """

    if "Squat Focus" in day_name:
        return [
            "squat",
            "horizontal_push",
            "horizontal_pull",
            "hinge",
            "core",
        ]

    if "Bench Focus" in day_name:
        return [
            "horizontal_push",
            "horizontal_pull",
            "vertical_push",
            "squat",
            "triceps",
        ]

    if "Deadlift Focus" in day_name:
        return [
            "hinge",
            "vertical_pull",
            "horizontal_push",
            "lunge",
            "core",
        ]

    if day_name.startswith("Full Body"):
        return [
            "squat",
            "horizontal_push",
            "horizontal_pull",
            "hinge",
            "core",
        ]

    if day_name.startswith("Upper"):
        return [
            "horizontal_push",
            "horizontal_pull",
            "vertical_push",
            "vertical_pull",
            "biceps",
            "triceps",
        ]

    if day_name.startswith("Lower"):
        return [
            "squat",
            "hinge",
            "lunge",
            "core",
        ]

    if day_name.startswith("Push"):
        return [
            "horizontal_push",
            "vertical_push",
            "triceps",
        ]

    if day_name.startswith("Pull"):
        return [
            "horizontal_pull",
            "vertical_pull",
            "biceps",
        ]

    if day_name.startswith("Legs"):
        return [
            "squat",
            "hinge",
            "lunge",
            "core",
        ]

    return []


def generate_workout_day(
    day_name: str,
    goal: str,
    equipment: str,
):
    """
    Generate one complete workout day.
    """

    parameters = get_training_parameters(goal)

    movement_patterns = get_movement_patterns(day_name)

    workout = []

    compound_movements = {
        "squat",
        "hinge",
        "horizontal_push",
        "horizontal_pull",
        "vertical_push",
        "vertical_pull",
    }

    for movement in movement_patterns:

        exercise_name = EXERCISE_LIBRARY[movement][equipment]

        if movement in compound_movements:
            sets = parameters["compound_sets"]
            reps = parameters["compound_reps"]
            rest = parameters["compound_rest_seconds"]

        else:
            sets = parameters["accessory_sets"]
            reps = parameters["accessory_reps"]
            rest = parameters["accessory_rest_seconds"]

        workout.append({
            "exercise": exercise_name,
            "movement_pattern": movement,
            "sets": sets,
            "reps": reps,
            "rest_seconds": rest,
        })

    return {
        "day_name": day_name,
        "exercises": workout,
    }


def generate_program(
    schedule: list[str],
    goal: str,
    equipment: str,
):
    """
    Generate every workout in the user's weekly program.
    """

    program = []

    for day_name in schedule:

        workout_day = generate_workout_day(
            day_name=day_name,
            goal=goal,
            equipment=equipment,
        )

        program.append(workout_day)

    return program
from backend.exercise_library import EXERCISE_LIBRARY


def get_variation_index(day_name: str):
    """
    Determine which exercise variation should be used
    based on the workout's A, B, or C designation.
    """

    if day_name.endswith("B"):
        return 1

    if day_name.endswith("C"):
        return 2

    return 0


def select_exercise(
    movement: str,
    equipment: str,
    day_name: str,
):
    """
    Select an exercise variation for a movement pattern.
    """

    exercises = EXERCISE_LIBRARY[movement][equipment]

    variation_index = get_variation_index(day_name)

    return exercises[variation_index % len(exercises)]


def get_experience_settings(experience_level: str):
    """
    Adjust workout volume based on training experience.
    """

    if experience_level == "beginner":
        return {
            "set_modifier": -1,
            "exercise_limit": 4,
        }

    if experience_level == "advanced":
        return {
            "set_modifier": 1,
            "exercise_limit": 6,
        }

    # Intermediate
    return {
        "set_modifier": 0,
        "exercise_limit": 6,
    }


def get_training_parameters(
    goal: str,
    experience_level: str,
):
    """
    Return sets, reps, and rest times based on the
    user's goal and experience level.
    """

    if goal == "strength":
        parameters = {
            "compound_sets": 4,
            "compound_reps": "4-6",
            "accessory_sets": 3,
            "accessory_reps": "8-12",
            "compound_rest_seconds": 180,
            "accessory_rest_seconds": 90,
        }

    elif goal == "muscle_gain":
        parameters = {
            "compound_sets": 3,
            "compound_reps": "6-10",
            "accessory_sets": 3,
            "accessory_reps": "10-15",
            "compound_rest_seconds": 120,
            "accessory_rest_seconds": 90,
        }

    elif goal == "weight_loss":
        parameters = {
            "compound_sets": 3,
            "compound_reps": "8-12",
            "accessory_sets": 3,
            "accessory_reps": "12-15",
            "compound_rest_seconds": 90,
            "accessory_rest_seconds": 60,
        }

    else:
        # General fitness
        parameters = {
            "compound_sets": 3,
            "compound_reps": "8-12",
            "accessory_sets": 2,
            "accessory_reps": "10-15",
            "compound_rest_seconds": 90,
            "accessory_rest_seconds": 60,
        }

    experience_settings = get_experience_settings(
        experience_level
    )

    set_modifier = experience_settings["set_modifier"]

    parameters["compound_sets"] = max(
        2,
        parameters["compound_sets"] + set_modifier,
    )

    parameters["accessory_sets"] = max(
        2,
        parameters["accessory_sets"] + set_modifier,
    )

    parameters["exercise_limit"] = (
        experience_settings["exercise_limit"]
    )

    return parameters


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
    experience_level: str,
):
    """
    Generate one complete workout day.
    """

    parameters = get_training_parameters(
        goal=goal,
        experience_level=experience_level,
    )

    movement_patterns = get_movement_patterns(day_name)

    exercise_limit = parameters["exercise_limit"]

    movement_patterns = movement_patterns[:exercise_limit]

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

        exercise_name = select_exercise(
            movement=movement,
            equipment=equipment,
            day_name=day_name,
        )

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
    experience_level: str,
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
            experience_level=experience_level,
        )

        program.append(workout_day)

    return program
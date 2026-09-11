from backend.workout_generator import generate_program


def test_beginner_has_lower_volume_than_intermediate():

    beginner_program = generate_program(
        schedule=["Upper Body A"],
        goal="strength",
        equipment="full_gym",
        experience_level="beginner",
    )

    intermediate_program = generate_program(
        schedule=["Upper Body A"],
        goal="strength",
        equipment="full_gym",
        experience_level="intermediate",
    )

    beginner_workout = beginner_program[0]
    intermediate_workout = intermediate_program[0]

    assert len(beginner_workout["exercises"]) == 4

    assert len(intermediate_workout["exercises"]) == 6

    assert (
        beginner_workout["exercises"][0]["sets"]
        <
        intermediate_workout["exercises"][0]["sets"]
    )


def test_advanced_has_more_volume_than_intermediate():

    intermediate_program = generate_program(
        schedule=["Upper Body A"],
        goal="strength",
        equipment="full_gym",
        experience_level="intermediate",
    )

    advanced_program = generate_program(
        schedule=["Upper Body A"],
        goal="strength",
        equipment="full_gym",
        experience_level="advanced",
    )

    intermediate_sets = (
        intermediate_program[0]["exercises"][0]["sets"]
    )

    advanced_sets = (
        advanced_program[0]["exercises"][0]["sets"]
    )

    assert advanced_sets > intermediate_sets


def test_bodyweight_program_does_not_use_bench_press():

    program = generate_program(
        schedule=["Upper Body A"],
        goal="strength",
        equipment="bodyweight",
        experience_level="intermediate",
    )

    exercise_names = [
        exercise["exercise"]
        for exercise in program[0]["exercises"]
    ]

    assert "Bench Press" not in exercise_names

    assert "Push-Up" in exercise_names


def test_upper_a_and_upper_b_have_different_exercises():

    program = generate_program(
        schedule=[
            "Upper Body A",
            "Upper Body B",
        ],
        goal="strength",
        equipment="full_gym",
        experience_level="intermediate",
    )

    upper_a = program[0]["exercises"]
    upper_b = program[1]["exercises"]

    upper_a_names = [
        exercise["exercise"]
        for exercise in upper_a
    ]

    upper_b_names = [
        exercise["exercise"]
        for exercise in upper_b
    ]

    assert upper_a_names != upper_b_names


def test_four_day_schedule_generates_four_workouts():

    program = generate_program(
        schedule=[
            "Upper Body A",
            "Lower Body A",
            "Upper Body B",
            "Lower Body B",
        ],
        goal="strength",
        equipment="full_gym",
        experience_level="intermediate",
    )

    assert len(program) == 4
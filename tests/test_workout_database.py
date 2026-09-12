from backend.recommender import recommend_split
from backend.user_repository import create_user
from backend.workout_generator import generate_program
from backend.workout_repository import (
    get_workout_programs_by_user,
    save_workout_program,
    delete_workout_program,
)


def test_save_and_retrieve_workout_program():
    """
    Verify that a complete generated workout program
    can be saved to PostgreSQL and retrieved correctly.
    """

    # Create test user
    user = create_user(
        name="Workout Test User",
        email="workout@test.com",
    )

    # Generate recommended split
    recommended_split = recommend_split(
        goal="strength",
        experience_level="intermediate",
        days_per_week=4,
    )

    # Generate complete workouts
    workouts = generate_program(
        schedule=recommended_split["schedule"],
        goal="strength",
        equipment="full_gym",
        experience_level="intermediate",
    )

    # Save program to PostgreSQL
    program_id = save_workout_program(
        user_id=user["id"],
        program_name="Test Strength Program",
        goal="strength",
        experience_level="intermediate",
        days_per_week=4,
        equipment="full_gym",
        workouts=workouts,
    )

    assert program_id == 1

    # Retrieve saved programs
    programs = get_workout_programs_by_user(
        user["id"]
    )

    assert len(programs) == 1

    program = programs[0]

    assert program["program_name"] == "Test Strength Program"
    assert program["goal"] == "strength"
    assert program["experience_level"] == "intermediate"
    assert program["days_per_week"] == 4
    assert program["equipment"] == "full_gym"

    # A four-day program should contain four workout days
    assert len(program["workout_days"]) == 4


def test_saved_upper_body_workout_contains_exercises():
    """
    Verify that exercises are correctly stored inside
    their corresponding workout days.
    """

    user = create_user(
        name="Exercise Test User",
        email="exercises@test.com",
    )

    recommended_split = recommend_split(
        goal="strength",
        experience_level="intermediate",
        days_per_week=4,
    )

    workouts = generate_program(
        schedule=recommended_split["schedule"],
        goal="strength",
        equipment="full_gym",
        experience_level="intermediate",
    )

    save_workout_program(
        user_id=user["id"],
        program_name="Exercise Persistence Test",
        goal="strength",
        experience_level="intermediate",
        days_per_week=4,
        equipment="full_gym",
        workouts=workouts,
    )

    programs = get_workout_programs_by_user(
        user["id"]
    )

    upper_a = programs[0]["workout_days"][0]

    assert upper_a["day_name"] == "Upper Body A"

    assert len(upper_a["exercises"]) > 0

    exercise_names = [
        exercise["exercise_name"]
        for exercise in upper_a["exercises"]
    ]

    assert "Bench Press" in exercise_names
    assert "Barbell Row" in exercise_names


def test_bodyweight_exercises_persist_correctly():
    """
    Verify that equipment-specific exercises remain
    correct after being stored and retrieved.
    """

    user = create_user(
        name="Bodyweight Test User",
        email="bodyweight@test.com",
    )

    recommended_split = recommend_split(
        goal="general_fitness",
        experience_level="intermediate",
        days_per_week=4,
    )

    workouts = generate_program(
        schedule=recommended_split["schedule"],
        goal="general_fitness",
        equipment="bodyweight",
        experience_level="intermediate",
    )

    save_workout_program(
        user_id=user["id"],
        program_name="Bodyweight Program",
        goal="general_fitness",
        experience_level="intermediate",
        days_per_week=4,
        equipment="bodyweight",
        workouts=workouts,
    )

    programs = get_workout_programs_by_user(
        user["id"]
    )

    upper_a = programs[0]["workout_days"][0]

    exercise_names = [
        exercise["exercise_name"]
        for exercise in upper_a["exercises"]
    ]

    assert "Push-Up" in exercise_names
    assert "Bench Press" not in exercise_names

def test_delete_workout_program():
    user = create_user(
        name="Delete Workout User",
        email="deleteworkout@test.com",
    )

    recommended_split = recommend_split(
        goal="strength",
        experience_level="intermediate",
        days_per_week=4,
    )

    workouts = generate_program(
        schedule=recommended_split["schedule"],
        goal="strength",
        equipment="full_gym",
        experience_level="intermediate",
    )

    program_id = save_workout_program(
        user_id=user["id"],
        program_name="Delete Test Program",
        goal="strength",
        experience_level="intermediate",
        days_per_week=4,
        equipment="full_gym",
        workouts=workouts,
    )

    deleted = delete_workout_program(
        user_id=user["id"],
        program_id=program_id,
    )

    assert deleted is True

    programs = get_workout_programs_by_user(
        user["id"]
    )

    assert programs == []
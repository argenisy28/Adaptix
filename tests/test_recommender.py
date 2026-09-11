from backend.recommender import recommend_split


def test_four_day_program_uses_upper_lower():
    result = recommend_split(
        goal="strength",
        experience_level="intermediate",
        days_per_week=4,
    )

    assert result["split_name"] == "Upper / Lower"

    assert len(result["schedule"]) == 4


def test_six_day_program_uses_push_pull_legs():
    result = recommend_split(
        goal="muscle_gain",
        experience_level="intermediate",
        days_per_week=6,
    )

    assert result["split_name"] == "Push / Pull / Legs"

    assert len(result["schedule"]) == 6


def test_three_day_strength_program():
    result = recommend_split(
        goal="strength",
        experience_level="intermediate",
        days_per_week=3,
    )

    assert result["split_name"] == "Full Body Strength"

    assert result["schedule"] == [
        "Full Body - Squat Focus",
        "Full Body - Bench Focus",
        "Full Body - Deadlift Focus",
    ]
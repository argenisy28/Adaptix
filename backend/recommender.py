def recommend_split(
    goal: str,
    experience_level: str,
    days_per_week: int
):
    """
    Recommend a weekly workout split based on the user's
    training goal, experience level, and available training days.
    """

    # Two training days
    if days_per_week == 2:
        return {
            "split_name": "Full Body",
            "schedule": [
                "Full Body A",
                "Full Body B"
            ],
            "reason": (
                "A full-body split allows each major muscle group "
                "to be trained twice per week with only two available "
                "training days."
            )
        }

    # Three training days
    if days_per_week == 3:

        if experience_level == "beginner":
            return {
                "split_name": "Full Body",
                "schedule": [
                    "Full Body A",
                    "Full Body B",
                    "Full Body C"
                ],
                "reason": (
                    "Beginners benefit from practicing the major "
                    "movement patterns multiple times per week."
                )
            }

        if goal == "strength":
            return {
                "split_name": "Full Body Strength",
                "schedule": [
                    "Full Body - Squat Focus",
                    "Full Body - Bench Focus",
                    "Full Body - Deadlift Focus"
                ],
                "reason": (
                    "Three full-body sessions provide frequent practice "
                    "of the major compound lifts while allowing recovery."
                )
            }

        return {
            "split_name": "Full Body",
            "schedule": [
                "Full Body A",
                "Full Body B",
                "Full Body C"
            ],
            "reason": (
                "Three full-body sessions provide good training "
                "frequency while leaving recovery days between sessions."
            )
        }

    # Four training days
    if days_per_week == 4:
        return {
            "split_name": "Upper / Lower",
            "schedule": [
                "Upper Body A",
                "Lower Body A",
                "Upper Body B",
                "Lower Body B"
            ],
            "reason": (
                "An upper/lower split provides a good balance between "
                "training volume, frequency, and recovery."
            )
        }

    # Five training days
    if days_per_week == 5:
        return {
            "split_name": "Push / Pull / Legs + Upper / Lower",
            "schedule": [
                "Push",
                "Pull",
                "Legs",
                "Upper Body",
                "Lower Body"
            ],
            "reason": (
                "A five-day hybrid split provides additional training "
                "volume while still training major muscle groups "
                "multiple times per week."
            )
        }

    # Six training days
    if days_per_week == 6:
        return {
            "split_name": "Push / Pull / Legs",
            "schedule": [
                "Push A",
                "Pull A",
                "Legs A",
                "Push B",
                "Pull B",
                "Legs B"
            ],
            "reason": (
                "A six-day push/pull/legs split distributes training "
                "volume across the week while training each major "
                "muscle group twice."
            )
        }

    # This should normally never happen because Pydantic
    # already validates that the value is between 2 and 6.
    raise ValueError("Unsupported number of training days")
from backend.user_repository import create_user

from backend.workout_session_repository import (
    complete_workout_session,
    create_workout_session,
    get_workout_sessions_by_user,
    log_workout_set,
)


def test_create_workout_session():
    user = create_user(
        name="Workout Session User",
        email="session@test.com",
    )

    session = create_workout_session(
        user_id=user["id"],
        program_id=None,
        workout_day_id=None,
        program_name="Test Strength Program",
        day_name="Upper Body A",
    )

    assert session is not None

    assert session["user_id"] == user["id"]

    assert (
        session["program_name"]
        == "Test Strength Program"
    )

    assert (
        session["day_name"]
        == "Upper Body A"
    )

    assert session["started_at"] is not None

    assert session["completed_at"] is None


def test_log_workout_set():
    user = create_user(
        name="Set Log User",
        email="setlog@test.com",
    )

    session = create_workout_session(
        user_id=user["id"],
        program_id=None,
        workout_day_id=None,
        program_name="Test Program",
        day_name="Upper Body A",
    )

    set_log = log_workout_set(
        user_id=user["id"],
        session_id=session["id"],
        workout_exercise_id=None,
        exercise_name="Bench Press",
        set_number=1,
        weight=225,
        weight_unit="lb",
        reps=8,
    )

    assert set_log is not None

    assert (
        set_log["session_id"]
        == session["id"]
    )

    assert (
        set_log["exercise_name"]
        == "Bench Press"
    )

    assert set_log["set_number"] == 1

    assert float(
        set_log["weight"]
    ) == 225.0

    assert (
        set_log["weight_unit"]
        == "lb"
    )

    assert set_log["reps"] == 8

    assert (
        set_log["completed"]
        is True
    )


def test_complete_workout_session():
    user = create_user(
        name="Complete Session User",
        email="complete@test.com",
    )

    session = create_workout_session(
        user_id=user["id"],
        program_id=None,
        workout_day_id=None,
        program_name="Test Program",
        day_name="Lower Body A",
    )

    completed_session = (
        complete_workout_session(
            user_id=user["id"],
            session_id=session["id"],
            notes="Good workout.",
        )
    )

    assert completed_session is not None

    assert (
        completed_session[
            "completed_at"
        ]
        is not None
    )

    assert (
        completed_session["notes"]
        == "Good workout."
    )


def test_get_workout_sessions_by_user():
    user = create_user(
        name="History User",
        email="history@test.com",
    )

    session = create_workout_session(
        user_id=user["id"],
        program_id=None,
        workout_day_id=None,
        program_name="History Test Program",
        day_name="Upper Body A",
    )

    log_workout_set(
        user_id=user["id"],
        session_id=session["id"],
        workout_exercise_id=None,
        exercise_name="Bench Press",
        set_number=1,
        weight=225,
        weight_unit="lb",
        reps=8,
    )

    log_workout_set(
        user_id=user["id"],
        session_id=session["id"],
        workout_exercise_id=None,
        exercise_name="Bench Press",
        set_number=2,
        weight=225,
        weight_unit="lb",
        reps=7,
    )

    complete_workout_session(
        user_id=user["id"],
        session_id=session["id"],
    )

    sessions = (
        get_workout_sessions_by_user(
            user["id"]
        )
    )

    assert len(sessions) == 1

    saved_session = sessions[0]

    assert (
        saved_session["id"]
        == session["id"]
    )

    assert (
        saved_session["program_name"]
        == "History Test Program"
    )

    assert (
        saved_session["day_name"]
        == "Upper Body A"
    )

    assert (
        saved_session["completed_at"]
        is not None
    )

    assert (
        len(saved_session["sets"])
        == 2
    )

    first_set = (
        saved_session["sets"][0]
    )

    second_set = (
        saved_session["sets"][1]
    )

    assert (
        first_set["exercise_name"]
        == "Bench Press"
    )

    assert (
        first_set["set_number"]
        == 1
    )

    assert (
        first_set["weight"]
        == 225.0
    )

    assert (
        first_set["reps"]
        == 8
    )

    assert (
        second_set["set_number"]
        == 2
    )

    assert (
        second_set["reps"]
        == 7
    )
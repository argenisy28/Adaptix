from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def create_test_user(
    name: str,
    email: str,
):
    response = client.post(
        "/api/users",
        json={
            "name": name,
            "email": email,
        },
    )

    assert response.status_code == 201

    return response.json()


def start_test_session(
    user_id: int,
    program_name: str = "Test Strength Program",
    day_name: str = "Upper Body A",
):
    response = client.post(
        f"/api/users/{user_id}/sessions",
        json={
            "program_id": None,
            "workout_day_id": None,
            "program_name": program_name,
            "day_name": day_name,
            "notes": None,
        },
    )

    assert response.status_code == 201

    return response.json()["session"]


# =====================================================
# GENERAL API TESTS
# =====================================================

def test_root_endpoint():

    response = client.get("/")

    assert response.status_code == 200

    assert response.json() == {
        "message": "Personalized Workout API is running!"
    }


def test_health_endpoint():

    response = client.get("/health")

    assert response.status_code == 200

    assert response.json() == {
        "status": "healthy"
    }


# =====================================================
# WORKOUT GENERATION API TESTS
# =====================================================

def test_generate_workout_endpoint():

    response = client.post(
        "/api/workouts/preview",
        json={
            "goal": "strength",
            "experience_level": "intermediate",
            "days_per_week": 4,
            "equipment": "full_gym",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["recommendation"]["split_name"]
        == "Upper / Lower"
    )

    assert len(data["workouts"]) == 4


def test_invalid_training_days_are_rejected():

    response = client.post(
        "/api/workouts/preview",
        json={
            "goal": "strength",
            "experience_level": "intermediate",
            "days_per_week": 10,
            "equipment": "full_gym",
        },
    )

    assert response.status_code == 422


def test_invalid_goal_is_rejected():

    response = client.post(
        "/api/workouts/preview",
        json={
            "goal": "become_superman",
            "experience_level": "intermediate",
            "days_per_week": 4,
            "equipment": "full_gym",
        },
    )

    assert response.status_code == 422


# =====================================================
# WORKOUT PROGRESS TRACKING API TESTS
# =====================================================

def test_start_workout_session_endpoint():

    user = create_test_user(
        name="Session API User",
        email="sessionapi@test.com",
    )

    response = client.post(
        f"/api/users/{user['id']}/sessions",
        json={
            "program_id": None,
            "workout_day_id": None,
            "program_name": "API Strength Program",
            "day_name": "Upper Body A",
            "notes": None,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert (
        data["message"]
        == "Workout session started successfully."
    )

    session = data["session"]

    assert (
        session["user_id"]
        == user["id"]
    )

    assert (
        session["program_name"]
        == "API Strength Program"
    )

    assert (
        session["day_name"]
        == "Upper Body A"
    )

    assert (
        session["started_at"]
        is not None
    )

    assert (
        session["completed_at"]
        is None
    )


def test_log_workout_set_endpoint():

    user = create_test_user(
        name="Set API User",
        email="setapi@test.com",
    )

    session = start_test_session(
        user_id=user["id"],
    )

    response = client.post(
        (
            f"/api/users/{user['id']}"
            f"/sessions/{session['id']}/sets"
        ),
        json={
            "workout_exercise_id": None,
            "exercise_name": "Bench Press",
            "set_number": 1,
            "weight": 225,
            "weight_unit": "lb",
            "reps": 8,
            "completed": True,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert (
        data["message"]
        == "Workout set logged successfully."
    )

    set_log = data["set"]

    assert (
        set_log["session_id"]
        == session["id"]
    )

    assert (
        set_log["exercise_name"]
        == "Bench Press"
    )

    assert (
        set_log["set_number"]
        == 1
    )

    assert (
        float(set_log["weight"])
        == 225.0
    )

    assert (
        set_log["weight_unit"]
        == "lb"
    )

    assert (
        set_log["reps"]
        == 8
    )

    assert (
        set_log["completed"]
        is True
    )


def test_complete_workout_session_endpoint():

    user = create_test_user(
        name="Complete API User",
        email="completeapi@test.com",
    )

    session = start_test_session(
        user_id=user["id"],
        day_name="Lower Body A",
    )

    response = client.put(
        (
            f"/api/users/{user['id']}"
            f"/sessions/{session['id']}/complete"
        ),
        json={
            "notes": "Strong workout.",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["message"]
        == "Workout session completed successfully."
    )

    completed_session = data[
        "session"
    ]

    assert (
        completed_session[
            "completed_at"
        ]
        is not None
    )

    assert (
        completed_session["notes"]
        == "Strong workout."
    )


def test_get_workout_history_endpoint():

    user = create_test_user(
        name="History API User",
        email="historyapi@test.com",
    )

    session = start_test_session(
        user_id=user["id"],
        program_name="History Program",
        day_name="Upper Body A",
    )

    # Log set 1
    response = client.post(
        (
            f"/api/users/{user['id']}"
            f"/sessions/{session['id']}/sets"
        ),
        json={
            "workout_exercise_id": None,
            "exercise_name": "Bench Press",
            "set_number": 1,
            "weight": 225,
            "weight_unit": "lb",
            "reps": 8,
            "completed": True,
        },
    )

    assert response.status_code == 201

    # Log set 2
    response = client.post(
        (
            f"/api/users/{user['id']}"
            f"/sessions/{session['id']}/sets"
        ),
        json={
            "workout_exercise_id": None,
            "exercise_name": "Bench Press",
            "set_number": 2,
            "weight": 225,
            "weight_unit": "lb",
            "reps": 7,
            "completed": True,
        },
    )

    assert response.status_code == 201

    # Complete workout
    response = client.put(
        (
            f"/api/users/{user['id']}"
            f"/sessions/{session['id']}/complete"
        ),
        json={
            "notes": "Workout completed.",
        },
    )

    assert response.status_code == 200

    # Retrieve history
    response = client.get(
        f"/api/users/{user['id']}/sessions"
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["user_id"]
        == user["id"]
    )

    assert (
        len(data["sessions"])
        == 1
    )

    saved_session = data[
        "sessions"
    ][0]

    assert (
        saved_session["id"]
        == session["id"]
    )

    assert (
        saved_session["program_name"]
        == "History Program"
    )

    assert (
        saved_session["day_name"]
        == "Upper Body A"
    )

    assert (
        saved_session[
            "completed_at"
        ]
        is not None
    )

    assert (
        len(saved_session["sets"])
        == 2
    )

    assert (
        saved_session["sets"][0][
            "exercise_name"
        ]
        == "Bench Press"
    )

    assert (
        saved_session["sets"][0][
            "set_number"
        ]
        == 1
    )

    assert (
        saved_session["sets"][0][
            "weight"
        ]
        == 225.0
    )

    assert (
        saved_session["sets"][0][
            "reps"
        ]
        == 8
    )

    assert (
        saved_session["sets"][1][
            "set_number"
        ]
        == 2
    )

    assert (
        saved_session["sets"][1][
            "reps"
        ]
        == 7
    )


def test_logging_set_to_missing_session_returns_404():

    user = create_test_user(
        name="Missing Session User",
        email="missingsession@test.com",
    )

    response = client.post(
        (
            f"/api/users/{user['id']}"
            "/sessions/999999/sets"
        ),
        json={
            "workout_exercise_id": None,
            "exercise_name": "Bench Press",
            "set_number": 1,
            "weight": 225,
            "weight_unit": "lb",
            "reps": 8,
            "completed": True,
        },
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail":
            "Workout session not found."
    }
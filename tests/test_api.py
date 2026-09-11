from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


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
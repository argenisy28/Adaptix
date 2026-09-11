from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

from backend.recommender import recommend_split
from backend.workout_generator import generate_program

app = FastAPI(
    title="Personalized Workout API",
    description="API for generating personalized workout programs.",
    version="0.1.0",
)


class WorkoutRequest(BaseModel):
    goal: Literal[
        "strength",
        "muscle_gain",
        "weight_loss",
        "general_fitness",
    ]

    experience_level: Literal[
        "beginner",
        "intermediate",
        "advanced",
    ]

    days_per_week: int = Field(
        ge=2,
        le=6,
        description="Number of days the user can train per week",
    )

    equipment: Literal[
        "full_gym",
        "home_gym",
        "bodyweight",
    ]


@app.get("/")
def root():
    return {
        "message": "Personalized Workout API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/api/workouts/preview")
def preview_workout(request: WorkoutRequest):

    recommended_split = recommend_split(
        goal=request.goal,
        experience_level=request.experience_level,
        days_per_week=request.days_per_week,
    )

    workouts = generate_program(
        schedule=recommended_split["schedule"],
        goal=request.goal,
        equipment=request.equipment,
    )

    return {
        "message": "Personalized workout generated successfully.",
        "user_preferences": {
            "goal": request.goal,
            "experience_level": request.experience_level,
            "days_per_week": request.days_per_week,
            "equipment": request.equipment,
        },
        "recommendation": {
            "split_name": recommended_split["split_name"],
            "reason": recommended_split["reason"],
        },
        "workouts": workouts,
    }
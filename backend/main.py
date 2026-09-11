from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from psycopg2.errors import UniqueViolation
from backend.workout_repository import (
    get_workout_programs_by_user,
    save_workout_program,
)

from backend.recommender import recommend_split
from backend.user_repository import (
    create_user,
    delete_user,
    get_user_by_id,
    update_user,
)
from backend.workout_generator import generate_program


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="Personalized Workout API",
    description="API for generating personalized workout programs.",
    version="0.1.0",
)


# ---------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------

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

class WorkoutSaveRequest(WorkoutRequest):
    program_name: str = Field(
        min_length=1,
        max_length=100,
    )

class UserCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: str = Field(
        min_length=3,
        max_length=255,
    )


class UserUpdate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: str = Field(
        min_length=3,
        max_length=255,
    )


# ---------------------------------------------------------
# General API endpoints
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# User CRUD endpoints
# ---------------------------------------------------------

# CREATE
@app.post("/api/users", status_code=201)
def create_new_user(user: UserCreate):
    try:
        created_user = create_user(
            name=user.name,
            email=user.email,
        )

        return created_user

    except UniqueViolation:
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists.",
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to create user.",
        )


# READ
@app.get("/api/users/{user_id}")
def get_user(user_id: int):
    try:
        user = get_user_by_id(user_id)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve user.",
        )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user


# UPDATE
@app.put("/api/users/{user_id}")
def update_existing_user(
    user_id: int,
    user: UserUpdate,
):
    try:
        updated_user = update_user(
            user_id=user_id,
            name=user.name,
            email=user.email,
        )

    except UniqueViolation:
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists.",
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to update user.",
        )

    if updated_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return updated_user


# DELETE
@app.delete("/api/users/{user_id}")
def delete_existing_user(user_id: int):
    try:
        deleted = delete_user(user_id)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to delete user.",
        )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return {
        "message": "User deleted successfully."
    }


# ---------------------------------------------------------
# Workout endpoints
# ---------------------------------------------------------

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
        experience_level=request.experience_level,
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

@app.post(
    "/api/users/{user_id}/workouts",
    status_code=201,
)
def generate_and_save_workout(
    user_id: int,
    request: WorkoutSaveRequest,
):

    # Make sure the user exists
    try:
        user = get_user_by_id(user_id)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve user.",
        )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Generate the recommended split
    recommended_split = recommend_split(
        goal=request.goal,
        experience_level=request.experience_level,
        days_per_week=request.days_per_week,
    )

    # Generate the actual workout days and exercises
    workouts = generate_program(
        schedule=recommended_split["schedule"],
        goal=request.goal,
        equipment=request.equipment,
        experience_level=request.experience_level,
    )

    # Save everything to PostgreSQL
    try:
        program_id = save_workout_program(
            user_id=user_id,
            program_name=request.program_name,
            goal=request.goal,
            experience_level=request.experience_level,
            days_per_week=request.days_per_week,
            equipment=request.equipment,
            workouts=workouts,
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to save workout program.",
        )

    return {
        "message": "Workout program generated and saved successfully.",
        "program_id": program_id,
        "user_id": user_id,
        "program_name": request.program_name,
        "recommendation": {
            "split_name": recommended_split["split_name"],
            "reason": recommended_split["reason"],
        },
        "workouts": workouts,
    }
@app.get("/api/users/{user_id}/workouts")
def get_saved_workouts(user_id: int):
    try:
        user = get_user_by_id(user_id)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve user.",
        )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    try:
        programs = get_workout_programs_by_user(
            user_id
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve workout programs.",
        )

    return {
        "user_id": user_id,
        "programs": programs,
    }
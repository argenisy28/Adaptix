# Adaptix

A full-stack fitness application that generates personalized workout programs based on a user's fitness goal, training experience, available equipment, and weekly training frequency.

> 🚧 Currently in active development

## Current Features

- Personalized workout split generation
- Strength, muscle gain, weight loss, and general fitness goals
- Beginner, intermediate, and advanced programming
- Equipment-specific exercise selection
- A/B/C workout exercise variations
- FastAPI REST API
- PostgreSQL database integration
- User CRUD operations
- Persistent workout program storage
- SQL JOIN-based workout retrieval
- Automated testing with pytest

## Tech Stack

### Backend
- Python
- FastAPI
- Pydantic

### Database
- PostgreSQL
- psycopg2
- SQL

### Testing
- pytest
- FastAPI TestClient

### Development
- Git
- GitHub

## Application Flow

User preferences are submitted to the API:

- Fitness goal
- Experience level
- Training days per week
- Available equipment

The backend then:

1. Recommends an appropriate workout split
2. Selects exercises based on available equipment
3. Adjusts volume based on experience level
4. Assigns sets, reps, and rest periods
5. Generates the complete weekly workout
6. Saves the workout program to PostgreSQL

## Database Structure

```text
users
  ↓
workout_programs
  ↓
workout_days
  ↓
workout_exercises

# Adaptix

Adaptix is a full-stack personalized training application that generates and stores workout programs based on a user's fitness goal, training experience, weekly training frequency, and available equipment.

The application combines a React and TypeScript frontend with a FastAPI backend and PostgreSQL database. Users can create or access a profile, generate personalized workout programs, save them permanently, view previously generated programs, refresh their program library, and delete programs they no longer want.

> 🚧 Currently in active development

## Current Features

- Personalized workout split generation
- Strength, muscle gain, weight loss, and general fitness goals
- Beginner, intermediate, and advanced programming
- Training frequency selection from 2–6 days per week
- Full gym, home gym, and bodyweight equipment options
- Equipment-specific exercise selection
- Automatically generated workout days and exercises
- Exercise sets, rep ranges, and rest recommendations
- User-friendly rest times displayed in minutes
- Personalized workout program naming
- User profile creation and lookup by email
- Local profile persistence using browser local storage
- Automatic loading of saved workout programs
- Manual saved-program refresh
- Expandable saved workout program cards
- Persistent workout program storage with PostgreSQL
- Delete saved workout programs
- Success notifications for workout creation and deletion
- Responsive dark-mode Adaptix interface
- React + TypeScript frontend
- FastAPI REST API
- PostgreSQL database integration
- User CRUD operations
- Relational workout program, workout day, and exercise storage
- SQL JOIN-based workout retrieval
- Cascading database relationships
- CORS-enabled frontend/backend communication
- Automated backend and database testing with pytest
- Separate development and testing databases
- 20 automated tests currently passing

- ## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS
- Browser Local Storage

### Backend
- Python
- FastAPI
- Uvicorn

### Database
- PostgreSQL
- psycopg2

### Testing
- pytest
- FastAPI TestClient
- Dedicated PostgreSQL test database

### Development Tools
- Git
- GitHub
- Visual Studio Code
- pgAdmin 4

- ## Architecture

Adaptix follows a full-stack client-server architecture:

1. The React frontend collects the user's workout preferences.
2. The frontend sends requests to the FastAPI REST API.
3. The backend uses recommendation and workout-generation logic to build a personalized program.
4. Generated programs are stored in PostgreSQL.
5. Saved programs can later be retrieved or deleted through the API.
6. The React interface automatically synchronizes the user's saved programs with the backend.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS workout_programs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    goal VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    days_per_week INTEGER NOT NULL,
    equipment VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_program_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_training_days
        CHECK (days_per_week BETWEEN 2 AND 6)
);


CREATE TABLE IF NOT EXISTS workout_days (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    day_name VARCHAR(100) NOT NULL,

    CONSTRAINT fk_day_program
        FOREIGN KEY (program_id)
        REFERENCES workout_programs(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS workout_exercises (
    id SERIAL PRIMARY KEY,
    workout_day_id INTEGER NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    movement_pattern VARCHAR(100) NOT NULL,
    sets INTEGER NOT NULL,
    reps VARCHAR(20) NOT NULL,
    rest_seconds INTEGER NOT NULL,
    exercise_order INTEGER NOT NULL,

    CONSTRAINT fk_exercise_day
        FOREIGN KEY (workout_day_id)
        REFERENCES workout_days(id)
        ON DELETE CASCADE
);

-- =====================================================
-- WORKOUT SESSIONS
-- Stores each workout that a user starts/completes.
-- =====================================================

CREATE TABLE IF NOT EXISTS workout_sessions (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    program_id INTEGER
        REFERENCES workout_programs(id)
        ON DELETE SET NULL,

    workout_day_id INTEGER
        REFERENCES workout_days(id)
        ON DELETE SET NULL,

    program_name VARCHAR(255) NOT NULL,

    day_name VARCHAR(255) NOT NULL,

    started_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    completed_at TIMESTAMP WITH TIME ZONE,

    notes TEXT
);


-- =====================================================
-- WORKOUT SET LOGS
-- Stores the actual performance of every set.
-- =====================================================

CREATE TABLE IF NOT EXISTS workout_set_logs (
    id SERIAL PRIMARY KEY,

    session_id INTEGER NOT NULL
        REFERENCES workout_sessions(id)
        ON DELETE CASCADE,

    workout_exercise_id INTEGER
        REFERENCES workout_exercises(id)
        ON DELETE SET NULL,

    exercise_name VARCHAR(255) NOT NULL,

    set_number INTEGER NOT NULL
        CHECK (set_number > 0),

    weight NUMERIC(7, 2),

    weight_unit VARCHAR(3)
        NOT NULL
        DEFAULT 'lb'
        CHECK (
            weight_unit IN ('lb', 'kg')
        ),

    reps INTEGER
        CHECK (reps >= 0),

    completed BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP
);
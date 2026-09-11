from psycopg2.extras import RealDictCursor

from backend.database import get_connection


def save_workout_program(
    user_id: int,
    program_name: str,
    goal: str,
    experience_level: str,
    days_per_week: int,
    equipment: str,
    workouts: list,
):
    """
    Save a complete generated workout program to PostgreSQL.

    The program, workout days, and exercises are saved
    together in one database transaction.
    """

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # -------------------------------------------------
            # Insert workout program
            # -------------------------------------------------

            cursor.execute(
                """
                INSERT INTO workout_programs (
                    user_id,
                    program_name,
                    goal,
                    experience_level,
                    days_per_week,
                    equipment
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (
                    user_id,
                    program_name,
                    goal,
                    experience_level,
                    days_per_week,
                    equipment,
                ),
            )

            program_id = cursor.fetchone()[0]

            # -------------------------------------------------
            # Insert workout days
            # -------------------------------------------------

            for day_number, workout_day in enumerate(
                workouts,
                start=1,
            ):
                cursor.execute(
                    """
                    INSERT INTO workout_days (
                        program_id,
                        day_number,
                        day_name
                    )
                    VALUES (%s, %s, %s)
                    RETURNING id;
                    """,
                    (
                        program_id,
                        day_number,
                        workout_day["day_name"],
                    ),
                )

                workout_day_id = cursor.fetchone()[0]

                # ---------------------------------------------
                # Insert exercises for this workout day
                # ---------------------------------------------

                for exercise_order, exercise in enumerate(
                    workout_day["exercises"],
                    start=1,
                ):
                    cursor.execute(
                        """
                        INSERT INTO workout_exercises (
                            workout_day_id,
                            exercise_name,
                            movement_pattern,
                            sets,
                            reps,
                            rest_seconds,
                            exercise_order
                        )
                        VALUES (
                            %s, %s, %s, %s, %s, %s, %s
                        );
                        """,
                        (
                            workout_day_id,
                            exercise["exercise"],
                            exercise["movement_pattern"],
                            exercise["sets"],
                            exercise["reps"],
                            exercise["rest_seconds"],
                            exercise_order,
                        ),
                    )

        # Save everything only after all inserts succeed
        connection.commit()

        return program_id

    except Exception:
        # Undo everything if any insert fails
        connection.rollback()
        raise

    finally:
        connection.close()


def get_workout_programs_by_user(user_id: int):
    """
    Retrieve all workout programs belonging to a user.

    SQL JOINs combine:
    - workout_programs
    - workout_days
    - workout_exercises

    The flat SQL rows are then converted into nested
    Python dictionaries for the API response.
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            cursor.execute(
                """
                SELECT
                    wp.id AS program_id,
                    wp.program_name,
                    wp.goal,
                    wp.experience_level,
                    wp.days_per_week,
                    wp.equipment,
                    wp.created_at,

                    wd.id AS workout_day_id,
                    wd.day_number,
                    wd.day_name,

                    we.id AS exercise_id,
                    we.exercise_name,
                    we.movement_pattern,
                    we.sets,
                    we.reps,
                    we.rest_seconds,
                    we.exercise_order

                FROM workout_programs AS wp

                LEFT JOIN workout_days AS wd
                    ON wd.program_id = wp.id

                LEFT JOIN workout_exercises AS we
                    ON we.workout_day_id = wd.id

                WHERE wp.user_id = %s

                ORDER BY
                    wp.id,
                    wd.day_number,
                    we.exercise_order;
                """,
                (user_id,),
            )

            rows = cursor.fetchall()

        # Stores completed programs using program ID as the key
        programs = {}

        # Helps us avoid creating the same workout day
        # multiple times when SQL returns one row per exercise
        day_lookup = {}

        for row in rows:

            program_id = row["program_id"]

            # -------------------------------------------------
            # Create program object once
            # -------------------------------------------------

            if program_id not in programs:
                programs[program_id] = {
                    "id": program_id,
                    "program_name": row["program_name"],
                    "goal": row["goal"],
                    "experience_level": row[
                        "experience_level"
                    ],
                    "days_per_week": row["days_per_week"],
                    "equipment": row["equipment"],
                    "created_at": row["created_at"],
                    "workout_days": [],
                }

            workout_day_id = row["workout_day_id"]

            # A LEFT JOIN could theoretically return a program
            # that does not yet contain any workout days.
            if workout_day_id is None:
                continue

            day_key = (
                program_id,
                workout_day_id,
            )

            # -------------------------------------------------
            # Create workout day object once
            # -------------------------------------------------

            if day_key not in day_lookup:

                workout_day = {
                    "id": workout_day_id,
                    "day_number": row["day_number"],
                    "day_name": row["day_name"],
                    "exercises": [],
                }

                day_lookup[day_key] = workout_day

                programs[program_id][
                    "workout_days"
                ].append(workout_day)

            # -------------------------------------------------
            # Add exercise to its workout day
            # -------------------------------------------------

            if row["exercise_id"] is not None:

                exercise = {
                    "id": row["exercise_id"],
                    "exercise_name": row["exercise_name"],
                    "movement_pattern": row[
                        "movement_pattern"
                    ],
                    "sets": row["sets"],
                    "reps": row["reps"],
                    "rest_seconds": row["rest_seconds"],
                    "exercise_order": row[
                        "exercise_order"
                    ],
                }

                day_lookup[day_key][
                    "exercises"
                ].append(exercise)

        return list(programs.values())

    finally:
        connection.close()
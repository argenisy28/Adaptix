from psycopg2.extras import RealDictCursor

from backend.database import get_connection


# =====================================================
# START WORKOUT SESSION
# =====================================================

def create_workout_session(
    user_id: int,
    program_id: int | None,
    workout_day_id: int | None,
    program_name: str,
    day_name: str,
    notes: str | None = None,
):
    """
    Create a new workout session.

    A session represents one actual workout performed
    by a user.
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:
            cursor.execute(
                """
                INSERT INTO workout_sessions (
                    user_id,
                    program_id,
                    workout_day_id,
                    program_name,
                    day_name,
                    notes
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                RETURNING
                    id,
                    user_id,
                    program_id,
                    workout_day_id,
                    program_name,
                    day_name,
                    started_at,
                    completed_at,
                    notes;
                """,
                (
                    user_id,
                    program_id,
                    workout_day_id,
                    program_name,
                    day_name,
                    notes,
                ),
            )

            session = cursor.fetchone()

        connection.commit()

        return dict(session)

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# =====================================================
# LOG WORKOUT SET
# =====================================================

def log_workout_set(
    user_id: int,
    session_id: int,
    workout_exercise_id: int | None,
    exercise_name: str,
    set_number: int,
    weight: float | None,
    weight_unit: str,
    reps: int | None,
    completed: bool = True,
):
    """
    Save one completed exercise set.

    Example:
        Bench Press
        Set 1
        225 lb
        8 reps
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            # Confirm that this workout session
            # belongs to the current user.
            cursor.execute(
                """
                SELECT id
                FROM workout_sessions
                WHERE id = %s
                  AND user_id = %s;
                """,
                (
                    session_id,
                    user_id,
                ),
            )

            session = cursor.fetchone()

            if session is None:
                return None

            cursor.execute(
                """
                INSERT INTO workout_set_logs (
                    session_id,
                    workout_exercise_id,
                    exercise_name,
                    set_number,
                    weight,
                    weight_unit,
                    reps,
                    completed
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                RETURNING
                    id,
                    session_id,
                    workout_exercise_id,
                    exercise_name,
                    set_number,
                    weight,
                    weight_unit,
                    reps,
                    completed,
                    created_at;
                """,
                (
                    session_id,
                    workout_exercise_id,
                    exercise_name,
                    set_number,
                    weight,
                    weight_unit,
                    reps,
                    completed,
                ),
            )

            set_log = cursor.fetchone()

        connection.commit()

        return dict(set_log)

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# =====================================================
# COMPLETE WORKOUT SESSION
# =====================================================

def complete_workout_session(
    user_id: int,
    session_id: int,
    notes: str | None = None,
):
    """
    Mark a workout session as completed.
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:
            cursor.execute(
                """
                UPDATE workout_sessions

                SET
                    completed_at =
                        CURRENT_TIMESTAMP,

                    notes =
                        COALESCE(
                            %s,
                            notes
                        )

                WHERE id = %s
                  AND user_id = %s

                RETURNING
                    id,
                    user_id,
                    program_id,
                    workout_day_id,
                    program_name,
                    day_name,
                    started_at,
                    completed_at,
                    notes;
                """,
                (
                    notes,
                    session_id,
                    user_id,
                ),
            )

            session = cursor.fetchone()

        connection.commit()

        if session is None:
            return None

        return dict(session)

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# =====================================================
# GET USER WORKOUT HISTORY
# =====================================================

def get_workout_sessions_by_user(
    user_id: int,
):
    """
    Retrieve workout history for one user,
    including every logged set.
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:
            cursor.execute(
                """
                SELECT
                    ws.id AS session_id,
                    ws.user_id,
                    ws.program_id,
                    ws.workout_day_id,
                    ws.program_name,
                    ws.day_name,
                    ws.started_at,
                    ws.completed_at,
                    ws.notes,

                    wsl.id AS set_log_id,
                    wsl.workout_exercise_id,
                    wsl.exercise_name,
                    wsl.set_number,
                    wsl.weight,
                    wsl.weight_unit,
                    wsl.reps,
                    wsl.completed,
                    wsl.created_at

                FROM workout_sessions AS ws

                LEFT JOIN workout_set_logs AS wsl
                    ON wsl.session_id = ws.id

                WHERE ws.user_id = %s

                ORDER BY
                    ws.started_at DESC,
                    wsl.id ASC;
                """,
                (
                    user_id,
                ),
            )

            rows = cursor.fetchall()

        sessions = {}

        for row in rows:
            session_id = row[
                "session_id"
            ]

            if session_id not in sessions:
                sessions[
                    session_id
                ] = {
                    "id":
                        session_id,

                    "user_id":
                        row[
                            "user_id"
                        ],

                    "program_id":
                        row[
                            "program_id"
                        ],

                    "workout_day_id":
                        row[
                            "workout_day_id"
                        ],

                    "program_name":
                        row[
                            "program_name"
                        ],

                    "day_name":
                        row[
                            "day_name"
                        ],

                    "started_at":
                        row[
                            "started_at"
                        ],

                    "completed_at":
                        row[
                            "completed_at"
                        ],

                    "notes":
                        row[
                            "notes"
                        ],

                    "sets": [],
                }

            if (
                row[
                    "set_log_id"
                ]
                is not None
            ):
                sessions[
                    session_id
                ][
                    "sets"
                ].append(
                    {
                        "id":
                            row[
                                "set_log_id"
                            ],

                        "workout_exercise_id":
                            row[
                                "workout_exercise_id"
                            ],

                        "exercise_name":
                            row[
                                "exercise_name"
                            ],

                        "set_number":
                            row[
                                "set_number"
                            ],

                        "weight":
                            (
                                float(
                                    row[
                                        "weight"
                                    ]
                                )
                                if row[
                                    "weight"
                                ]
                                is not None
                                else None
                            ),

                        "weight_unit":
                            row[
                                "weight_unit"
                            ],

                        "reps":
                            row[
                                "reps"
                            ],

                        "completed":
                            row[
                                "completed"
                            ],

                        "created_at":
                            row[
                                "created_at"
                            ],
                    }
                )

        return list(
            sessions.values()
        )

    finally:
        connection.close()
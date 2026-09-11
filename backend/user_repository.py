from psycopg2.extras import RealDictCursor

from backend.database import get_connection


def create_user(name: str, email: str):
    """
    Insert a new user into PostgreSQL
    and return the created user.
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            cursor.execute(
                """
                INSERT INTO users (name, email)
                VALUES (%s, %s)
                RETURNING id, name, email, created_at;
                """,
                (name, email),
            )

            user = cursor.fetchone()

        connection.commit()

        return dict(user)

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()

def get_user_by_id(user_id: int):
    """
    Retrieve a user from PostgreSQL by ID.
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            cursor.execute(
                """
                SELECT id, name, email, created_at
                FROM users
                WHERE id = %s;
                """,
                (user_id,),
            )

            user = cursor.fetchone()

        if user is None:
            return None

        return dict(user)

    finally:
        connection.close()


def update_user(
    user_id: int,
    name: str,
    email: str,
):
    """
    Update an existing user's name and email.
    """

    connection = get_connection()

    try:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            cursor.execute(
                """
                UPDATE users
                SET name = %s,
                    email = %s
                WHERE id = %s
                RETURNING id, name, email, created_at;
                """,
                (
                    name,
                    email,
                    user_id,
                ),
            )

            user = cursor.fetchone()

        connection.commit()

        if user is None:
            return None

        return dict(user)

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


def delete_user(user_id: int):
    """
    Delete a user from PostgreSQL.
    """

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                DELETE FROM users
                WHERE id = %s
                RETURNING id;
                """,
                (user_id,),
            )

            deleted_user = cursor.fetchone()

        connection.commit()

        return deleted_user is not None

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
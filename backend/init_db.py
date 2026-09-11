from pathlib import Path

from backend.database import get_connection


def initialize_database():
    """
    Create all database tables defined in schema.sql.
    """

    connection = get_connection()

    try:
        schema_path = Path(__file__).parent / "schema.sql"

        with open(schema_path, "r", encoding="utf-8") as schema_file:
            schema_sql = schema_file.read()

        with connection.cursor() as cursor:
            cursor.execute(schema_sql)

        connection.commit()

        print("Database tables created successfully!")

    except Exception as error:
        connection.rollback()

        print("Error creating database tables:")
        print(error)

    finally:
        connection.close()


if __name__ == "__main__":
    initialize_database()
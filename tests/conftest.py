import os
from pathlib import Path

import pytest
from dotenv import load_dotenv

from backend.database import get_connection


load_dotenv()


TEST_DB_NAME = os.getenv(
    "TEST_DB_NAME",
    "personalized_workout_test",
)


@pytest.fixture(scope="session", autouse=True)
def prepare_test_database():
    """
    Create the application schema inside the test database
    before the test session begins.
    """

    connection = get_connection(TEST_DB_NAME)

    try:
        schema_path = (
            Path(__file__).parent.parent
            / "backend"
            / "schema.sql"
        )

        with open(
            schema_path,
            "r",
            encoding="utf-8",
        ) as schema_file:
            schema_sql = schema_file.read()

        with connection.cursor() as cursor:
            cursor.execute(schema_sql)

        connection.commit()

    finally:
        connection.close()


@pytest.fixture(autouse=True)
def use_test_database(monkeypatch):
    """
    Force repository functions to use the test database
    instead of the development database.
    """

    monkeypatch.setenv(
        "DB_NAME",
        TEST_DB_NAME,
    )


@pytest.fixture(autouse=True)
def clean_test_database(
    prepare_test_database,
    use_test_database,
):
    """
    Remove test data before every test so each test
    starts with a clean database.
    """

    connection = get_connection(TEST_DB_NAME)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                TRUNCATE TABLE
                    workout_exercises,
                    workout_days,
                    workout_programs,
                    users
                RESTART IDENTITY
                CASCADE;
                """
            )

        connection.commit()

    finally:
        connection.close()
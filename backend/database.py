import os

import psycopg2
from dotenv import load_dotenv


load_dotenv()


def get_connection(database_name: str | None = None):
    """
    Create and return a PostgreSQL database connection.

    If database_name is provided, connect to that database.
    Otherwise, use the normal development database from .env.
    """

    db_name = database_name or os.getenv("DB_NAME")

    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=db_name,
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )
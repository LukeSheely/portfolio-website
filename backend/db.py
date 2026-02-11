"""
Database connection module.

Uses psycopg2 directly (no ORM) to demonstrate raw SQL skills.
Provides a simple connection pool for efficient database access.

AWS Integration: RDS (PostgreSQL)
- In production, DB_HOST points to your RDS instance endpoint
- In local dev, it points to localhost
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import config


def get_connection():
    """Create a new database connection using environment config."""
    return psycopg2.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        dbname=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
    )


@contextmanager
def get_db():
    """
    Context manager for database connections.

    Usage:
        with get_db() as (conn, cur):
            cur.execute("SELECT * FROM projects")
            rows = cur.fetchall()

    - Automatically commits on success
    - Automatically rolls back on error
    - Always closes the connection when done
    - Uses RealDictCursor so rows come back as dictionaries
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        yield conn, cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

import sqlite3
from contextlib import contextmanager
from pathlib import Path

from api.leetcode.activity_models import Submission, SyncState


class ActivityStore:
    def __init__(self, path: str, username: str):
        self.path = path
        self.username = username.casefold()

    @contextmanager
    def connect(self):
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        db = sqlite3.connect(self.path, timeout=5)
        db.row_factory = sqlite3.Row
        try:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS lc_submissions (
                    account TEXT NOT NULL, id TEXT NOT NULL,
                    timestamp INTEGER NOT NULL, slug TEXT NOT NULL,
                    PRIMARY KEY (account, id)
                );
                CREATE INDEX IF NOT EXISTS lc_submission_time ON lc_submissions(account, timestamp);
                CREATE TABLE IF NOT EXISTS lc_questions (
                    slug TEXT PRIMARY KEY, difficulty TEXT, checked_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS lc_sync (
                    account TEXT PRIMARY KEY, state TEXT NOT NULL,
                    next_attempt INTEGER NOT NULL DEFAULT 0, lease_until INTEGER NOT NULL DEFAULT 0
                );
            """)
            yield db
            db.commit()
        except BaseException:
            db.rollback()
            raise
        finally:
            db.close()

    def _state(self, db) -> SyncState:
        row = db.execute(
            "SELECT state FROM lc_sync WHERE account=?", (self.username,)
        ).fetchone()
        return SyncState.model_validate_json(row["state"]) if row else SyncState()

    def claim(self, now: int) -> SyncState | None:
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            db.execute(
                "INSERT OR IGNORE INTO lc_sync(account,state) VALUES (?,?)",
                (self.username, SyncState().model_dump_json()),
            )
            row = db.execute(
                "SELECT * FROM lc_sync WHERE account=?", (self.username,)
            ).fetchone()
            if row["lease_until"] > now or row["next_attempt"] > now:
                return None
            state = self._state(db)
            state.status = "syncing"
            state.message = None
            db.execute(
                "UPDATE lc_sync SET lease_until=?,state=? WHERE account=?",
                (now + 120, state.model_dump_json(), self.username),
            )
            return state

    def checkpoint(self, state: SyncState, submissions: list[Submission]):
        with self.connect() as db:
            db.executemany(
                "INSERT OR IGNORE INTO lc_submissions VALUES (?,?,?,?)",
                [
                    (self.username, item.id, item.timestamp, item.titleSlug)
                    for item in submissions
                    if item.statusDisplay == "Accepted"
                ],
            )
            db.execute(
                "UPDATE lc_sync SET state=? WHERE account=?",
                (state.model_dump_json(), self.username),
            )

    def finish(self, state: SyncState, next_attempt: int):
        with self.connect() as db:
            db.execute(
                "UPDATE lc_sync SET state=?,next_attempt=?,lease_until=0 WHERE account=?",
                (state.model_dump_json(), next_attempt, self.username),
            )

    def pending_questions(self, now: int, cutoff: int, limit: int = 10) -> list[str]:
        with self.connect() as db:
            rows = db.execute(
                """
                SELECT DISTINCT s.slug FROM lc_submissions s
                LEFT JOIN lc_questions q ON q.slug=s.slug
                WHERE s.account=? AND s.timestamp>=? AND (
                    q.slug IS NULL OR q.checked_at<=? OR (q.difficulty IS NULL AND q.checked_at<=?)
                ) ORDER BY q.checked_at LIMIT ?
            """,
                (self.username, cutoff, now - 30 * 86400, now - 900, limit),
            ).fetchall()
            return [row["slug"] for row in rows]

    def save_questions(self, questions: dict[str, str | None], now: int):
        with self.connect() as db:
            db.executemany(
                "INSERT OR REPLACE INTO lc_questions VALUES (?,?,?)",
                [(slug, difficulty, now) for slug, difficulty in questions.items()],
            )

    def snapshot(self, cutoff: int):
        with self.connect() as db:
            db.execute("BEGIN")
            state = self._state(db)
            rows = db.execute(
                """
                SELECT s.timestamp,s.slug,q.difficulty FROM lc_submissions s
                LEFT JOIN lc_questions q ON q.slug=s.slug
                WHERE s.account=? AND s.timestamp>=? ORDER BY s.timestamp
            """,
                (self.username, cutoff),
            ).fetchall()
            return state, [dict(row) for row in rows]

    def schedule(self):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            state = self._state(db)
            state.message = None
            state.status = "pending"
            db.execute(
                """
                INSERT INTO lc_sync(account,state,next_attempt) VALUES (?,?,0)
                ON CONFLICT(account) DO UPDATE SET next_attempt=0,state=excluded.state
            """,
                (self.username, state.model_dump_json()),
            )

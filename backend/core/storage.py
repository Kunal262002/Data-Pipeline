"""Simple thread-safe in-memory store for normalized records.

This module is intentionally decoupled from the API layer so it can be
swapped for a database-backed implementation without changing callers.
"""
import threading


class DataStore:
    def __init__(self):
        self._lock = threading.RLock()
        self._records = []

    def add_many(self, records):
        """Append records and return total count."""
        with self._lock:
            self._records.extend(records)
            return len(self._records)

    def all(self):
        """Return a snapshot of all records."""
        with self._lock:
            return list(self._records)

    def clear(self):
        """Remove all records. Returns the number removed."""
        with self._lock:
            count = len(self._records)
            self._records = []
            return count

    def count(self):
        with self._lock:
            return len(self._records)


# Singleton instance used across the app.
store = DataStore()


"""Normalization and transformation helpers.

Normalization rules:
- Keys are lowercased and spaces/dashes replaced with underscores.
- Numeric-looking strings are converted to int/float.
- Boolean strings are converted to real booleans.
- Empty strings and None values are dropped.
- Each record is tagged with a source and ingested timestamp.
"""
import re
from datetime import datetime, timezone


def _coerce(value):
    """Best-effort type coercion for a scalar value."""
    if not isinstance(value, str):
        return value
    stripped = value.strip()
    if stripped == "":
        return None
    lowered = stripped.lower()
    if lowered in ("true", "false"):
        return lowered == "true"
    if lowered in ("null", "none", "nil"):
        return None
    # Integer
    try:
        return int(stripped)
    except ValueError:
        pass
    # Float
    try:
        return float(stripped)
    except ValueError:
        pass
    return stripped


def normalize_record(record, source="unknown"):
    """Return a normalized copy of a single record dict."""
    normalized = {}
    for raw_key, raw_value in record.items():
        key = re.sub(r"\s+|-", "_", str(raw_key).strip().lower())
        if not key:
            continue
        value = _coerce(raw_value)
        if value is None:
            continue  # drop nulls/empty
        normalized[key] = value
    normalized["_source"] = source
    normalized["_ingested_at"] = datetime.now(timezone.utc).isoformat()
    return normalized


def normalize_records(records, source="unknown"):
    """Normalize a list of records."""
    return [normalize_record(r, source) for r in records if isinstance(r, dict)]


# --- Transformations -----------------------------------------------------

def filter_records(records, predicate):
    """Filter records by a predicate (dict of field -> expected value)."""
    result = list(records)
    for field, expected in predicate.items():
        result = [r for r in result if r.get(field) == expected]
    return result


def sort_records(records, field, descending=False):
    """Sort records by a numeric-capable field."""
    def key(r):
        return r.get(field)
    return sorted(records, key=key, reverse=descending)


def group_records(records, field):
    """Group records by a field, returning a dict of field -> records."""
    grouped = {}
    for r in records:
        grouped.setdefault(r.get(field), []).append(r)
    return grouped

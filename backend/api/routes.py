"""REST endpoints for the data pipeline."""
from flask import Blueprint, jsonify, request

from core import normalizer
from core.fetcher import fetch_and_parse, FetchError
from core.parser import parse_payload, ParserError
from core.storage import store

api_bp = Blueprint("api", __name__)


def error_response(message, status=400):
    return jsonify({"success": False, "error": message}), status


def ok_response(data, **extra):
    payload = {"success": True, "data": data}
    payload.update(extra)
    return jsonify(payload)


@api_bp.get("/health")
def health():
    return jsonify({"success": True, "status": "ok", "records": store.count()})


def _ingest_records(records, source, fmt):
    normalized = normalizer.normalize_records(records, source=source)
    total = store.add_many(normalized)
    return total, normalized


@api_bp.post("/ingest/json")
def ingest_json():
    body = request.get_json(silent=True) or {}
    payload = body.get("payload")
    url = body.get("url")
    try:
        if url:
            records = fetch_and_parse(url, "json")
        else:
            if not payload:
                return error_response("Missing 'payload' or 'url'.")
            records = parse_payload(payload if isinstance(payload, str) else str(payload), "json")
    except (ParserError, FetchError) as exc:
        return error_response(str(exc))

    total, normalized = _ingest_records(records, "json", "json")
    return ok_response(normalized, ingested=len(normalized), total_records=total)


@api_bp.post("/ingest/xml")
def ingest_xml():
    body = request.get_json(silent=True) or {}
    payload = body.get("payload")
    url = body.get("url")
    try:
        if url:
            records = fetch_and_parse(url, "xml")
        else:
            if not payload:
                return error_response("Missing 'payload' or 'url'.")
            records = parse_payload(payload, "xml")
    except (ParserError, FetchError) as exc:
        return error_response(str(exc))

    total, normalized = _ingest_records(records, "xml", "xml")
    return ok_response(normalized, ingested=len(normalized), total_records=total)


@api_bp.post("/ingest/csv")
def ingest_csv():
    body = request.get_json(silent=True) or {}
    payload = body.get("payload")
    url = body.get("url")
    try:
        if url:
            records = fetch_and_parse(url, "csv")
        else:
            if not payload:
                return error_response("Missing 'payload' or 'url'.")
            records = parse_payload(payload, "csv")
    except (ParserError, FetchError) as exc:
        return error_response(str(exc))

    total, normalized = _ingest_records(records, "csv", "csv")
    return ok_response(normalized, ingested=len(normalized), total_records=total)


@api_bp.post("/ingest/external")
def ingest_external():
    body = request.get_json(silent=True) or {}
    url = body.get("url")
    fmt = body.get("format")  # optional; auto-detected if absent
    headers = body.get("headers")
    if not url:
        return error_response("Missing 'url'.")
    try:
        records = fetch_and_parse(url, fmt, headers=headers)
    except FetchError as exc:
        return error_response(str(exc), status=502)

    total, normalized = _ingest_records(records, f"external:{url}", "external")
    return ok_response(normalized, ingested=len(normalized), total_records=total)


@api_bp.get("/data")
def get_data():
    return ok_response(store.all(), total=store.count())


@api_bp.delete("/data")
def clear_data():
    removed = store.clear()
    return ok_response([], removed=removed, total=store.count())


@api_bp.get("/data/transform")
def transform_data():
    records = store.all()
    field = request.args.get("sort_by")
    sort_dir = request.args.get("sort_desc", "false").lower() == "true"
    if field:
        records = normalizer.sort_records(records, field, sort_dir)

    group_by = request.args.get("group_by")
    if group_by:
        grouped = normalizer.group_records(records, group_by)
        return ok_response(grouped, total=store.count())

    field_filter = request.args.get("filter_field")
    expected = request.args.get("filter_value")
    if field_filter and expected:
        records = normalizer.filter_records(records, {field_filter: expected})

    return ok_response(records, total=len(records))


@api_bp.get("/stats")
def stats():
    records = store.all()
    total = len(records)
    sources = {}
    for r in records:
        src = r.get("_source", "unknown")
        sources[src] = sources.get(src, 0) + 1

    # Numeric aggregation across all records
    numeric_fields = {}
    for r in records:
        for key, value in r.items():
            if key.startswith("_") or not isinstance(value, (int, float)):
                continue
            entry = numeric_fields.setdefault(
                key, {"sum": 0, "count": 0, "min": None, "max": None}
            )
            entry["sum"] += value
            entry["count"] += 1
            entry["min"] = value if entry["min"] is None else min(entry["min"], value)
            entry["max"] = value if entry["max"] is None else max(entry["max"], value)

    for key in numeric_fields:
        e = numeric_fields[key]
        e["avg"] = round(e["sum"] / e["count"], 4) if e["count"] else 0

    return ok_response(
        {
            "total_records": total,
            "sources": sources,
            "numeric_fields": numeric_fields,
        }
    )

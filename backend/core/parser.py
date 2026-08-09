"""Parsers for JSON, XML, CSV and HTTP-payload formats.

Each parser returns a list of unified record dictionaries so downstream
processing (normalization) is format-agnostic.
"""
import csv
import io
import json
import xml.etree.ElementTree as ET


class ParserError(Exception):
    """Raised when a payload cannot be parsed."""


def to_list(value):
    """Normalize a parsed value into a list of items."""
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return [value]
    return []


def parse_json(payload):
    """Parse a JSON string into a list of records.

    Supports top-level arrays of objects, a single object, or a wrapper
    object that contains a list under a known key.
    """
    try:
        data = json.loads(payload)
    except (json.JSONDecodeError, TypeError) as exc:
        raise ParserError(f"Invalid JSON: {exc}")

    if isinstance(data, list):
        return [r for r in data if isinstance(r, dict)]
    if isinstance(data, dict):
        # Try common wrapper keys
        for key in ("data", "records", "items", "results", "rows"):
            if key in data and isinstance(data[key], list):
                return [r for r in data[key] if isinstance(r, dict)]
        return [data]
    raise ParserError("JSON must be an object or an array of objects.")


def _element_to_dict(element):
    """Convert an XML element to a dict, handling repeated children."""
    if len(element) == 0:
        text = (element.text or "").strip()
        return text
    result = {}
    for child in element:
        value = _element_to_dict(child)
        if child.tag in result:
            # Multiple children with same tag -> promote to list
            if not isinstance(result[child.tag], list):
                result[child.tag] = [result[child.tag]]
            result[child.tag].append(value)
        else:
            result[child.tag] = value
    return result


def parse_xml(payload):
    """Parse an XML string into a list of records.

    The root element is expected to wrap `record`/`item`/`row` children,
    or the children themselves are treated as records.
    """
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as exc:
        raise ParserError(f"Invalid XML: {exc}")

    record_tags = ("record", "item", "row", "entry")
    children = [c for c in root if isinstance(c.tag, str)]
    records = [c for c in children if c.tag in record_tags]

    if not records:
        # Fall back to all element children as records
        records = [c for c in children if len(c) > 0]

    parsed = [_element_to_dict(r) for r in records]
    return [r for r in parsed if isinstance(r, dict)]


def parse_csv(payload):
    """Parse a CSV string into a list of record dicts."""
    try:
        reader = csv.DictReader(io.StringIO(payload))
        records = [dict(row) for row in reader if any(v.strip() for v in dict(row).values())]
    except Exception as exc:
        raise ParserError(f"Invalid CSV: {exc}")
    return records


def parse_payload(payload, fmt):
    """Dispatch to the correct parser based on the requested format."""
    fmt = (fmt or "").lower()
    if fmt == "json":
        return parse_json(payload)
    if fmt == "xml":
        return parse_xml(payload)
    if fmt == "csv":
        return parse_csv(payload)
    raise ParserError(f"Unsupported format: {fmt}")

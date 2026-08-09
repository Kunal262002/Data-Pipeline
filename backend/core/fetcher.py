"""External API ingestion."""
import requests

from .parser import parse_payload, ParserError


class FetchError(Exception):
    """Raised when an external API cannot be reached or parsed."""


def fetch_and_parse(url, fmt="json", params=None, headers=None, timeout=15):
    """GET an external URL, then parse the response body.

    If `fmt` is provided it is used to parse the body. Otherwise the
    Content-Type header is used to guess the format.
    """
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=timeout)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise FetchError(f"Request failed for {url}: {exc}")

    content_type = resp.headers.get("Content-Type", "")
    if not fmt:
        if "xml" in content_type:
            fmt = "xml"
        elif "html" in content_type or "text/csv" in content_type:
            fmt = "csv"
        else:
            fmt = "json"

    try:
        return parse_payload(resp.text, fmt)
    except ParserError as exc:
        raise FetchError(f"Could not parse response from {url}: {exc}")

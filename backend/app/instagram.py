"""Fetch Instagram post thumbnail from OG tags. No API key needed."""
import re
import urllib.request


def fetch_thumbnail(url: str) -> str | None:
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            match = re.search(r'<meta\s+property="og:image"\s+content="([^"]+)"', html)
            return match.group(1) if match else None
    except Exception:
        return None

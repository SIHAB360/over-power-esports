#!/usr/bin/env python3
"""Safe, redacted validation of a Supabase Session Pooler secret.

Do NOT print connection strings or passwords, even on failure.
This module needs no external packages and never attempts a connection.
"""
import os
import sys
from urllib.parse import urlsplit

PROJECT_REF = "siiftefxumacaitjmuxj"

def validate(raw: str) -> tuple[bool, str]:
    value = (raw or "").strip()
    if not value:
        return False, (
            "GitHub secret SUPABASE_SESSION_POOLER_URL is missing or empty. "
            "Open GitHub Settings > Secrets and variables > Actions, add the secret "
            "with the COMPLETE Session pooler URI copied from Supabase Connect."
        )
    if not value.startswith(("postgresql://", "postgres://")):
        return False, (
            "Secret is not a PostgreSQL URI. A password alone, API key, database "
            "host, or a quoted connection string is not enough. Supabase: "
            "Connect > Method: Session pooler > URI > Copy."
        )
    try:
        parsed = urlsplit(value)
        host = parsed.hostname
        port = parsed.port
        user = parsed.username
        password = parsed.password
    except (ValueError, TypeError):
        return False, "Malformed PostgreSQL URI. Copy the entire Session pooler URI from Supabase Connect."
    if not host:
        return False, "Session Pooler hostname is missing from the connection URI."
    if host == f"db.{PROJECT_REF}.supabase.co":
        return False, (
            "This is the Direct Connection (IPv6), not the Session pooler. "
            "GitHub-hosted runners cannot reliably reach it. In Supabase Connect, "
            "switch Method from Direct connection to Session pooler, then copy the new URI."
        )
    if not host.endswith(".pooler.supabase.com"):
        return False, (
            "The hostname is not the Supabase shared Session pooler. "
            "Copy the Session pooler host exactly from Connect; do not guess it from region."
        )
    if port != 5432:
        return False, (
            "Wrong pooler port. Session pooler must use 5432, "
            "not transaction-pooler port 6543."
        )
    if user != f"postgres.{PROJECT_REF}":
        return False, (
            "Incorrect Session pooler database user. It should be postgres."
            "siiftefxumacaitjmuxj (not the Direct connection user postgres)."
        )
    if not password or "[YOUR-PASSWORD]" in password or "YOUR-PASSWORD" in password:
        return False, (
            "Database password placeholder has not been replaced. "
            "Enter your actual database password inside the GitHub Secret only; "
            "percent-encode reserved URI characters. Do not share the password in chat."
        )
    if parsed.path != "/postgres":
        return False, "Expected database name /postgres. Copy the complete URI from Supabase Connect."
    if "\n" in value or "\r" in value:
        return False, "Connection string must be a single line, not a multiline value."
    return True, "Session pooler URI structure is valid (database login has NOT yet been tested)."


if __name__ == "__main__":
    ok, message = validate(os.environ.get("SUPABASE_SESSION_POOLER_URL", ""))
    if ok:
        print(message)
    else:
        print(f"::error::{message}")
    sys.exit(0 if ok else 1)

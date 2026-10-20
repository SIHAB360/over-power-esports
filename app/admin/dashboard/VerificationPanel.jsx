"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck, FiClock, FiCopy, FiDatabase, FiKey, FiLock,
  FiRefreshCw, FiShield, FiWifiOff, FiSearch,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import styles from "./verification.module.css";

function dateText(value) {
  if (!value) return "No expiry set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No valid expiry set";
  return date.toLocaleString("en-BD", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isExpired(item, now) {
  if (!item.expiresAt) return false;
  const time = new Date(item.expiresAt).getTime();
  return Number.isFinite(time) && time <= now;
}

export default function VerificationPanel({ refreshVersion = 0, moderatorMode = false }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copyError, setCopyError] = useState("");
  const [copied, setCopied] = useState(null);
  const [checkedAt, setCheckedAt] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(() => Date.now());
  const requestNumber = useRef(0);

  const loadCodes = useCallback(async ({ quiet = false } = {}) => {
    const requestId = ++requestNumber.current;
    if (!quiet) setRefreshing(true);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (sessionError || !token) {
        throw new Error("Admin session not found. Please sign in again.");
      }

      const response = await fetch(moderatorMode?"/api/moderator/registration-codes":"/api/admin/registration-codes", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to load registration codes.");
      }

      if (requestId !== requestNumber.current) return;
      setCodes(Array.isArray(result.codes) ? result.codes : []);
      setCheckedAt(result.checkedAt || new Date().toISOString());
      setError("");
      setNow(Date.now());
    } catch (err) {
      if (requestId === requestNumber.current) {
        setError(err?.message || "Failed to connect to the verification database.");
      }
    } finally {
      if (requestId === requestNumber.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCodes();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadCodes({ quiet: true });
    }, 30000);
    const clockTimer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(clockTimer);
      requestNumber.current += 1;
    };
  }, [loadCodes, refreshVersion]);

  const activeCount = useMemo(
    () => codes.filter((code) => !isExpired(code, now)).length,
    [codes, now]
  );
  const expiredCount = codes.length - activeCount;
  const visibleCodes = useMemo(() => codes.filter((item) => {
    if (filter === "valid" && isExpired(item, now)) return false;
    if (filter === "expired" && !isExpired(item, now)) return false;
    return item.code.toLowerCase().includes(query.trim().toLowerCase());
  }), [codes, filter, query, now]);

  async function copyCode(item) {
    setCopyError("");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.code);
      } else {
        // Fallback for browsers without the modern Clipboard API.
        const field = document.createElement("textarea");
        field.value = item.code;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copiedSuccessfully = document.execCommand("copy");
        field.remove();
        if (!copiedSuccessfully) throw new Error("Clipboard permission denied");
      }
      setCopied(item.id);
      window.setTimeout(() => {
        setCopied((previous) => previous === item.id ? null : previous);
      }, 1900);
    } catch {
      setCopyError("Copy failed. Check browser clipboard permission and try again.");
    }
  }

  return (
    <section data-op-verification-shell className={styles.root} aria-label="Registration verification codes">
      <div data-op-verification-hero className={styles.hero}>
        <div className={styles.heroTitle}>
          <span className={styles.heroIcon}><FiShield aria-hidden="true" /></span>
          <div>
            <div className={styles.eyebrow}>SECURE ADMIN ACCESS</div>
            <h3>Registration Verification Codes</h3>
            <p>Codes from your existing Supabase registration_codes table.</p>
          </div>
        </div>
        <div className={styles.heroMeta}>
          <span className={[styles.connection, error ? styles.offline : ""].join(" ")}>
            {error ? <FiWifiOff /> : <span className={styles.connectionDot} />}
            {error ? "Connection issue" : loading ? "Connecting…" : checkedAt ? "Supabase connected" : "Checking access…"}
          </span>
          <button type="button" className={styles.refreshButton}
            onClick={() => loadCodes()} disabled={refreshing} aria-label="Refresh verification codes">
            <FiRefreshCw className={refreshing ? styles.rotate : ""} aria-hidden="true" />
            {refreshing ? "Refreshing…" : "Refresh codes"}
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div data-op-verification-stat className={styles.statCard}>
          <span><FiDatabase /> TOTAL CODES</span>
          <strong>{loading ? "…" : codes.length}</strong>
          <small>Saved registration codes</small>
        </div>
        <div data-op-verification-stat className={styles.statCard}>
          <span><FiKey /> VALID CODES</span>
          <strong>{loading ? "…" : activeCount}</strong>
          <small>Passing the current expiry check</small>
        </div>
        <div data-op-verification-stat className={styles.statCard}>
          <span><FiClock /> EXPIRED CODES</span>
          <strong>{loading ? "…" : expiredCount}</strong>
          <small>Expired by database timestamp</small>
        </div>
      </div>

      <div data-op-verification-panel className={styles.listPanel}>
        <div className={styles.listHeader}>
          <div>
            <h4>Live registration access codes</h4>
            <p><FiLock aria-hidden="true" /> Only administrators can view these codes · Auto-refresh every 30 seconds</p>
          </div>
          {checkedAt && <small className={styles.lastSync}>Last sync: {dateText(checkedAt)}{error ? " · Last successful sync" : ""}</small>}
        </div>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <FiSearch aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verification code" aria-label="Search registration codes"/>
          </label>
          <div className={styles.filters} role="group" aria-label="Filter codes by expiry status">
            {[["all", "All codes"], ["valid", "Valid"], ["expired", "Expired"]].map(([key, label]) => (
              <button key={key} type="button"
                className={[styles.filterButton, filter === key ? styles.filterActive : ""].join(" ")}
                onClick={() => setFilter(key)} aria-pressed={filter === key}>{label}</button>
            ))}
          </div>
        </div>

        {error && <div role="alert" className={styles.error}>{error}</div>}
        {copyError && <div role="alert" className={styles.error}>{copyError}</div>}

        {loading ? (
          <div className={styles.empty}>Loading verification codes from Supabase…</div>
        ) : visibleCodes.length === 0 ? (
          <div className={styles.empty}>
            {error && !checkedAt ? "Live codes are unavailable. Try refreshing." :
              codes.length === 0 ? "No registration codes found in Supabase." :
              "No codes match your search or filter."}
          </div>
        ) : (
          <div className={styles.scrollArea}>
            <div className={[styles.codeRow, styles.columnHead].join(" ")}>
              <span>VERIFICATION CODE</span><span>STATUS</span><span>EXPIRATION</span><span>ACTION</span>
            </div>
            {visibleCodes.map((item) => {
              const expired = isExpired(item, now);
              return (
                <div className={styles.codeRow} key={item.id}>
                  <div className={styles.codeCell}>
                    <span className={styles.mobileLabel}>CODE</span>
                    <span className={styles.code}>{item.code}</span>
                  </div>
                  <div>
                    <span className={styles.mobileLabel}>STATUS</span>
                    <span className={[styles.status, expired ? styles.expired : styles.valid].join(" ")}>
                      <span className={styles.statusDot} />
                      {expired ? "Expired" : "Valid"}
                    </span>
                  </div>
                  <div className={styles.expiration}>
                    <span className={styles.mobileLabel}>EXPIRATION</span>
                    {dateText(item.expiresAt)}
                  </div>
                  <div className={styles.action}>
                    <button type="button" className={styles.copyButton}
                      onClick={() => copyCode(item)}
                      aria-label={`Copy verification code ${item.code}`}
                      title="Copy code to clipboard">
                      {copied === item.id ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                      {copied === item.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && codes.length > 0 &&
          <p className={styles.resultsNote} aria-live="polite">
            Showing {visibleCodes.length} of {codes.length} most recent registration codes
          </p>}
      </div>

      <div className={styles.footNote}>
        <FiLock aria-hidden="true" />
        This panel is read-only. Copying a code does not change or consume it.
        Registration verification continues to use the existing website flow.
      </div>
    </section>
  );
}

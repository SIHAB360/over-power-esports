"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiActivity, FiArrowLeft, FiCalendar, FiCheckCircle, FiChevronLeft,
  FiChevronRight, FiClock, FiDollarSign, FiFileText, FiFilter,
  FiRefreshCw, FiShield, FiTrendingDown, FiTrendingUp,
} from "react-icons/fi";
import { supabase } from "../../../lib/supabase";
import styles from "./history.module.css";

const PAGE_SIZE = 20;
const FIELDS = "id, tournament_id, team1_id, team2_id, match_date, created_at, match_type, entry_fee, prize_money, profit, status";
const MATCH_TYPES = [
  { value: "", label: "All match types" },
  { value: "Scrim", label: "Scrim" },
  { value: "CR", label: "Champion Rush (CR)" },
  { value: "Official", label: "Official Tournament" },
  { value: "Custom", label: "Custom Tournament" },
];
const MATCH_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
];

function money(value) {
  return Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function dateTime(value) {
  if (!value) return { date: "No match date", time: "Time not recorded" };
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return { date: String(value), time: "Time not recorded" };
  }
  return {
    date: parsed.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka",
    }),
    time: parsed.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Dhaka",
    }),
  };
}

function matchTypeName(value) {
  return MATCH_TYPES.find((item) => item.value === value)?.label || value || "Match";
}

function moneyOutcome(match) {
  if (match.profit === null || match.profit === undefined) {
    return { value: "Not recorded", label: "Pending", kind: "pending" };
  }
  const profit = Number(match.profit);
  if (!Number.isFinite(profit)) return { value: "Not recorded", label: "Pending", kind: "pending" };
  if (profit < 0) return { value: `−৳${money(Math.abs(profit))}`, label: "LOSS", kind: "loss" };
  if (profit > 0) return { value: `+৳${money(profit)}`, label: "PROFIT", kind: "profit" };
  return { value: "৳0", label: "BREAK EVEN", kind: "even" };
}

export default function MatchHistoryPage() {
  const router = useRouter();
  const [access, setAccess] = useState("checking");
  const [accessError, setAccessError] = useState("");
  const [matches, setMatches] = useState([]);
  const [tournamentNames, setTournamentNames] = useState({});
  const [teamNames, setTeamNames] = useState({});
  const [page, setPage] = useState(1);
  const [matchType, setMatchType] = useState("");
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function authorizeAndLoadLookups() {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError || !auth?.user) {
          router.replace("/login");
          return;
        }
        const { data: profile, error: roleError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", auth.user.id)
          .single();
        if (roleError) throw roleError;
        const role = String(profile?.role || "").toLowerCase();
        if (role !== "admin" && role !== "moderator") {
          router.replace("/");
          return;
        }
        const [tournamentsResult, teamsResult] = await Promise.all([
          supabase.from("tournaments").select("id,name").limit(2000),
          supabase.from("teams").select("id,team_name").limit(2000),
        ]);
        // Missing display names must not prevent existing match records from loading.
        if (!cancelled) {
          if (!tournamentsResult.error) {
            setTournamentNames(Object.fromEntries(
              (tournamentsResult.data || []).map((entry) => [String(entry.id), entry.name])
            ));
          }
          if (!teamsResult.error) {
            setTeamNames(Object.fromEntries(
              (teamsResult.data || []).map((entry) => [String(entry.id), entry.team_name])
            ));
          }
          setAccess("granted");
        }
      } catch (error) {
        if (!cancelled) {
          setAccessError(error?.message || "Unable to verify permission.");
          setAccess("error");
        }
      }
    }
    authorizeAndLoadLookups();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (access !== "granted") return;
    let cancelled = false;
    async function loadHistory() {
      setLoading(true);
      setLoadError("");
      try {
        const first = (page - 1) * PAGE_SIZE;
        let request = supabase.from("matches")
          .select(FIELDS, { count: "exact" })
          .order("created_at", { ascending: false })
          .order("id", { ascending: false });
        if (matchType) request = request.eq("match_type", matchType);
        if (status) request = request.eq("status", status);
        const { data, count, error } = await request.range(first, first + PAGE_SIZE - 1);
        if (error) throw error;
        if (cancelled) return;
        const nextCount = count ?? (data || []).length;
        const maxPage = Math.max(1, Math.ceil(nextCount / PAGE_SIZE));
        setTotal(nextCount);
        if (page > maxPage) {
          setPage(maxPage);
          return;
        }
        setMatches(data || []);
      } catch (error) {
        if (!cancelled) {
          setMatches([]);
          setLoadError(error?.message || "Unable to load match history.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [access, page, matchType, status, refreshVersion]);

  const totals = useMemo(() => {
    let profit = 0;
    let loss = 0;
    for (const match of matches) {
      const amount = Number(match.profit);
      if (match.profit === null || match.profit === undefined || !Number.isFinite(amount)) continue;
      if (amount > 0) profit += amount;
      if (amount < 0) loss += Math.abs(amount);
    }
    return { profit, loss };
  }, [matches]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromIndex = (page - 1) * PAGE_SIZE;
  const format = (value) => `৳${money(value)}`;

  if (access === "checking") {
    return <main className={styles.loadingState}><FiShield size={29} /> Checking match history access…</main>;
  }
  if (access === "error") {
    return (
      <main className={styles.loadingState}>
        <p role="alert">{accessError}</p>
        <Link href="/admin/matches">Back to Match Command Center</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topNav}>
          <Link href="/admin/dashboard?section=matches" className={styles.backLink}>
            <FiArrowLeft aria-hidden="true" /> Back to Match Command Center
          </Link>
          <span className={styles.accessLabel}><FiShield aria-hidden="true" /> ADMIN MATCH ARCHIVE</span>
        </div>

        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}><FiActivity aria-hidden="true" /> OVER POWER ESPORTS · RECORDS CENTER</p>
            <h1>Match <span>History</span></h1>
            <p>All saved matches from your existing database, ordered newest first. Check lobby, earnings, losses, match date and time in one place.</p>
          </div>
          <div className={styles.heroCount}>
            <span>MATCHES FOUND</span>
            <strong>{loading && page === 1 && !total ? "…" : total.toLocaleString("en-BD")}</strong>
            <small>Matching selected filters</small>
          </div>
        </header>

        <section className={styles.stats} aria-label="Match history summary">
          <div className={styles.stat}><span><FiFileText /> MATCH RECORDS</span><strong>{total.toLocaleString("en-BD")}</strong><small>All matching entries</small></div>
          <div className={styles.stat}><span><FiTrendingUp /> PAGE PROFIT</span><strong className={styles.positive}>{format(totals.profit)}</strong><small>Sum of profit on this page</small></div>
          <div className={styles.stat}><span><FiTrendingDown /> PAGE LOSS</span><strong className={styles.negative}>{format(totals.loss)}</strong><small>Sum of losses on this page</small></div>
        </section>

        <section className={styles.archive}>
          <div className={styles.toolbar}>
            <div>
              <h2>Complete Match Records</h2>
              <p><FiClock aria-hidden="true" /> Date and time shown in Bangladesh time (BST, UTC+6)</p>
            </div>
            <div className={styles.controls}>
              <label className={styles.filter}>
                <FiFilter aria-hidden="true" />
                <span className={styles.screenReaderOnly}>Match type</span>
                <select value={matchType} onChange={(event) => { setMatchType(event.target.value); setPage(1); }}>
                  {MATCH_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className={styles.filter}>
                <span className={styles.screenReaderOnly}>Match status</span>
                <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                  {MATCH_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <button type="button" className={styles.refresh} disabled={loading}
                onClick={() => setRefreshVersion((v) => v + 1)}>
                <FiRefreshCw aria-hidden="true" /> Refresh
              </button>
            </div>
          </div>

          {loadError && <div className={styles.error} role="alert">Unable to read match records: {loadError}. Please try Refresh.</div>}

          {loading ? (
            <div className={styles.empty}>Loading saved match history…</div>
          ) : matches.length === 0 && !loadError ? (
            <div className={styles.empty}>No matches found for the selected filters. Your saved data has not been changed.</div>
          ) : matches.length > 0 ? (
            <div className={styles.tableScroller}>
              <table className={styles.historyTable}>
                <thead>
                  <tr>
                    <th scope="col">SERIAL</th>
                    <th scope="col">LOBBY / MATCH</th>
                    <th scope="col">TYPE</th>
                    <th scope="col">ENTRY FEE</th>
                    <th scope="col">PRIZE</th>
                    <th scope="col">PROFIT / LOSS</th>
                    <th scope="col">DATE & TIME</th>
                    <th scope="col">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, index) => {
                    const outcome = moneyOutcome(match);
                    const date = dateTime(match.match_date || match.created_at);
                    const lobby = match.tournament_id
                      ? tournamentNames[String(match.tournament_id)] || "Tournament / Lobby"
                      : "Independent Match";
                    return (
                      <tr key={match.id}>
                        <td data-label="SERIAL"><span className={styles.serial}>{String(fromIndex + index + 1).padStart(2, "0")}</span></td>
                        <td data-label="LOBBY / MATCH">
                          <div className={styles.matchInfo}>
                            <strong>{lobby}</strong>
                            <small>{teamNames[String(match.team1_id)] || "Your Team"}{match.team2_id ? ` vs ${teamNames[String(match.team2_id)] || "Opponent"}` : ""}</small>
                          </div>
                        </td>
                        <td data-label="TYPE"><span className={styles.typePill}>{matchTypeName(match.match_type)}</span></td>
                        <td data-label="ENTRY FEE" className={styles.moneyCell}>{match.entry_fee == null ? "—" : format(match.entry_fee)}</td>
                        <td data-label="PRIZE" className={styles.moneyCell}>{match.prize_money == null ? "—" : format(match.prize_money)}</td>
                        <td data-label="PROFIT / LOSS">
                          <div className={[styles.outcome, styles[outcome.kind]].join(" ")}>
                            <small>{outcome.label}</small>
                            <strong>{outcome.value}</strong>
                          </div>
                        </td>
                        <td data-label="DATE & TIME">
                          <div className={styles.date}>
                            <span><FiCalendar aria-hidden="true" /> {date.date}</span>
                            <small><FiClock aria-hidden="true" /> {date.time}</small>
                          </div>
                        </td>
                        <td data-label="STATUS"><span className={[styles.status, styles[match.status] || ""].join(" ")}>
                          {match.status === "completed" && <FiCheckCircle aria-hidden="true" />}
                          {match.status || "Unknown"}
                        </span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className={styles.footer}>
            <p>{total ? `Showing ${fromIndex + 1}–${Math.min(fromIndex + PAGE_SIZE, total)} of ${total.toLocaleString("en-BD")} matches` : "No matching match records"}</p>
            <div className={styles.pagination}>
              <button type="button" disabled={loading || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <FiChevronLeft /> Previous
              </button>
              <span>Page {page} / {pageCount}</span>
              <button type="button" disabled={loading || page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </section>
        <p className={styles.disclaimer}><FiShield aria-hidden="true" /> Read-only history. No records are deleted or modified here. A profit or loss is shown only when stored in your match record.</p>
      </div>
    </main>
  );
}

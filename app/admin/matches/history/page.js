"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiActivity, FiArrowLeft, FiCalendar, FiCheckCircle, FiChevronLeft,
  FiChevronRight, FiClock, FiDollarSign, FiFileText, FiFilter,
  FiRefreshCw, FiShield, FiTrendingDown, FiTrendingUp, FiTrash2, FiAlertTriangle, FiX,
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
  const [canDelete, setCanDelete] = useState(false);
  const [deleteMatch, setDeleteMatch] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
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
          setCanDelete(role === "admin");
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

  const openDelete = (match) => {
    setDeleteMatch(match);
    setDeleteConfirmation("");
    setDeleteError("");
    setDeleteSuccess("");
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteMatch(null);
    setDeleteConfirmation("");
    setDeleteError("");
  };

  async function confirmDelete() {
    if (!canDelete || !deleteMatch || deleteConfirmation.trim() !== "DELETE" || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.access_token) throw new Error("Admin session expired. Please log in again.");
      const response = await fetch("/api/admin/matches/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ matchId: String(deleteMatch.id) }),
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result?.deleted) {
        throw new Error(result?.message || "Unable to delete match.");
      }
      setDeleteSuccess("Match permanently deleted. Related finance and player records were removed by Supabase.");
      setDeleteMatch(null);
      setDeleteConfirmation("");
      setRefreshVersion((previous) => previous + 1);
    } catch (error) {
      setDeleteError(error?.message || "Deletion failed. No change confirmed.");
    } finally {
      setDeleting(false);
    }
  }

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
    <main data-op-history-page className={styles.page}>
      <div data-op-history-container className={styles.container}>
        <div className={styles.topNav}>
          <Link href="/admin/dashboard?section=matches" className={styles.backLink}>
            <FiArrowLeft aria-hidden="true" /> Back to Match Command Center
          </Link>
          <span className={styles.accessLabel}><FiShield aria-hidden="true" /> ADMIN MATCH ARCHIVE</span>
        </div>

        <header data-op-history-hero className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}><FiActivity aria-hidden="true" /> OVER POWER ESPORTS · RECORDS CENTER</p>
            <h1>Match <span>History</span></h1>
            <p>All saved matches in one organized archive. Review entry fees, prize money, profits, losses and schedules without losing any records.</p>
            <div className={styles.heroHints}>
              <span><FiCheckCircle aria-hidden="true" /> Synced with Supabase</span>
              <span><FiClock aria-hidden="true" /> Newest matches first</span>
            </div>
          </div>
          <div className={styles.heroCount}>
            <span>MATCHES FOUND</span>
            <strong>{loading && page === 1 && !total ? "…" : total.toLocaleString("en-BD")}</strong>
            <small>Matching selected filters</small>
          </div>
        </header>

        <section className={styles.stats} aria-label="Match history summary">
          <div className={styles.stat}><span><FiFileText /> MATCH RECORDS</span><strong>{total.toLocaleString("en-BD")}</strong><small>All matching entries</small></div>
          <div className={styles.stat}><span><FiTrendingUp /> PAGE PROFIT</span><strong className={styles.positive}>{format(totals.profit)}</strong><small>Total gains on this page</small></div>
          <div className={styles.stat}><span><FiTrendingDown /> PAGE LOSS</span><strong className={styles.negative}>{format(totals.loss)}</strong><small>Total losses on this page</small></div>
          <div className={styles.stat}><span><FiDollarSign /> PAGE NET RESULT</span>
            <strong className={totals.profit >= totals.loss ? styles.positive : styles.negative}>
              {totals.profit - totals.loss < 0 ? "−" : totals.profit - totals.loss > 0 ? "+" : ""}{format(Math.abs(totals.profit - totals.loss))}
            </strong><small>Profit minus loss on this page</small>
          </div>
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

          {deleteSuccess && <div className={styles.successNotice} role="status"><FiCheckCircle aria-hidden="true" /> {deleteSuccess}</div>}
          {loadError && <div className={styles.error} role="alert">Unable to read match records: {loadError}. Please try Refresh.</div>}

          {loading ? (
            <div className={styles.empty}>Loading saved match history…</div>
          ) : matches.length === 0 && !loadError ? (
            <div className={styles.empty}>No matches found for the selected filters. Your saved data has not been changed.</div>
          ) : matches.length > 0 ? (
            <div data-op-history-table-scroll className={styles.tableScroller}>
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
                    {canDelete && <th scope="col">ACTION</th>}
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
                        {canDelete && <td data-label="ACTION"><button type="button" className={styles.deleteButton}
                          onClick={() => openDelete(match)} aria-label={`Delete match ${lobby}`}>
                          <FiTrash2 aria-hidden="true" /> Delete
                        </button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {!loading && matches.length > 0 && (
            <div className={styles.mobileList} aria-label="Match history mobile cards">
              {matches.map((match, index) => {
                const outcome = moneyOutcome(match);
                const when = dateTime(match.match_date || match.created_at);
                const lobby = match.tournament_id
                  ? tournamentNames[String(match.tournament_id)] || "Tournament / Lobby"
                  : "Independent Match";
                const yourTeam = teamNames[String(match.team1_id)] || "Your Team";
                const opponent = match.team2_id
                  ? ` vs ${teamNames[String(match.team2_id)] || "Opponent"}` : "";
                return (
                  <article className={styles.mobileCard} key={match.id}>
                    <div className={styles.mobileCardTop}>
                      <span className={styles.mobileSerial}>#{String(fromIndex + index + 1).padStart(2, "0")}</span>
                      <span className={[styles.status, styles[match.status] || ""].join(" ")}>
                        {match.status === "completed" && <FiCheckCircle aria-hidden="true" />}
                        {match.status || "Unknown"}
                      </span>
                    </div>
                    <div className={styles.mobileMatchInfo}>
                      <h3>{lobby}</h3>
                      <p>{yourTeam}{opponent}</p>
                    </div>
                    <div className={styles.mobileMeta}>
                      <span className={styles.typePill}>{matchTypeName(match.match_type)}</span>
                      <span><FiCalendar aria-hidden="true" /> {when.date}</span>
                      <span><FiClock aria-hidden="true" /> {when.time}</span>
                    </div>
                    <div className={styles.mobileFinances}>
                      <div><small>ENTRY FEE</small><strong>{match.entry_fee == null ? "—" : format(match.entry_fee)}</strong></div>
                      <div><small>PRIZE MONEY</small><strong>{match.prize_money == null ? "—" : format(match.prize_money)}</strong></div>
                    </div>
                    <div className={[styles.mobileOutcome, styles[outcome.kind]].join(" ")}>
                      <div><span>FINAL RESULT</span><small>{outcome.label}</small></div>
                      <strong>{outcome.value}</strong>
                    </div>
                    {canDelete && (
                      <button type="button" className={styles.deleteButton} onClick={() => openDelete(match)}
                        aria-label={`Delete match ${lobby}`}><FiTrash2 aria-hidden="true" /> Delete this match</button>
                    )}
                  </article>
                );
              })}
            </div>
          )}

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
        <p className={styles.disclaimer}><FiShield aria-hidden="true" /> {canDelete
          ? "Only administrators can permanently delete matches. Deletion requires confirmation and updates Supabase; all related records must be removed in one transaction."
          : "Match History is read-only for moderators. Only administrators can delete matches."}</p>
        {canDelete && deleteMatch && (
          <div className={styles.modalOverlay} role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) cancelDelete();
          }}>
            <div className={styles.deleteDialog} role="alertdialog" aria-modal="true"
              aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
              <div className={styles.dialogTop}>
                <span className={styles.dangerIcon}><FiAlertTriangle aria-hidden="true" /></span>
                <button type="button" className={styles.closeDialog} disabled={deleting}
                  onClick={cancelDelete} aria-label="Close deletion dialog"><FiX aria-hidden="true"/></button>
              </div>
              <h2 id="delete-dialog-title">Permanently delete this match?</h2>
              <p id="delete-dialog-description">This action cannot be undone. It will remove the match from Supabase together with its connected match finance, player statistics and earnings. All screens will reflect the updated data on refresh.</p>
              <div className={styles.targetMatch}>
                <strong>{deleteMatch.tournament_id
                  ? tournamentNames[String(deleteMatch.tournament_id)] || "Tournament / Lobby"
                  : "Independent Match"}</strong>
                <span>{matchTypeName(deleteMatch.match_type)} · {dateTime(deleteMatch.match_date || deleteMatch.created_at).date}</span>
                <span>Entry: ৳{money(deleteMatch.entry_fee)} · Prize: ৳{money(deleteMatch.prize_money)} · {moneyOutcome(deleteMatch).label}: {moneyOutcome(deleteMatch).value}</span>
              </div>
              <label className={styles.confirmLabel} htmlFor="delete-match-confirmation">
                Type <strong>DELETE</strong> to confirm permanent removal
              </label>
              <input id="delete-match-confirmation" type="text" value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                autoComplete="off" spellCheck={false} disabled={deleting}
                placeholder="DELETE" className={styles.confirmInput}/>
              {deleteError && <p role="alert" className={styles.modalError}>{deleteError}</p>}
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} disabled={deleting}
                  onClick={cancelDelete}>Cancel</button>
                <button type="button" className={styles.confirmButton}
                  disabled={deleting || deleteConfirmation.trim() !== "DELETE"}
                  onClick={confirmDelete}>
                  <FiTrash2 aria-hidden="true" /> {deleting ? "Deleting securely…" : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  FiGrid, FiUsers, FiTarget, FiLayers, FiAward, FiDollarSign,
  FiCreditCard, FiShield, FiImage, FiLogOut, FiMoon, FiSun,
  FiMenu, FiX, FiRefreshCw, FiArrowUpRight, FiActivity,
  FiCalendar, FiSearch, FiBarChart2, FiTrendingUp, FiLock,
  FiClock, FiChevronRight, FiCheckCircle,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import styles from "./dashboard.module.css";
import VerificationPanel from "./VerificationPanel";
const WithdrawalManagement = dynamic(() => import("./WithdrawalManagement"), { ssr: false });
const WithdrawalAccessPanel = dynamic(() => import("./WithdrawalAccessPanel"), { ssr: false });

// Reuse each existing FULL management page inside the new command center.
// This preserves every existing form, field, validation, database write and record view.
const ADMIN_MANAGERS = {
  players: dynamic(() => import("../players/page"), { ssr: false }),
  matches: dynamic(() => import("../matches/page"), { ssr: false }),
  teams: dynamic(() => import("../teams/page"), { ssr: false }),
  tournaments: dynamic(() => import("../tournaments/page"), { ssr: false }),
  profit: dynamic(() => import("../profit/page"), { ssr: false }),
  achievements: dynamic(() => import("../achievements/page"), { ssr: false }),
};

const THEME_KEY = "op-admin-dashboard-theme";
const LIMIT = 500;

// Existing management routes are kept intact; no fictitious routes.
const NAV = [
  { key: "overview", name: "Overview", Icon: FiGrid, description: "Esports operations at a glance" },
  { key: "players", name: "Players", Icon: FiUsers, href: "/admin/players", description: "Player accounts and approvals" },
  { key: "matches", name: "Matches", Icon: FiTarget, href: "/admin/matches", description: "Match history and management" },
  { key: "teams", name: "Teams", Icon: FiLayers, href: "/admin/teams", description: "Team roster and team management" },
  { key: "tournaments", name: "Tournaments", Icon: FiAward, href: "/admin/tournaments", description: "Tournaments and competitions" },
  { key: "profit", name: "Profit", Icon: FiDollarSign, href: "/admin/profit", description: "Match finance and profit records" },
  // Keep legacy key 'salary' to preserve bookmarks (?section=salary), but display the real function.
  { key: "salary", name: "Withdrawals", Icon: FiCreditCard, description: "Player earnings payout approvals and manual bKash/Nagad transfers" },
  { key: "verification", name: "Verification", Icon: FiShield, description: "Player verification and access control" },
  { key: "achievements", name: "Achievements", Icon: FiImage, href: "/admin/achievements", description: "Esports achievements and gallery" },
];

const TABLES = [
  ["players", "players"],
  ["matches", "matches"],
  ["teams", "teams"],
  ["tournaments", "tournaments"],
  ["profit", "match_finance"],
  ["achievements", "achievement_gallery"],
];

const EMPTY_SOURCE = { rows: [], count: 0, error: null };

function number(value) {
  return Number(value || 0).toLocaleString("en-BD");
}

function taka(value) {
  return "৳" + number(Math.round(Number(value) || 0));
}

function sumMoney(rows, field) {
  return rows.reduce((total, row) => {
    const value = Number(row[field] || 0);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

function dateLabel(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
}

function clean(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function groupStatus(rows, status) {
  return rows.filter((row) => String(row.status || "").toLowerCase() === status).length;
}

function StatCard({ label, value, subtitle, Icon }) {
  return (
    <article className={styles.stat}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statIcon}><Icon aria-hidden="true" /></span>
      </div>
      <strong className={styles.statValue}>{value}</strong>
      <small className={styles.statHint}>{subtitle}</small>
    </article>
  );
}

function Panel({ title, subtitle, children, className = "" }) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(" ")}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelHeading}>{title}</h3>
          {subtitle && <p className={styles.panelDesc}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function TrendChart({ players, matches }) {
  const months = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
      return {
        key: String(month.getFullYear()) + "-" + String(month.getMonth() + 1).padStart(2, "0"),
        label: month.toLocaleDateString("en-US", { month: "short" }),
      };
    });
  }, []);

  const countFor = (rows, month) =>
    rows.filter((row) => {
      const value = row.created_at || row.match_date;
      if (!value) return false;
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) &&
        String(date.getFullYear()) + "-" + String(date.getMonth() + 1).padStart(2, "0") === month;
    }).length;

  const playersData = months.map((m) => countFor(players, m.key));
  const matchesData = months.map((m) => countFor(matches, m.key));
  const max = Math.max(1, ...playersData, ...matchesData);
  const makePoints = (values) => values.map((v, i) => {
    const x = 18 + i * 60;
    const y = 160 - (v / max) * 125;
    return x + "," + y;
  }).join(" ");
  const hasData = playersData.some(Boolean) || matchesData.some(Boolean);

  if (!hasData) {
    return <div className={styles.empty}>No player or match activity recorded for the last 6 months.</div>;
  }

  return (
    <div className={styles.chart}>
      <svg viewBox="0 0 340 185" role="img" aria-label="Monthly player and match activity for the last six months">
        {[36, 76, 116, 156].map((y) => (
          <line key={y} x1="15" x2="325" y1={y} y2={y} stroke="currentColor" opacity=".075" />
        ))}
        <defs>
          <linearGradient id="opAdminLinePlayers" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#936bf4" />
            <stop offset="1" stopColor="#df91eb" />
          </linearGradient>
          <linearGradient id="opAdminLineMatches" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#60cbef" />
            <stop offset="1" stopColor="#51e0ba" />
          </linearGradient>
        </defs>
        <polyline points={makePoints(playersData)} stroke="url(#opAdminLinePlayers)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
        <polyline points={makePoints(matchesData)} stroke="url(#opAdminLineMatches)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
        {playersData.map((v, i) => <circle key={"p" + i} cx={18 + i * 60} cy={160 - (v / max) * 125} r="3.3" fill="#a784f7"><title>{months[i].label + ": " + v + " players"}</title></circle>)}
        {matchesData.map((v, i) => <circle key={"m" + i} cx={18 + i * 60} cy={160 - (v / max) * 125} r="3.3" fill="#61cfea"><title>{months[i].label + ": " + v + " matches"}</title></circle>)}
      </svg>
      <div className={styles.chartAxis}>
        {months.map((m) => <span key={m.key}>{m.label}</span>)}
      </div>
    </div>
  );
}

function MatchDonut({ matches }) {
  const completed = groupStatus(matches, "completed");
  const ongoing = matches.filter((m) => ["ongoing", "active", "live", "in_progress"].includes(String(m.status || "").toLowerCase())).length;
  const upcoming = matches.filter((m) => ["upcoming", "scheduled", "pending"].includes(String(m.status || "").toLowerCase())).length;
  const other = Math.max(0, matches.length - completed - ongoing - upcoming);
  const groups = [
    { label: "Completed", count: completed, color: "#916df1" },
    { label: "Ongoing", count: ongoing, color: "#60cdeb" },
    { label: "Upcoming", count: upcoming, color: "#f4ae80" },
    { label: "Other", count: other, color: "#7f8caf" },
  ];
  const total = matches.length;
  let angle = 0;
  const gradients = total
    ? groups.map((group) => {
        const start = angle;
        angle += group.count / total * 360;
        return group.color + " " + start + "deg " + angle + "deg";
      }).join(",")
    : "#627090 0deg 360deg";

  return (
    <div className={styles.donutWrap}>
      <div className={styles.donut} style={{ background: "conic-gradient(" + gradients + ")" }}>
        <div className={styles.donutCenter}>
          <strong>{number(total)}</strong>
          <small>MATCHES</small>
        </div>
      </div>
      <div className={styles.donutLegend}>
        {groups.map((group) => (
          <div className={styles.legendItem} key={group.label}>
            <span className={styles.colorSquare} style={{ background: group.color }} />
            <span>{group.label}</span>
            <b>{number(group.count)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressLine({ label, count, total }) {
  const percent = total ? Math.max(0, Math.min(100, Math.round(count / total * 100))) : 0;
  return (
    <div className={styles.progressItem}>
      <div className={styles.progressItemHead}>
        <strong>{label}</strong>
        <span>{number(count)} · {percent}%</span>
      </div>
      <div className={styles.progressRail}>
        <div className={styles.progressFill} style={{ width: percent + "%" }} />
      </div>
    </div>
  );
}

function Status({ value }) {
  const text = String(value || "Not set");
  const status = text.toLowerCase();
  const colorClass = ["approved", "active", "completed", "published"].includes(status)
    ? styles.greenDot
    : ["pending", "upcoming"].includes(status)
      ? styles.orangeDot
      : ["ongoing", "live", "scheduled"].includes(status) ? styles.blueDot : "";
  return (
    <span className={styles.status}>
      <i className={[styles.statusDot, colorClass].filter(Boolean).join(" ")} />
      {text.replaceAll("_", " ")}
    </span>
  );
}

const COLUMNS = {
  players: ["Player", "Team", "Status", "Joined"],
  matches: ["Match", "Team", "Status", "Date"],
  teams: ["Team", "Status", "Players", "Created"],
  tournaments: ["Tournament", "Status", "Starts", "Prize pool"],
  profit: ["Finance record", "Profit", "Management share", "Created"],
  achievements: ["Achievement", "Category", "Status", "Created"],
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [theme, setTheme] = useState("dark");
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState({});
  const [sourceErrors, setSourceErrors] = useState({});
  const [verificationRefreshVersion, setVerificationRefreshVersion] = useState(0);

  const refresh = useCallback(async () => {
    setLoadingData(true);
    try {
      const responses = await Promise.all(TABLES.map(async ([key, table]) => {
        let result = await supabase.from(table)
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(LIMIT);

        if (result.error) {
          // Some tables may not expose created_at; don't lose the entire overview.
          result = await supabase.from(table)
            .select("*", { count: "exact" })
            .limit(LIMIT);
        }

        return { key, rows: result.data || [], count: result.count, error: result.error?.message || null };
      }));

      const next = {};
      const errors = {};
      responses.forEach((response) => {
        next[response.key] = {
          rows: response.rows,
          count: response.count === null ? response.rows.length : response.count,
          error: response.error,
        };
        if (response.error) errors[response.key] = response.error;
      });
      setData(next);
      setSourceErrors(errors);
    } catch (error) {
      setSourceErrors({ general: error?.message || "Unable to load dashboard data." });
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const stored = window.localStorage.getItem(THEME_KEY);
        if (stored === "dark" || stored === "light") setTheme(stored);

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          window.location.assign("/login");
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role,email")
          .eq("id", authData.user.id)
          .single();

        if (profileError || String(profile?.role || "").toLowerCase() !== "admin") {
          window.location.assign("/login");
          return;
        }

        if (!mounted) return;
        setAdminEmail(profile.email || authData.user.email || "Administrator");
        // Deep links from Match History return to the exact dashboard section.
        const requestedSection = new URLSearchParams(window.location.search).get("section");
        if (NAV.some((item) => item.key === requestedSection)) {
          setActive(requestedSection);
        }
        setLoading(false);
        await refresh();
      } catch {
        if (mounted) window.location.assign("/login");
      }
    }
    init();
    return () => { mounted = false; };
  }, [refresh]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.assign("/login");
  };

  const goTo = (key) => {
    setActive(key);
    setSearch("");
    setMobileOpen(false);
    // Refresh the top KPIs and overview whenever management sections change,
    // so newly created matches / tournaments appear without a full reload.
    refresh();
  };

  const source = (key) => data[key] || EMPTY_SOURCE;
  const players = source("players").rows;
  const matches = source("matches").rows;
  const teams = source("teams").rows;
  const tournaments = source("tournaments").rows;
  const finances = source("profit").rows;
  const achievementRows = source("achievements").rows;
  const completeFinance = !sourceErrors.profit && source("profit").count === finances.length;
  const totalProfit = sumMoney(finances, "profit");
  const managementShare = sumMoney(finances, "management_amount");
  const playerShare = sumMoney(finances, "player_amount");

  const counts = {
    players: source("players").count,
    matches: source("matches").count,
    teams: source("teams").count,
    tournaments: source("tournaments").count,
    profit: source("profit").count,
    achievements: source("achievements").count,
  };

  const teamNameById = new Map(teams.map((team) => [String(team.id), team.team_name || "Team"]));
  const tournamentNameById = new Map(tournaments.map((t) => [String(t.id), t.name || "Tournament"]));

  const activeNav = NAV.find((item) => item.key === active) || NAV[0];
  const ActiveManager = ADMIN_MANAGERS[active] || null;
  const rows = source(active).rows;
  const filtered = rows.filter((item) => {
    if (!search) return true;
    return Object.values(item).filter((v) => ["string","number"].includes(typeof v))
      .join(" ").toLowerCase().includes(search.trim().toLowerCase());
  }).slice(0, 12);
  const showLimited = source(active).count > source(active).rows.length;

  const overviewActivity = [
    ...players.map((p) => ({ type: "New player", title: p.ign || p.full_name || "Player", timestamp: p.created_at, icon: "player" })),
    ...matches.map((m) => ({ type: "Match record", title: m.match_type || "Match", timestamp: m.created_at || m.match_date, icon: "match" })),
    ...tournaments.map((t) => ({ type: "Tournament", title: t.name || "Tournament", timestamp: t.created_at, icon: "tournament" })),
  ].filter((a) => a.timestamp && !Number.isNaN(new Date(a.timestamp).getTime()))
    .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0,5);

  const metrics = active === "players"
    ? [["Approved", groupStatus(players,"approved")],["Pending",groupStatus(players,"pending")],["Registered",counts.players]]
    : active === "matches"
      ? [["Completed",groupStatus(matches,"completed")],["Live / ongoing",matches.filter(m=>["ongoing","active","live","in_progress"].includes(String(m.status||"").toLowerCase())).length],["Recorded",counts.matches]]
      : active === "teams"
        ? [["Active",groupStatus(teams,"active")],["Pending",groupStatus(teams,"pending")],["Created",counts.teams]]
        : active === "tournaments"
          ? [["Upcoming",groupStatus(tournaments,"upcoming")],["Ongoing",groupStatus(tournaments,"ongoing")],["All tournaments",counts.tournaments]]
          : active === "profit"
            ? [["Total profit",completeFinance?taka(totalProfit):"—"],["Player allocation",completeFinance?taka(playerShare):"—"],["Management share",completeFinance?taka(managementShare):"—"]]
            : [["Gallery records",counts.achievements],["Listed here",Math.min(counts.achievements,12)],["Data source","Live"]];

  const cellFor = (key, row) => {
    switch (key) {
      case "players":
        return [
          clean(row.ign || row.full_name),
          clean(row.team_name),
          <Status key="s" value={row.status} />,
          dateLabel(row.created_at)
        ];
      case "matches":
        return [
          clean(row.match_type || tournamentNameById.get(String(row.tournament_id)) || "Match"),
          clean(teamNameById.get(String(row.team1_id))),
          <Status key="s" value={row.status} />,
          dateLabel(row.match_date || row.created_at)
        ];
      case "teams":
        return [
          clean(row.team_name),
          <Status key="s" value={row.status} />,
          number(players.filter((p)=>p.team_name && p.team_name.toLowerCase() === String(row.team_name || "").toLowerCase()).length),
          dateLabel(row.created_at)
        ];
      case "tournaments":
        return [
          clean(row.name),
          <Status key="s" value={row.status} />,
          dateLabel(row.start_date),
          taka(row.prize_pool)
        ];
      case "profit":
        return [
          clean(row.match_id ? "Match " + String(row.match_id).slice(0, 8) : "Record " + String(row.id || "").slice(0,8)),
          taka(row.profit),
          taka(row.management_amount),
          dateLabel(row.created_at)
        ];
      case "achievements":
        return [
          clean(row.title || row.name || "Gallery entry"),
          clean(row.category || row.type),
          <Status key="s" value={row.status} />,
          dateLabel(row.created_at)
        ];
      default: return [];
    }
  };

  if (loading) {
    return (
      <main className={styles.loading}>
        <div><span className={styles.spinner}/><strong>AUTHENTICATING ADMIN ACCESS</strong></div>
      </main>
    );
  }

  return (
    <div className={[styles.dashboard, theme === "dark" ? styles.dark : styles.light].join(" ")}>
      <div className={styles.layout}>
        {mobileOpen && <button type="button" className={styles.overlay} aria-label="Close menu" onClick={() => setMobileOpen(false)}/>}
        <aside className={[styles.sidebar, mobileOpen ? styles.sidebarOpen : ""].join(" ")} aria-label="Admin navigation">
          <div className={styles.sidebarTop}>
            <Image className={styles.brandLogo} src={logo} alt="Over Power Esports" width={54} height={54} />
            <div className={styles.brandCopy}>
              <p className={styles.brandTitle}>OVER POWER</p>
              <p className={styles.brandSub}>ESPORTS ADMIN</p>
            </div>
            <button type="button" className={styles.sidebarClose} aria-label="Close admin menu" onClick={() => setMobileOpen(false)}>
              <FiX aria-hidden="true" />
            </button>
          </div>
          <div className={styles.navScroll}>
            <p className={styles.menuTitle}>OPERATIONS</p>
            <nav className={styles.navGroup} aria-label="Dashboard sections">
              {NAV.slice(0, 5).map(({ key,name,Icon }) => (
                <button
                  type="button"
                  key={key}
                  className={[styles.navItem, active === key ? styles.navActive : ""].join(" ")}
                  onClick={() => goTo(key)}
                  aria-current={active === key ? "page" : undefined}
                >
                  <span className={styles.navIcon}><Icon aria-hidden="true" /></span>
                  <span className={styles.navText}>{name}</span>
                  {!loadingData && counts[key] !== undefined && !sourceErrors[key] && (
                    <span className={styles.navCount}>{number(counts[key])}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className={styles.navSeparator}/>
            <p className={styles.menuTitle}>MANAGEMENT & ACCESS</p>
            <nav className={styles.navGroup} aria-label="Management and access sections">
              {NAV.slice(5).map(({ key,name,Icon }) => (
                <button
                  type="button"
                  key={key}
                  className={[styles.navItem, active === key ? styles.navActive : ""].join(" ")}
                  onClick={() => goTo(key)}
                  aria-current={active === key ? "page" : undefined}
                >
                  <span className={styles.navIcon}><Icon aria-hidden="true" /></span>
                  <span className={styles.navText}>{name}</span>
                  {!loadingData && counts[key] !== undefined && !sourceErrors[key] && (
                    <span className={styles.navCount}>{number(counts[key])}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className={styles.navSeparator}/>
            <p className={styles.menuTitle}>QUICK ACCESS</p>
            <Link href="/" className={styles.navItem}>
              <span className={styles.navIcon}><FiArrowUpRight aria-hidden="true"/></span>
              <span className={styles.navText}>View Website</span>
            </Link>
          </div>
          <div className={styles.sidebarFoot}>
            <div className={styles.sidebarStatus}>
              <span className={styles.sidebarStatusDot} aria-hidden="true" />
              <div>
                <strong>{loadingData ? "SYNCING DATA" : Object.values(sourceErrors).some(Boolean) ? "REVIEW DATA SOURCES" : "SYSTEM CONNECTED"}</strong>
                <small>Over Power · Secure admin</small>
              </div>
            </div>
            <p className={styles.sidebarAdmin} title={adminEmail}>{adminEmail}</p>
            <button type="button" className={styles.logout} onClick={logout}><FiLogOut aria-hidden="true"/> LOG OUT</button>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.mainInner}>
            <header className={styles.header}>
              <div className={styles.mobileTop}>
                <button type="button" className={styles.mobileMenuBtn} aria-label="Open admin menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>
                  <FiMenu aria-hidden="true" />
                </button>
              </div>
              <div className={styles.headerCenter}>
                <p className={styles.eyebrow}><i className={styles.eyebrowDot}/> ADMIN OPERATIONS <span className={styles.heroSerial}>/ CONTROL ROOM 01</span></p>
                <h1 className={styles.pageTitle}>OVER POWER <span>COMMAND CENTER</span></h1>
                <p className={styles.pageSubtitle}>A single home for your players, squads, tournaments, results and finances.</p>
                <div className={styles.heroMeta}>
                  <span className={[styles.heroStatus, Object.values(sourceErrors).some(Boolean) ? styles.heroWarning : ""].join(" ")}>
                    <FiActivity aria-hidden="true" />
                    {loadingData ? "Syncing dashboard…" : Object.values(sourceErrors).some(Boolean) ? "Some data needs attention" : "Dashboard data synced"}
                  </span>
                  <span className={styles.heroSecure}><FiLock aria-hidden="true" /> ADMIN ACCESS</span>
                </div>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.headerAdmin}>
                  <span className={styles.headerAvatar}>{adminEmail.slice(0,1).toUpperCase()}</span>
                  <span className={styles.headerEmail} title={adminEmail}>{adminEmail}</span>
                </div>
                <button type="button" className={styles.themeSwitch} onClick={toggleTheme} aria-label={"Switch to " + (theme==="dark" ? "light" : "dark") + " theme"} aria-pressed={theme==="dark"}>
                  {theme==="dark" ? <FiMoon size={15} aria-hidden="true"/> : <FiSun size={15} aria-hidden="true"/>}
                  <span>{theme==="dark" ? "Dark" : "Light"}</span>
                  <i className={styles.switchTrack}><i className={styles.switchKnob}/></i>
                </button>
              </div>
            </header>

            <section className={styles.stats} aria-label="Live key performance indicators">
              <StatCard label="TOTAL PLAYERS" Icon={FiUsers} value={loadingData ? "…" : sourceErrors.players ? "—" : number(counts.players)} subtitle="Registered players" />
              <StatCard label="TOTAL MATCHES" Icon={FiTarget} value={loadingData ? "…" : sourceErrors.matches ? "—" : number(counts.matches)} subtitle="Recorded matches" />
              <StatCard label="TOURNAMENTS" Icon={FiAward} value={loadingData ? "…" : sourceErrors.tournaments ? "—" : number(counts.tournaments)} subtitle="Tournament records" />
              <StatCard label="TOTAL PROFIT" Icon={FiTrendingUp} value={loadingData ? "…" : !completeFinance ? "—" : taka(totalProfit)} subtitle="Recorded match finance" />
            </section>

            {active === "overview" && (
              <section className={styles.commandActions} aria-label="Quick management shortcuts">
                <button type="button" className={styles.commandAction} onClick={() => goTo("players")}>
                  <span className={styles.commandActionIcon}><FiUsers aria-hidden="true"/></span>
                  <span className={styles.commandActionBody}><strong>Player control</strong><small>Roster & approvals</small></span>
                  <FiArrowUpRight className={styles.commandActionArrow} aria-hidden="true" />
                </button>
                <button type="button" className={styles.commandAction} onClick={() => goTo("matches")}>
                  <span className={styles.commandActionIcon}><FiTarget aria-hidden="true"/></span>
                  <span className={styles.commandActionBody}><strong>Match operations</strong><small>Scores & schedules</small></span>
                  <FiArrowUpRight className={styles.commandActionArrow} aria-hidden="true" />
                </button>
                <button type="button" className={styles.commandAction} onClick={() => goTo("verification")}>
                  <span className={styles.commandActionIcon}><FiShield aria-hidden="true"/></span>
                  <span className={styles.commandActionBody}><strong>Verification hub</strong><small>Secure live access codes</small></span>
                  <FiArrowUpRight className={styles.commandActionArrow} aria-hidden="true" />
                </button>
                <button type="button" className={[styles.commandAction, styles.withdrawalQuickAction].join(" ")} onClick={() => goTo("salary")}>
                  <span className={styles.commandActionIcon}><FiCreditCard aria-hidden="true"/></span>
                  <span className={styles.commandActionBody}><strong>Player Withdrawals</strong><small>bKash / Nagad · Review & payouts</small></span>
                  <FiArrowUpRight className={styles.commandActionArrow} aria-hidden="true" />
                </button>
              </section>
            )}

            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionOverline}>CONTROL ROOM / {active === "salary" ? "WITHDRAWALS" : active.toUpperCase()}</span>
                <h2>{active === "overview" ? "Operations Overview" : activeNav.name + " Overview"}</h2>
                <p>{activeNav.description}</p>
              </div>
              <div className={styles.headingActions}>
                {activeNav.href && <Link className={styles.sectionAction} href={activeNav.href}>Open full {activeNav.name} panel <FiArrowUpRight aria-hidden="true"/></Link>}
                {active === "matches" && <Link className={styles.sectionAction} href="/admin/matches/history"><FiClock aria-hidden="true"/> Match History <FiArrowUpRight aria-hidden="true"/></Link>}
                {active !== "salary" && (
                  <button type="button" className={styles.sectionAction} onClick={() => {
                      refresh();
                      if (active === "verification") setVerificationRefreshVersion((value) => value + 1);
                    }} disabled={loadingData}>
                    <FiRefreshCw aria-hidden="true"/> {loadingData ? "Refreshing…" : "Refresh data"}
                  </button>
                )}
              </div>
            </div>

            {sourceErrors.general && <div className={styles.notice}>{sourceErrors.general}</div>}

            {active === "overview" ? (
              <div className={styles.contentGrid}>
                <Panel title="Player & Match Activity" subtitle="Recent six months · actual database records" className={styles.panelWide}>
                  <div className={styles.legend}><span><i/>Players</span><span><i className={styles.second}/>Matches</span></div>
                  <TrendChart players={players} matches={matches} />
                  {(sourceErrors.players || sourceErrors.matches) && <p className={styles.notice}>One or more data sources are unavailable. Graph may be incomplete.</p>}
                </Panel>
                <Panel title="Match Distribution" subtitle="Current recorded match statuses">
                  <MatchDonut matches={matches} />
                </Panel>
                <Panel title="Recent Activity" subtitle="Latest entries from the connected database" className={styles.panelWide}>
                  <div className={styles.cardList}>
                    {!overviewActivity.length ? <div className={styles.empty}>No recent activity available.</div> :
                      overviewActivity.map((item,index) => (
                        <div className={styles.activity} key={item.type + item.title + index}>
                          <span className={styles.activityIcon}>{item.icon==="player" ? <FiUsers/> : item.icon==="match" ? <FiTarget/> : <FiAward/>}</span>
                          <span className={styles.activityText}><strong>{item.title}</strong><span>{item.type} · {dateLabel(item.timestamp)}</span></span>
                          <FiChevronRight style={{color:"var(--soft)"}} aria-hidden="true"/>
                        </div>
                      ))}
                  </div>
                </Panel>
                <Panel title="Tournament Progress" subtitle="Tournament status breakdown">
                  {sourceErrors.tournaments ? <div className={styles.empty}>Tournament data unavailable.</div> :
                    <div className={styles.progressList}>
                      <ProgressLine label="Upcoming" count={groupStatus(tournaments,"upcoming")} total={tournaments.length} />
                      <ProgressLine label="Ongoing" count={groupStatus(tournaments,"ongoing")} total={tournaments.length} />
                      <ProgressLine label="Completed" count={groupStatus(tournaments,"completed")} total={tournaments.length} />
                    </div>
                  }
                  {tournaments.length===0 && !sourceErrors.tournaments && <p className={styles.infoStrip}>No tournaments added yet.</p>}
                </Panel>
                <Panel title="Latest Matches" subtitle="Recently recorded matches" className={styles.panelFull}>
                  <div className={styles.tableWrap}>
                    {sourceErrors.matches ? <div className={styles.empty}>Match data unavailable.</div> :
                      matches.length === 0 ? <div className={styles.empty}>No match records yet.</div> :
                        <table className={styles.dataTable}>
                          <thead><tr><th>Match</th><th>Team</th><th>Status</th><th>Date</th></tr></thead>
                          <tbody>
                            {matches.slice(0,6).map((match) => (
                              <tr key={match.id}>
                                <td>{clean(match.match_type || tournamentNameById.get(String(match.tournament_id)) || "Match")}</td>
                                <td>{clean(teamNameById.get(String(match.team1_id)))}</td>
                                <td><Status value={match.status}/></td>
                                <td>{dateLabel(match.match_date || match.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    }
                  </div>
                </Panel>
              </div>
            ) : ActiveManager ? (
              <section className={styles.managerWorkspace} aria-label={activeNav.name + " management workspace"}>
                <ActiveManager key={active} />
              </section>
            ) : active === "verification" ? (
              <VerificationPanel refreshVersion={verificationRefreshVersion} />
            ) : active === "salary" ? (
              <div className={styles.sectionView}>
                <WithdrawalAccessPanel />
                <WithdrawalManagement players={players} />
              </div>
            ) : (
              <div className={styles.sectionView}>
                {sourceErrors[active] && <div className={styles.notice}>Unable to load {activeNav.name} data: {sourceErrors[active]}</div>}
                <div className={styles.overviewGrid}>
                  {metrics.map(([title,value]) => (
                    <div className={styles.miniCard} key={title}>
                      <span className={styles.miniCardLabel}>{title.toUpperCase()}</span>
                      <strong className={styles.miniCardValue}>{loadingData ? "…" : sourceErrors[active] ? "—" : typeof value === "number" ? number(value) : value}</strong>
                    </div>
                  ))}
                </div>
                <Panel title={activeNav.name + " Records"} subtitle="Latest records from your connected database">
                  <div className={styles.panelHeader} style={{marginBottom:12}}>
                    <label className={styles.search}>
                      <FiSearch aria-hidden="true"/>
                      <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder={"Search " + activeNav.name.toLowerCase()} aria-label={"Search " + activeNav.name}/>
                    </label>
                  </div>
                  <div className={styles.tableWrap}>
                    {loadingData ? <div className={styles.empty}>Loading records…</div> :
                      sourceErrors[active] ? <div className={styles.empty}>No records can be displayed until data is available.</div> :
                      !filtered.length ? <div className={styles.empty}>{search ? "No records match your search." : "No records created yet."}</div> :
                      <table className={styles.dataTable}>
                        <thead><tr>{COLUMNS[active].map((column)=><th key={column}>{column}</th>)}</tr></thead>
                        <tbody>
                          {filtered.map((row,index) => (
                            <tr key={row.id || index}>
                              {cellFor(active,row).map((cell,col)=><td key={col}>{cell}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    }
                  </div>
                  {showLimited && <p className={styles.infoStrip}>Showing recent {LIMIT} records for preview. Open the management panel for full records.</p>}
                  <div className={styles.infoStrip}>
                    {activeNav.href ? "Use Open full " + activeNav.name + " panel for creating, editing or managing records." : "This section is currently a dashboard preview."}
                  </div>
                </Panel>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

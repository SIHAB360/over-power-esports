// app/admin/matches/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const MANAGEMENT_PERCENTAGE = 30;
const PLAYER_PERCENTAGE = 70;
const REQUIRED_PLAYERS = 4;

export default function AdminMatchesPage({ moderatorMode = false } = {}) {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [moderatorPermissions, setModeratorPermissions] = useState([]);
  const canCreate = !moderatorMode || moderatorPermissions.some(p => p.section === "matches" && p.action === "create");
  const canFinalize = !moderatorMode || moderatorPermissions.some(p => p.section === "matches" && p.action === "approve");

  const [teams, setTeams] = useState([]);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerStats, setPlayerStats] = useState({});

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [form, setForm] = useState({
    tournament_id: "",
    team1_id: "",
    team2_id: "",
    match_date: "",
    match_type: "Scrim",
    status: "completed",
    team1_score: "",
    team2_score: "",
    winner_id: "",
    position: "",
    points: "",
    entry_fee: "",
    prize_money: "",
    platform: "Free Fire",
    map: "",
    sponsor: "",
    notice: "",
  });

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const role = profile?.role?.toLowerCase();

      if (moderatorMode) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { router.replace("/login"); return; }
        const access = await fetch("/api/moderator/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store"
        });
        if (!access.ok) throw new Error("Moderator access has been disabled or revoked.");
        const result = await access.json();
        if (!result.permissions?.some(p => p.section === "matches" && p.action === "view")) {
          throw new Error("Match Center View permission required.");
        }
        setModeratorPermissions(result.permissions);
        if (!result.permissions.some(p => p.section === "matches" && p.action === "approve")) {
          setForm(previous => ({ ...previous, status: "upcoming", entry_fee: "", prize_money: "",
            team1_score: "", team2_score: "", winner_id: "", position: "", points: "" }));
        }
      } else if (role !== "admin") {
        router.replace("/login");
        return;
      }

      await Promise.all([loadTeams(), loadTournaments(), loadRecentMatches(), loadRegisteredPlayers()]);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to load Match Management.");
      setMessageType("error");
    } finally {
      setPageLoading(false);
    }
  }

  async function loadTeams() {
    const { data, error } = await supabase
      .from("teams")
      .select("id, team_name, logo, status")
      .order("team_name", { ascending: true });

    if (error) throw error;
    setTeams(data || []);
  }

  // Sponsor dropdown shows players with an actual registered login account.
  // The existing matches.sponsor column is text, so store the selected player name
  // without requiring a database migration or changing existing match logic.
  async function loadRegisteredPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("id, user_id, full_name, ign")
      .not("user_id", "is", null)
      .order("full_name", { ascending: true });

    if (error) throw new Error(`Could not load registered players: ${error.message}`);
    setRegisteredPlayers(data || []);
  }

  async function loadTournaments() {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id, name, status, start_date, end_date")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setTournaments(data || []);
  }

  async function loadRecentMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        tournament_id,
        team1_id,
        team2_id,
        match_date,
        match_type,
        entry_fee,
        prize_money,
        profit,
        status,
        position:match_results(position)
      `
      )
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      const fallback = await supabase
        .from("matches")
        .select(
          `
          id,
          tournament_id,
          team1_id,
          team2_id,
          match_date,
          match_type,
          entry_fee,
          prize_money,
          profit,
          status
        `
        )
        .order("created_at", { ascending: false })
        .limit(6);

      if (fallback.error) throw fallback.error;
      setRecentMatches(fallback.data || []);
      return;
    }

    setRecentMatches(data || []);
  }

  async function loadTeamPlayers(teamId) {
    setSelectedPlayers([]);
    setTeamPlayers([]);
    setPlayerStats({});

    if (!teamId) return;

    const { data, error } = await supabase
      .from("players")
      .select(
        `
        id,
        full_name,
        ign,
        profile_image,
        avatar_url,
        primary_role,
        secondary_role,
        verified,
        status,
        team_id
      `
      )
      .eq("team_id", teamId)
      .eq("is_active", true)
      .in("status", ["approved", "active"])
      .order("full_name", { ascending: true });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }

    setTeamPlayers(data || []);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "team1_id") {
      loadTeamPlayers(value);
      setForm((prev) => ({
        ...prev,
        team1_id: value,
        winner_id: "",
      }));
    }
  }

  function togglePlayer(player) {
    setMessage("");
    setMessageType("");

    setSelectedPlayers((current) => {
      const exists = current.find((p) => p.id === player.id);

      if (exists) {
        return current.filter((p) => p.id !== player.id);
      }

      if (current.length >= REQUIRED_PLAYERS) {
        setMessage("Exactly 4 players can play this match.");
        setMessageType("error");
        return current;
      }

      return [...current, player];
    });
  }

  const entryFee = Number(form.entry_fee) || 0;
  const prizeMoney = Number(form.prize_money) || 0;
  const netProfit = prizeMoney - entryFee;
  // Signed values: the same 30/70 rule applies to profit and loss.
  const managementAmount = Math.round(netProfit * (MANAGEMENT_PERCENTAGE / 100) * 100) / 100;
  const playerPool = Math.round((netProfit - managementAmount) * 100) / 100;
  const perPlayerAmount =
    selectedPlayers.length === REQUIRED_PLAYERS
      ? playerPool / REQUIRED_PLAYERS
      : 0;

  function money(value) {
    return Number(value || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  function teamName(teamId) {
    if (!teamId) return "—";
    return teams.find((team) => team.id === teamId)?.team_name || "Unknown Team";
  }

  function tournamentName(tournamentId) {
    if (!tournamentId) return "Independent Match";
    return (
      tournaments.find((item) => item.id === tournamentId)?.name || "Tournament"
    );
  }

  async function handleSaveMatch(e) {
    e.preventDefault();
    if (moderatorMode && !canCreate) {
      setMessage("Main Admin must grant Match Center · Create permission.");
      setMessageType("error");
      return;
    }
    if (moderatorMode && !canFinalize && (form.status !== "upcoming" ||
      Number(form.entry_fee) || Number(form.prize_money) ||
      Number(form.team1_score) || Number(form.team2_score) || form.winner_id ||
      Number(form.position) || Number(form.points) ||
      Object.values(playerStats).some(p => Number(p.kills)||Number(p.assists)||Number(p.damage)||p.mvp))) {
      setMessage("Match Results & Finance approval permission is required.");
      setMessageType("error");
      return;
    }
    setMessage("");
    setMessageType("");

    if (!form.team1_id) {
      setMessage("Select your team.");
      setMessageType("error");
      return;
    }

    if (form.team2_id && form.team2_id === form.team1_id) {
      setMessage("Team 1 and Team 2 cannot be the same.");
      setMessageType("error");
      return;
    }

    if (!form.match_date) {
      setMessage("Select match date and time.");
      setMessageType("error");
      return;
    }

    if (selectedPlayers.length !== REQUIRED_PLAYERS) {
      setMessage("You must select exactly 4 active players.");
      setMessageType("error");
      return;
    }

    if (
      !Number.isFinite(entryFee) || !Number.isFinite(prizeMoney) ||
      entryFee < 0 || prizeMoney < 0 ||
      Math.abs(Math.round(entryFee * 100) - entryFee * 100) > 1e-7 ||
      Math.abs(Math.round(prizeMoney * 100) - prizeMoney * 100) > 1e-7
    ) {
      setMessage("Enter non-negative entry fee and prize money (maximum 2 decimals).");
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      // Single atomic database transaction. The RPC handles match, players,
      // stats, finance, results and the trigger-based earnings calculation.
      const payload = {
        ...form,
        team1_score: Number(form.team1_score) || 0,
        team2_score: Number(form.team2_score) || 0,
        entry_fee: entryFee,
        prize_money: prizeMoney,
      };

      const participants = selectedPlayers.map((selected) => ({
        player_id: selected.id,
        kills: Number(playerStats[selected.id]?.kills) || 0,
        assists: Number(playerStats[selected.id]?.assists) || 0,
        damage: Number(playerStats[selected.id]?.damage) || 0,
        mvp: Boolean(playerStats[selected.id]?.mvp),
      }));

      const { data: matchId, error: saveError } = await supabase.rpc(
        moderatorMode ? "moderator_create_esports_match" : "create_esports_match",
        { p_match: payload, p_players: participants }
      );

      if (saveError) throw saveError;
      if (!matchId) throw new Error("Match ID was not returned by Supabase.");

      setMessage(
        form.status === "completed"
          ? netProfit > 0
            ? `Match saved. Player pool: +৳${money(playerPool)} (shared by 4 players).`
            : netProfit < 0
              ? `Match saved. Player loss: ৳${money(Math.abs(playerPool))} (shared by 4 players).`
              : "Match saved. Break-even: no player earnings or losses."
          : "Match created. No player earnings until completion."
      );
      setMessageType("success");

      // Reset form
      setForm({
        tournament_id: "",
        team1_id: "",
        team2_id: "",
        match_date: "",
        match_type: "Scrim",
        status: "completed",
        team1_score: "",
        team2_score: "",
        winner_id: "",
        position: "",
        points: "",
        entry_fee: "",
        prize_money: "",
        platform: "Free Fire",
        map: "",
        sponsor: "",
        notice: "",
      });

      setTeamPlayers([]);
      setSelectedPlayers([]);
      setPlayerStats({});

      await loadRecentMatches();

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);

      setMessage(error.message || "Unable to save match.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (pageLoading) {
    return (
      <main className="op-loading">
        <div className="loader"></div>
        <span>LOADING MATCH COMMAND CENTER</span>

        <style jsx>{`
          .op-loading {
            min-height: 100vh;
            background: #050507;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
              sans-serif;
          }
          .loader {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            border: 3px solid rgba(255, 255, 255, 0.08);
            border-top-color: #ff2457;
            animation: spin 0.8s linear infinite;
          }
          span {
            color: #747481;
            font-size: 11px;
            letter-spacing: 2px;
            font-weight: 800;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="op-match-page">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>
      <div className="ambient ambient-three"></div>

      <div className="shell">
        {/* HEADER */}
        <header className="topbar">
          <div>
            <span className="eyebrow">OVER POWER ESPORTS</span>
            <h1>MATCH COMMAND CENTER</h1>
            <p>Record matches, active players, results and earnings.</p>
            {moderatorMode && <p style={{color:"#75d6e4",fontWeight:700,fontSize:13}}>
              MODERATOR MODE · Assigned: {moderatorPermissions.filter(p=>p.section==="matches").map(p=>p.action.toUpperCase()).join(" · ") || "VIEW"}
            </p>}
            {moderatorMode && !canCreate && <p role="status" style={{color:"#ffd58c",fontSize:13}}>
              Read-only workflow preview. Request Create permission from Main Admin to submit matches.
            </p>}
            {moderatorMode && !canFinalize && <p style={{color:"#ffd58c",fontSize:13}}>
              Results, player statistics and money entries require separate Finalize & Finance approval.
            </p>}
          </div>

          <div className="rule-pill">
            <span>PROFIT RULE</span>
            <strong>30 / 70</strong>
          </div>
        </header>

        {message && (
          <div
            className={
              messageType === "success" ? "message success" : "message error"
            }
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSaveMatch}>
          <fieldset disabled={moderatorMode && !canCreate} style={{border:0,padding:0,margin:0,minWidth:0}}>
          {/* STEP 01 */}
          <section className="panel">
            <SectionTitle
              number="01"
              small="MATCH SETUP"
              title="MATCH INFORMATION"
            />

            <div className="form-grid">
              <FieldWrap label="Tournament">
                <select
                  name="tournament_id"
                  value={form.tournament_id}
                  onChange={handleChange}
                >
                  <option value="">Independent / No Tournament</option>
                  {tournaments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FieldWrap>

              <FieldWrap label="Match Type">
                <select
                  name="match_type"
                  value={form.match_type}
                  onChange={handleChange}
                >
                  <option value="Scrim">Scrim</option>
                  <option value="CR">Champion Rush</option>
                  <option value="Official">Official Tournament</option>
                  <option value="Custom">Custom Tournament</option>
                </select>
              </FieldWrap>

              <div className="op-smart-date-field">
                <FieldWrap label="Date & Time · Smart Scheduler">
                  <SmartMatchDateTime
                    value={form.match_date}
                    onChange={(next) => setForm((prev) => ({ ...prev, match_date: next }))}
                  />
                </FieldWrap>
              </div>

              <FieldWrap label="Status">
                <select
                  name="status"
                  disabled={moderatorMode && !canFinalize}
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="completed">Completed</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                </select>
              </FieldWrap>

              <FieldWrap label="Platform">
                <input
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  placeholder="Free Fire"
                />
              </FieldWrap>

              <FieldWrap label="Map">
                <input
                  name="map"
                  value={form.map}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </FieldWrap>

              <FieldWrap label="Sponsor / Organizer">
                <div className="op-sponsor-picker">
                  <button type="button" className={`op-sponsor-trigger ${sponsorOpen ? "is-open" : ""}`}
                    aria-haspopup="listbox" aria-expanded={sponsorOpen}
                    onClick={() => { setSponsorOpen(!sponsorOpen); setSponsorSearch(""); }}>
                    <span className={form.sponsor ? "op-sponsor-chosen" : "op-sponsor-placeholder"}>
                      {form.sponsor || "Select registered player (optional)"}
                    </span>
                    <span className="op-picker-chevron">{sponsorOpen ? "▴" : "▾"}</span>
                  </button>
                  {sponsorOpen && (
                    <div className="op-sponsor-menu" role="listbox" aria-label="Registered sponsor players">
                      <input autoFocus type="search" className="op-sponsor-search"
                        placeholder="Search IGN or player name..." value={sponsorSearch}
                        onChange={(e) => setSponsorSearch(e.target.value)} />
                      <div className="op-sponsor-options">
                        <button type="button" role="option" aria-selected={!form.sponsor}
                          className="op-sponsor-option" onClick={() => {
                            setForm(prev => ({...prev, sponsor: ""})); setSponsorOpen(false);
                          }}>No sponsor / organizer</button>
                        {registeredPlayers.filter(p => `${p.ign || ""} ${p.full_name || ""}`
                          .toLowerCase().includes(sponsorSearch.trim().toLowerCase())).map(p => {
                          const name = p.full_name || p.ign || "Registered Player";
                          return <button type="button" role="option" aria-selected={form.sponsor === name}
                            className="op-sponsor-option" key={p.id} onClick={() => {
                              setForm(prev => ({...prev, sponsor: name})); setSponsorOpen(false);
                            }}><span className="op-sponsor-ign">{p.ign || "PLAYER"}</span>
                            <span className="op-sponsor-fullname">{p.full_name || ""}</span></button>;
                        })}
                        {registeredPlayers.filter(p => `${p.ign || ""} ${p.full_name || ""}`
                          .toLowerCase().includes(sponsorSearch.trim().toLowerCase())).length === 0 &&
                          <p className="op-sponsor-empty">No registered players found</p>}
                      </div>
                    </div>
                  )}
                </div>
              </FieldWrap>
            </div>
          </section>

          {/* STEP 02 */}
          <section className="panel">
            <SectionTitle number="02" small="TEAM" title="SELECT TEAM" />

            <div className="team-grid">
              <FieldWrap label="Your Team">
                <select
                  name="team1_id"
                  value={form.team1_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </FieldWrap>

              <FieldWrap label="Opponent Team (Optional)">
                <select
                  name="team2_id"
                  value={form.team2_id}
                  onChange={handleChange}
                >
                  <option value="">No Opponent</option>
                  {teams
                    .filter((team) => team.id !== form.team1_id)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.team_name}
                      </option>
                    ))}
                </select>
              </FieldWrap>
            </div>
          </section>

          {/* STEP 03 */}
          <section className="panel">
            <SectionTitle
              number="03"
              small="ACTIVE LINEUP"
              title="CHOOSE ANY 4 FROM THE FULL SQUAD"
            />

            <div className="selection-counter">
              <span>SELECTED · {teamPlayers.length} AVAILABLE IN SQUAD</span>
              <strong>
                {selectedPlayers.length} / 4
              </strong>
            </div>

            {!form.team1_id ? (
              <div className="empty-state">Select your team first.</div>
            ) : teamPlayers.length === 0 ? (
              <div className="empty-state">
                No active, approved players are currently assigned to this squad.
              </div>
            ) : (
              <>
              <p className="squad-picker-help">All active squad members are listed below. Tick exactly four to include in the match. Only selected players receive performance statistics and earnings.</p>
               <div className="player-grid">
                {teamPlayers.map((player) => {
                  const selected = selectedPlayers.some(
                    (p) => p.id === player.id
                  );

                  return (
                    <label
                      key={player.id}
                      className={
                        selected ? "player-card selected" : "player-card"
                      }
                    >
                    <input type="checkbox" className="squad-player-checkbox" checked={selected} onChange={() => togglePlayer(player)} aria-label={"Pick "+(player.ign || player.full_name || "player")+" for match"} />
                      <div className="avatar">
                        {player.profile_image || player.avatar_url ? (
                          <img
                            src={player.profile_image || player.avatar_url}
                            alt={player.ign || player.full_name}
                          />
                        ) : (
                          <span>
                            {(player.ign || player.full_name || "P")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="player-copy">
                        <strong>{player.ign || player.full_name}</strong>
                        <span>{player.full_name}</span>
                        <small>{player.primary_role || "PLAYER"}</small>
                      </div>

                      <div className="check">{selected ? "✓" : "+"}</div>
                    </label>
                  );
                })}
              </div>
              </>
            )}
          </section>

          {/* STEP 04 - RESULT + PERFORMANCE */}
          <section className="panel">
            <SectionTitle number="04" small="RESULT" title="MATCH RESULT" />

            {/* PLAYER PERFORMANCE */}
            {selectedPlayers.length > 0 && (
              <div className="performance-box">
                <h3>🎮 Player Performance</h3>

                <div className="performance-header">
                  <span>Player</span>
                  <span>Kills</span>
                  <span>Assist</span>
                  <span>Damage</span>
                  <span>MVP</span>
                </div>

                {selectedPlayers.map((player) => (
                  <div key={player.id} className="performance-row">
                    <div className="player-name">
                      {player.ign || player.full_name || "Player"}
                    </div>

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={playerStats[player.id]?.kills ?? ""}
                      onChange={(e) =>
                        setPlayerStats((prev) => ({
                          ...prev,
                          [player.id]: {
                            ...prev[player.id],
                            kills: Number(e.target.value) || 0,
                          },
                        }))
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={playerStats[player.id]?.assists ?? ""}
                      onChange={(e) =>
                        setPlayerStats((prev) => ({
                          ...prev,
                          [player.id]: {
                            ...prev[player.id],
                            assists: Number(e.target.value) || 0,
                          },
                        }))
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={playerStats[player.id]?.damage ?? ""}
                      onChange={(e) =>
                        setPlayerStats((prev) => ({
                          ...prev,
                          [player.id]: {
                            ...prev[player.id],
                            damage: Number(e.target.value) || 0,
                          },
                        }))
                      }
                    />

                    <label className="mvp-check">
                      <input
                        type="checkbox"
                        checked={playerStats[player.id]?.mvp || false}
                        onChange={(e) =>
                          setPlayerStats((prev) => ({
                            ...prev,
                            [player.id]: {
                              ...prev[player.id],
                              mvp: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>MVP</span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="form-grid" style={{ marginTop: "24px" }}>
              <FieldWrap label="Position">
                <input
                  type="number"
                  min="1"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="Example: 1"
                />
              </FieldWrap>

              <FieldWrap label="Points">
                <input
                  type="number"
                  min="0"
                  name="points"
                  value={form.points}
                  onChange={handleChange}
                  placeholder="0"
                />
              </FieldWrap>

              <FieldWrap label="Team 1 Score">
                <input
                  type="number"
                  min="0"
                  name="team1_score"
                  value={form.team1_score}
                  onChange={handleChange}
                  placeholder="0"
                />
              </FieldWrap>

              <FieldWrap label="Team 2 Score">
                <input
                  type="number"
                  min="0"
                  name="team2_score"
                  value={form.team2_score}
                  onChange={handleChange}
                  placeholder="0"
                />
              </FieldWrap>

              <FieldWrap label="Winner">
                <select
                  name="winner_id"
                  value={form.winner_id}
                  onChange={handleChange}
                >
                  <option value="">No Winner / Placement Match</option>
                  {form.team1_id && (
                    <option value={form.team1_id}>
                      {teamName(form.team1_id)}
                    </option>
                  )}
                  {form.team2_id && (
                    <option value={form.team2_id}>
                      {teamName(form.team2_id)}
                    </option>
                  )}
                </select>
              </FieldWrap>
            </div>
          </section>

          {/* STEP 05 - FINANCE */}
          <section className="panel finance-panel">
            <SectionTitle
              number="05"
              small="FINANCE ENGINE"
              title="PROFIT & PLAYER EARNINGS"
            />

            <div className="money-inputs">
              <FieldWrap label="Entry Fee">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="entry_fee"
                  disabled={moderatorMode && !canFinalize}
                  value={form.entry_fee}
                  onChange={handleChange}
                  placeholder="0"
                />
              </FieldWrap>

              <FieldWrap label="Prize Money">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="prize_money"
                  disabled={moderatorMode && !canFinalize}
                  value={form.prize_money}
                  onChange={handleChange}
                  placeholder="0"
                />
              </FieldWrap>
            </div>

            <div className="finance-grid">
              <FinanceCard
                label="NET PROFIT"
                value={`৳${money(netProfit)}`}
                type={netProfit >= 0 ? "green" : "red"}
              />
              <FinanceCard
                label="MANAGEMENT 30% (SIGNED)"
                value={`৳${money(managementAmount)}`}
                type="red"
              />
              <FinanceCard
                label="PLAYERS 70% (SIGNED)"
                value={`৳${money(playerPool)}`}
                type="purple"
              />
              <FinanceCard
                label="EACH PLAYER"
                value={`৳${money(perPlayerAmount)}`}
                type={perPlayerAmount >= 0 ? "green" : "red"}
              />
            </div>

            <div className="rule-box">
              <div>
                <span>ACTIVE PLAYERS</span>
                <strong>
                  {selectedPlayers.length} / 4
                </strong>
              </div>
              <p>
                Only the 4 players selected for this match receive the player
                share. Players who did not participate receive no earning record
                for this match.
              </p>
            </div>
          </section>

          {/* STEP 06 */}
          <section className="panel">
            <SectionTitle number="06" small="NOTES" title="MATCH NOTICE" />

            <textarea
              name="notice"
              value={form.notice}
              onChange={handleChange}
              placeholder="Optional notes about this match..."
            />
          </section>

          <button type="submit" className="save-button" disabled={saving}>
            <span>
              {saving ? "PROCESSING MATCH..." : "SAVE MATCH & CALCULATE"}
            </span>
            <strong>→</strong>
          </button>
          </fieldset>
        </form>

        {/* HISTORY ARCHIVE LINK — all saved records now live on a separate page. */}
        <section className="history">
          <SectionTitle number="07" small="MATCH RECORDS" title="MATCH HISTORY" />
          <div className="history-link-panel">
            <div>
              <span className="history-link-tag">COMPLETE MATCH ARCHIVE</span>
              <h3>Every match, all in one place</h3>
              <p>See all your recorded matches in serial order, including lobby, Scrim or Champion Rush, entry fee, prize, profit or loss, date and time.</p>
            </div>
            <Link href={moderatorMode ? "/moderator/section/matches?screen=records" : "/admin/matches/history"} className="history-open-button">
              VIEW MATCH HISTORY <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>

      <style jsx global>{`.op-match-page .squad-picker-help{color:#bde8fa;font-size:13px;line-height:1.55;margin:4px 0 14px}
.op-match-page .player-grid .player-card{cursor:pointer;position:relative;display:flex;align-items:center;gap:12px;min-width:0}
.op-match-page .squad-player-checkbox{width:20px!important;height:20px!important;min-width:20px;flex:none;appearance:auto!important;accent-color:#55efd1!important;cursor:pointer;border:1px solid #7ee6f6!important;background:transparent!important}
.op-match-page .player-card:has(.squad-player-checkbox:focus-visible){outline:2px solid #6beafb!important;outline-offset:2px}
`}</style>
      <style jsx global>{`
        .op-match-page,
        .op-match-page * {
          box-sizing: border-box;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        body {
          margin: 0;
          background: #050507;
        }

        .op-match-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding: 30px 18px 80px;
          background: radial-gradient(
              circle at 8% 0%,
              rgba(255, 20, 75, 0.16),
              transparent 28%
            ),
            radial-gradient(
              circle at 95% 20%,
              rgba(116, 40, 255, 0.14),
              transparent 30%
            ),
            radial-gradient(
              circle at 50% 100%,
              rgba(255, 20, 75, 0.08),
              transparent 40%
            ),
            #050507;
          color: white;
        }

        .ambient {
          position: fixed;
          border-radius: 50%;
          filter: blur(150px);
          pointer-events: none;
          opacity: 0.25;
          z-index: 0;
        }

        .ambient-one {
          width: 420px;
          height: 420px;
          background: #ff174d;
          top: -200px;
          left: -160px;
        }

        .ambient-two {
          width: 480px;
          height: 480px;
          background: #6524ff;
          right: -220px;
          top: 280px;
        }

        .ambient-three {
          width: 350px;
          height: 350px;
          background: #ff174d;
          bottom: -100px;
          left: 40%;
          opacity: 0.15;
        }

        .shell {
          width: 100%;
          max-width: 1180px;
          margin: auto;
          position: relative;
          z-index: 2;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          padding: 34px;
          margin-bottom: 20px;
          border-radius: 26px;
          background: linear-gradient(
            145deg,
            rgba(28, 10, 17, 0.94),
            rgba(8, 8, 13, 0.96)
          );
          border: 1px solid rgba(255, 38, 83, 0.28);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45),
            0 0 40px rgba(255, 23, 77, 0.08);
        }

        .eyebrow {
          color: #ff4167;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2.8px;
          text-shadow: 0 0 12px rgba(255, 65, 103, 0.5);
        }

        .topbar h1 {
          margin: 8px 0 8px;
          font-size: clamp(26px, 4vw, 46px);
          line-height: 1.05;
          background: linear-gradient(90deg, #ffffff, #ff8fa3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(255, 65, 103, 0.3);
        }

        .topbar p {
          margin: 0;
          color: #9a9aa8;
          font-size: 13.5px;
        }

        .rule-pill {
          min-width: 150px;
          padding: 17px 20px;
          border-radius: 17px;
          background: rgba(255, 23, 77, 0.1);
          border: 1px solid rgba(255, 23, 77, 0.3);
          text-align: center;
          box-shadow: 0 0 25px rgba(255, 23, 77, 0.15);
        }

        .rule-pill span {
          display: block;
          color: #a0a0ae;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .rule-pill strong {
          display: block;
          margin-top: 6px;
          color: #ff4368;
          font-size: 24px;
          text-shadow: 0 0 15px rgba(255, 67, 104, 0.6);
        }

        .message {
          padding: 15px 18px;
          margin-bottom: 16px;
          border-radius: 14px;
          font-size: 13.5px;
          font-weight: 700;
        }

        .message.success {
          color: #64ffb6;
          background: rgba(25, 255, 155, 0.08);
          border: 1px solid rgba(25, 255, 155, 0.25);
          box-shadow: 0 0 20px rgba(25, 255, 155, 0.1);
        }

        .message.error {
          color: #ff718d;
          background: rgba(255, 25, 75, 0.08);
          border: 1px solid rgba(255, 25, 75, 0.25);
          box-shadow: 0 0 20px rgba(255, 25, 75, 0.1);
        }

        .panel,
        .history {
          position: relative;
          margin-bottom: 18px;
          padding: 28px;
          border-radius: 22px;
          background: linear-gradient(
            145deg,
            rgba(18, 18, 24, 0.96),
            rgba(8, 8, 12, 0.98)
          );
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.3);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .section-number {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 13px;
          color: #ff4167;
          background: rgba(255, 23, 77, 0.1);
          border: 1px solid rgba(255, 23, 77, 0.25);
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 0 18px rgba(255, 23, 77, 0.2);
        }

        .section-title small {
          display: block;
          margin-bottom: 4px;
          color: #7a7a88;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.2px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: 0.4px;
          color: #f0f0f5;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .team-grid,
        .money-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .field-wrap label {
          display: block;
          margin-bottom: 8px;
          color: #9a9aa8;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .field-wrap input,
        .field-wrap select,
        textarea {
          width: 100%;
          min-height: 52px;
          border-radius: 13px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.35);
          color: white;
          outline: none;
          padding: 0 15px;
          font-size: 14px;
          transition: 0.2s ease;
          color-scheme: dark;
        }

        textarea {
          min-height: 120px;
          padding: 15px;
          resize: vertical;
        }

        .field-wrap input:focus,
        .field-wrap select:focus,
        textarea:focus {
          border-color: rgba(255, 35, 80, 0.6);
          box-shadow: 0 0 0 3px rgba(255, 23, 77, 0.12);
        }

        /* ===== PLAYER PERFORMANCE ===== */
        .performance-box {
          margin-top: 8px;
          padding: 22px;
          border-radius: 20px;
          background: linear-gradient(
            145deg,
            rgba(255, 20, 80, 0.1),
            rgba(15, 15, 25, 0.9)
          );
          border: 1px solid rgba(255, 20, 80, 0.35);
          box-shadow: 0 0 40px rgba(255, 20, 80, 0.12);
        }

        .performance-box h3 {
          margin: 0 0 18px;
          font-size: 16px;
          color: #ff8fa3;
          letter-spacing: 0.5px;
        }

        .performance-header {
          display: grid;
          grid-template-columns: 180px repeat(3, 1fr) 80px;
          gap: 10px;
          margin-bottom: 12px;
          padding: 0 4px;
          color: #8a8a96;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .performance-row {
          display: grid;
          grid-template-columns: 180px repeat(3, 1fr) 80px;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }

        .player-name {
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
        }

        .performance-row input {
          width: 100%;
          min-height: 44px;
          border-radius: 11px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.4);
          color: white;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          transition: 0.2s ease;
        }

        .performance-row input:focus {
          border-color: rgba(255, 35, 80, 0.6);
          box-shadow: 0 0 0 3px rgba(255, 23, 77, 0.12);
        }

        .mvp-check {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #c9c9d0;
          font-size: 13px;
          font-weight: 700;
        }

        .mvp-check input {
          width: 18px;
          height: 18px;
          accent-color: #ff174d;
          cursor: pointer;
        }

        .selection-counter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
          padding: 13px 16px;
          border-radius: 13px;
          background: rgba(255, 23, 77, 0.06);
          border: 1px solid rgba(255, 23, 77, 0.15);
        }

        .selection-counter span {
          color: #8a8a96;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        .selection-counter strong {
          color: #ff4167;
          font-size: 18px;
          text-shadow: 0 0 12px rgba(255, 65, 103, 0.5);
        }

        .player-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .player-card {
          width: 100%;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 13px;
          padding: 14px;
          text-align: left;
          color: white;
          cursor: pointer;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          transition: 0.22s ease;
        }

        .player-card:hover {
          border-color: rgba(255, 23, 77, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .player-card.selected {
          background: rgba(255, 23, 77, 0.1);
          border-color: rgba(255, 23, 77, 0.5);
          box-shadow: 0 0 30px rgba(255, 23, 77, 0.15);
        }

        .avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ff174d, #702dff);
          font-weight: 900;
          font-size: 18px;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .player-copy strong {
          display: block;
          font-size: 14px;
          color: #fff;
        }

        .player-copy span {
          display: block;
          margin-top: 3px;
          color: #8a8a96;
          font-size: 11px;
        }

        .player-copy small {
          display: inline-block;
          margin-top: 5px;
          color: #ff6483;
          font-size: 9px;
          font-weight: 800;
        }

        .check {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.06);
          font-size: 15px;
          font-weight: 900;
        }

        .selected .check {
          background: #ff174d;
          box-shadow: 0 0 18px rgba(255, 23, 77, 0.4);
        }

        .finance-panel {
          border-color: rgba(112, 43, 255, 0.22);
        }

        .finance-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .finance-card {
          min-height: 120px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .finance-card span {
          color: #8a8a96;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .finance-card strong {
          font-size: clamp(20px, 3vw, 28px);
        }

        .finance-card.green strong {
          color: #22f29d;
          text-shadow: 0 0 15px rgba(34, 242, 157, 0.4);
        }

        .finance-card.red strong {
          color: #ff456a;
          text-shadow: 0 0 15px rgba(255, 69, 106, 0.4);
        }

        .finance-card.purple strong {
          color: #a77aff;
          text-shadow: 0 0 15px rgba(167, 122, 255, 0.4);
        }

        .rule-box {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 20px;
          margin-top: 16px;
          padding: 16px;
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.28);
        }

        .rule-box div {
          min-width: 110px;
          padding: 12px;
          text-align: center;
          border-radius: 12px;
          background: rgba(255, 23, 77, 0.09);
        }

        .rule-box span {
          display: block;
          color: #8a8a96;
          font-size: 8px;
          font-weight: 900;
        }

        .rule-box strong {
          display: block;
          margin-top: 5px;
          color: #ff456a;
          font-size: 20px;
        }

        .rule-box p {
          margin: 0;
          color: #9a9aa8;
          font-size: 12px;
          line-height: 1.65;
        }

        .save-button {
          width: 100%;
          min-height: 66px;
          margin: 6px 0 28px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          cursor: pointer;
          border-radius: 17px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: linear-gradient(105deg, #c90038, #ff174d, #6f2bff);
          box-shadow: 0 16px 45px rgba(255, 0, 70, 0.25);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.6px;
          transition: 0.25s ease;
        }

        .save-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 55px rgba(255, 0, 70, 0.35);
        }

        .save-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .save-button strong {
          font-size: 24px;
        }

        .empty-state {
          padding: 28px;
          border-radius: 14px;
          color: #7a7a88;
          text-align: center;
          background: rgba(255, 255, 255, 0.025);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          font-size: 13px;
        }

        .history {
          margin-bottom: 0;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .history-card {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 20px;
          padding: 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: 0.2s ease;
        }

        .history-card:hover {
          border-color: rgba(255, 23, 77, 0.25);
          background: rgba(255, 23, 77, 0.04);
        }

        .history-main span {
          display: block;
          color: #ff5878;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .history-main strong {
          display: block;
          margin-top: 4px;
          font-size: 14px;
          color: #fff;
        }

        .history-main small {
          display: block;
          margin-top: 3px;
          color: #7a7a88;
        }

        .history-money {
          text-align: right;
        }

        .history-money span {
          display: block;
          color: #7a7a88;
          font-size: 9px;
          font-weight: 900;
        }

        .history-money strong {
          display: block;
          margin-top: 3px;
          color: #25efa0;
          font-size: 17px;
          text-shadow: 0 0 12px rgba(37, 239, 160, 0.4);
        }

        .history-status {
          padding: 8px 12px;
          border-radius: 999px;
          color: #c9c9d0;
          background: rgba(255, 255, 255, 0.06);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 900px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .finance-grid {
            grid-template-columns: 1fr 1fr;
          }
          .performance-header,
          .performance-row {
            grid-template-columns: 140px repeat(3, 1fr) 70px;
          }
        }

        @media (max-width: 650px) {
          .op-match-page {
            padding: 14px 12px 50px;
          }
          .topbar {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 18px;
            border-radius: 20px;
          }
          .rule-pill {
            margin-top: 16px;
          }
          .panel,
          .history {
            padding: 20px 14px;
            border-radius: 18px;
          }
          .form-grid,
          .team-grid,
          .money-inputs {
            grid-template-columns: 1fr;
          }
          .player-grid {
            grid-template-columns: 1fr;
          }
          .finance-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .performance-header {
            display: none;
          }
          .performance-row {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 12px;
            margin-bottom: 12px;
          }
          .player-name {
            grid-column: 1 / -1;
            margin-bottom: 4px;
          }
          .mvp-check {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }
          .rule-box {
            grid-template-columns: 1fr;
          }
          .history-card {
            grid-template-columns: 1fr auto;
          }
          .history-status {
            grid-column: 1 / -1;
            width: fit-content;
          }
        }

        @media (max-width: 420px) {
          .finance-grid {
            grid-template-columns: 1fr;
          }
        }


        /* ========= OVER POWER PREMIUM / RESPONSIVE V2 ========= */
        .op-match-page {
          background: radial-gradient(ellipse 800px 430px at 3% 0%,rgba(239,18,75,.17),transparent 75%),
            radial-gradient(ellipse 650px 600px at 100% 16%,rgba(110,48,245,.15),transparent 75%),
            linear-gradient(145deg,#07070c 0%,#0b0911 50%,#05060b 100%);
          padding: 32px clamp(14px, 3vw, 48px) 96px;
        }
        .op-match-page .shell { max-width: 1180px; width:100%; margin:0 auto; }
        .op-match-page .shell > form {display:flex;flex-direction:column;gap:20px;width:100%;min-width:0;}
        .op-match-page .topbar { width:100%;margin-bottom:26px;padding:clamp(22px,3vw,38px);
          border:1px solid rgba(255,68,115,.40);background:linear-gradient(112deg,rgba(36,10,23,.95),rgba(15,11,24,.96) 65%,rgba(27,12,37,.94));
          box-shadow:0 24px 70px rgba(0,0,0,.48),inset 0 1px rgba(255,255,255,.08),0 0 30px rgba(251,29,82,.10); }
        .op-match-page .topbar h1 {background:linear-gradient(92deg,#fff 5%,#ffb7c9 53%,#ffd16e 100%);-webkit-background-clip:text;background-clip:text;
          -webkit-text-fill-color:transparent;letter-spacing:-.8px;line-height:1.12;}
        .op-match-page .topbar .eyebrow {color:#ff517f;}
        .op-match-page .rule-pill {border-color:rgba(255,193,90,.55);background:linear-gradient(145deg,rgba(101,29,53,.45),rgba(34,20,34,.9));
          box-shadow:0 0 24px rgba(255,65,99,.17),inset 0 1px rgba(255,255,255,.06);animation:opSoftPulse 4s ease-in-out infinite;}
        .op-match-page .rule-pill strong {color:#ffc46e;text-shadow:0 0 18px rgba(255,157,59,.45);}
        .op-match-page .panel, .op-match-page .history {width:100%;min-width:0;margin:0;padding:clamp(20px,2.6vw,32px);
          border:1px solid rgba(155,110,195,.20);border-radius:24px;background:linear-gradient(150deg,rgba(23,22,34,.98),rgba(11,11,20,.98));
          box-shadow:0 20px 55px rgba(0,0,0,.30),inset 0 1px rgba(255,255,255,.035);transition:border-color .25s,box-shadow .25s;}
        .op-match-page .panel:hover,.op-match-page .history:hover {border-color:rgba(255,71,123,.37);box-shadow:0 22px 60px rgba(0,0,0,.37),0 0 24px rgba(242,45,99,.075);}
        .op-match-page .section-title {gap:16px;margin-bottom:26px;padding-bottom:19px;border-bottom-color:rgba(255,255,255,.09);}
        .op-match-page .section-number {background:linear-gradient(145deg,rgba(255,35,90,.22),rgba(112,42,235,.16));border-color:rgba(255,61,115,.40);
          box-shadow:0 0 14px rgba(255,33,85,.17);color:#ff668d;}
        .op-match-page .section-title h2 {font-size:clamp(16px,1.8vw,21px);letter-spacing:.4px;}
        .op-match-page .section-title small {color:#ba96c8;}
        .op-match-page .form-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;}
        .op-match-page .team-grid,.op-match-page .money-inputs {grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;}
        .op-match-page .field-wrap {min-width:0;}
        .op-match-page .field-wrap label {color:#b8b3c8;letter-spacing:1.1px;font-size:10px;}
        .op-match-page .field-wrap :is(input,select),.op-match-page textarea {
          width:100%;max-width:100%;min-width:0;background:#0d0e17;border:1px solid rgba(185,165,210,.21);
          border-radius:13px;min-height:52px;color:#f8f5fc;transition:border-color .2s,box-shadow .2s,background .2s;}
        .op-match-page .field-wrap :is(input,select):hover,.op-match-page textarea:hover {border-color:rgba(255,92,139,.46);}
        .op-match-page .field-wrap :is(input,select):focus,.op-match-page textarea:focus {border-color:#ff427a;background:#12101d;
          box-shadow:0 0 0 3px rgba(255,44,106,.14),0 0 22px rgba(255,35,96,.12);}
        .op-match-page .field-wrap select[name="sponsor"] {border-color:rgba(255,193,92,.52);background:linear-gradient(110deg,#17111b,#0d0e17);
          box-shadow:0 0 18px rgba(255,176,67,.08);cursor:pointer;}
        .op-match-page .field-wrap select[name="sponsor"]:focus {border-color:#ffcf78;box-shadow:0 0 0 3px rgba(255,190,92,.15),0 0 24px rgba(255,190,92,.18);}
        .op-match-page .finance-panel {border-color:rgba(145,93,255,.38);background:linear-gradient(145deg,rgba(28,20,45,.98),rgba(13,11,23,.98));}
        .op-match-page .finance-grid {grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;}
        .op-match-page .finance-card {border-color:rgba(174,137,255,.24);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.012));
          transition:transform .25s,border-color .25s,box-shadow .25s;min-width:0;}
        .op-match-page .finance-card:hover {transform:translateY(-3px);border-color:rgba(255,103,155,.48);box-shadow:0 10px 28px rgba(0,0,0,.25);}
        .op-match-page .finance-card strong {overflow-wrap:anywhere;}
        .op-match-page .save-button {background:linear-gradient(100deg,#d20b48 0%,#fa315e 42%,#a137ef 100%);border-color:rgba(255,255,255,.25);
          box-shadow:0 12px 35px rgba(227,20,83,.26);position:relative;overflow:hidden;}
        .op-match-page .save-button:not(:disabled)::after {content:"";position:absolute;inset:0;
          background:linear-gradient(115deg,transparent 25%,rgba(255,255,255,.16) 48%,transparent 70%);
          transform:translateX(-125%);animation:opShine 5.5s ease-in-out infinite;pointer-events:none;}
        .op-match-page .save-button > * {position:relative;z-index:1;}
        .op-match-page .player-card.selected {border-color:#ff4d89;background:linear-gradient(130deg,rgba(255,33,94,.20),rgba(92,39,168,.17));box-shadow:0 0 18px rgba(255,44,106,.17);}
        .op-match-page .history {margin-top:22px;}
        .op-match-page .ambient {animation:opAmbient 9s ease-in-out infinite alternate;}
        .op-match-page .ambient-two {animation-delay:-3s;}
        .op-match-page .ambient-three {animation-delay:-6s;}
        @keyframes opSoftPulse {0%,100%{box-shadow:0 0 13px rgba(255,65,99,.12)}50%{box-shadow:0 0 29px rgba(255,110,93,.28)}}
        @keyframes opShine {0%,68%,100%{transform:translateX(-125%)}82%{transform:translateX(125%)}}
        @keyframes opAmbient {from{opacity:.13;transform:scale(.95)}to{opacity:.27;transform:scale(1.08)}}
        @media(max-width:950px){.op-match-page .form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.op-match-page .finance-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.op-match-page {padding:15px 12px 58px}.op-match-page .topbar{padding:24px 19px;gap:13px}.op-match-page .topbar h1{font-size:clamp(25px,7vw,36px)}
          .op-match-page .rule-pill{margin-top:0;min-width:0}.op-match-page .panel,.op-match-page .history{padding:21px 16px;border-radius:18px}
          .op-match-page .form-grid,.op-match-page .team-grid,.op-match-page .money-inputs{grid-template-columns:minmax(0,1fr);gap:16px}
          .op-match-page .finance-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.op-match-page .section-title h2{font-size:16px}}
        @media(max-width:390px){.op-match-page .finance-grid{grid-template-columns:minmax(0,1fr)}.op-match-page .topbar h1{font-size:25px}}
        /* PREMIUM V3: full-width content + brighter hierarchy */
        .op-match-page .shell {width:100%;max-width:1320px;}
        .op-match-page .shell > form {width:100%!important;max-width:none!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;justify-items:stretch!important;align-items:stretch!important;}
        .op-match-page .shell > form > .panel,
        .op-match-page .shell > form > .save-button {width:100%!important;max-width:none!important;min-width:0;justify-self:stretch!important;}
        .op-match-page .topbar {box-shadow:0 22px 80px rgba(0,0,0,.55),0 0 55px rgba(255,40,107,.22),inset 0 1px rgba(255,255,255,.12);}
        .op-match-page .topbar h1 {filter:drop-shadow(0 0 14px rgba(255,125,159,.24));}
        .op-match-page .section-title h2 {color:#fff5fc;text-shadow:0 0 16px rgba(255,92,162,.30);font-weight:900;}
        .op-match-page .section-title small,.op-match-page .field-wrap label {color:#f6bddf;font-weight:900;text-shadow:0 0 11px rgba(255,56,127,.32);}
        .op-match-page .section-number {color:#ffd0e0;box-shadow:0 0 22px rgba(249,38,115,.40);}
        .op-match-page .panel,.op-match-page .history {overflow:visible;box-shadow:0 22px 75px rgba(0,0,0,.46),0 0 25px rgba(145,56,235,.12),inset 0 1px rgba(255,255,255,.09);border-color:rgba(195,116,248,.40);}
        .op-match-page .form-grid {grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;}
        .op-match-page .field-wrap :is(input,select),.op-match-page textarea {background:#10101c;border:1px solid rgba(222,169,252,.39);color:#fff;font-size:14px;}
        .op-match-page .field-wrap :is(input,select):focus,.op-match-page textarea:focus {box-shadow:0 0 0 3px rgba(255,65,124,.19),0 0 23px rgba(255,65,124,.28);}
        .op-match-page .rule-pill {animation:opGlowFlash 3.2s ease-in-out infinite;}
        .op-match-page .rule-pill strong {color:#ffe092;text-shadow:0 0 22px rgba(255,193,76,.70);}
        .op-match-page .finance-card {box-shadow:inset 0 1px rgba(255,255,255,.08),0 0 16px rgba(151,76,248,.13);}
        .op-match-page .finance-card strong {text-shadow:0 0 22px currentColor;}
        .op-match-page .save-button {box-shadow:0 13px 38px rgba(240,28,94,.4),0 0 25px rgba(237,42,144,.25);}
        /* Native select options are OS-painted and can become white. Use custom dark menu. */
        .op-match-page .op-sponsor-picker {position:relative;width:100%;z-index:50;}
        .op-match-page .op-sponsor-trigger {display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:52px;
          border:1px solid rgba(255,198,89,.75);border-radius:13px;padding:13px 15px;text-align:left;
          background:linear-gradient(120deg,#231422,#10111e);color:#fff4da;font-weight:750;cursor:pointer;
          box-shadow:0 0 19px rgba(255,188,75,.16);transition:box-shadow .2s,border-color .2s;}
        .op-match-page .op-sponsor-trigger:hover,.op-match-page .op-sponsor-trigger.is-open {border-color:#ffe099;
          box-shadow:0 0 0 3px rgba(255,193,82,.16),0 0 29px rgba(255,173,70,.33);}
        .op-match-page .op-sponsor-placeholder {color:#e6c4cd;font-weight:550;}
        .op-match-page .op-sponsor-chosen {color:#ffe7ac;text-shadow:0 0 11px rgba(255,203,112,.26);}
        .op-match-page .op-picker-chevron {font-size:18px;color:#ffd079;flex-shrink:0;}
        .op-match-page .op-sponsor-menu {position:absolute;z-index:500;top:calc(100% + 8px);left:0;right:0;min-width:260px;
          background:#120f1e!important;color:#fff!important;border:1px solid rgba(255,202,118,.73);
          border-radius:15px;padding:9px;box-shadow:0 22px 55px rgba(0,0,0,.85),0 0 30px rgba(255,166,65,.21);}
        .op-match-page .op-sponsor-search {display:block;width:100%;min-width:0;min-height:43px;margin-bottom:8px;
          border-radius:9px;border:1px solid rgba(208,155,255,.45);background:#21172d!important;color:white!important;padding:0 12px;outline:none;}
        .op-match-page .op-sponsor-search::placeholder {color:#cdb6db;}
        .op-match-page .op-sponsor-options {max-height:265px;overflow-y:auto;overscroll-behavior:contain;scrollbar-color:#ae4e90 #171121;}
        .op-match-page .op-sponsor-option {display:flex;flex-direction:column;gap:3px;width:100%;padding:11px 13px;
          border:0;border-radius:9px;background:#171323!important;color:#fff!important;text-align:left;cursor:pointer;margin:3px 0;}
        .op-match-page .op-sponsor-option:hover,.op-match-page .op-sponsor-option[aria-selected="true"] {
          background:#35213e!important;box-shadow:inset 3px 0 #ffbd65;}
        .op-match-page .op-sponsor-ign {font-size:13px;color:#fff;font-weight:850;}
        .op-match-page .op-sponsor-fullname {font-size:11px;color:#ebc7dc;}
        .op-match-page .op-sponsor-empty {padding:12px;color:#e7b1c9;font-size:12px;}
        @keyframes opGlowFlash {0%,100% {box-shadow:0 0 12px rgba(255,179,77,.22)}50% {box-shadow:0 0 30px rgba(255,166,65,.52),0 0 54px rgba(255,48,126,.18)}}
        @media (max-width:950px){.op-match-page .form-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media (max-width:650px){.op-match-page .form-grid{grid-template-columns:minmax(0,1fr);gap:15px}.op-match-page .op-sponsor-menu{min-width:0;}}

        /* Smart scheduler: clear click-to-select calendar and accessible time presets */
        .op-match-page .op-smart-date-field{grid-column:span 2;min-width:0;}
        .op-match-page .op-smart-scheduler{padding:16px;border:1px solid rgba(255,124,182,.52);border-radius:17px;background:linear-gradient(135deg,#1b1124,#10101b 68%);box-shadow:inset 0 1px rgba(255,255,255,.09),0 0 22px rgba(225,45,127,.11);}
        .op-match-page .op-date-controls{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:13px;align-items:end;}
        .op-match-page .op-date-picker-area,.op-match-page .op-time-picker-area{min-width:0;}
        .op-match-page .op-date-subheading{display:block;color:#f9bfdd;font-weight:850;font-size:10px;letter-spacing:1.3px;margin-bottom:8px;}
        .op-match-page .op-date-input-wrap{display:flex;gap:7px;align-items:center;}
        .op-match-page .op-date-input-wrap input[type="date"]{width:100%;min-width:0;min-height:48px;color:#fff!important;color-scheme:dark;background:#12111e;border-radius:11px;cursor:pointer;}
        .op-match-page .op-calendar-action{width:48px;min-width:48px;height:48px;border:1px solid rgba(255,143,191,.6);background:#30182c;border-radius:11px;color:#ffd1e7;cursor:pointer;font-size:20px;box-shadow:0 0 14px rgba(255,65,133,.17);}
        .op-match-page .op-calendar-action:hover{background:#52233e;box-shadow:0 0 20px rgba(255,65,133,.36);}
        .op-match-page .op-time-controls{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.05fr);gap:7px;}
        .op-match-page .op-time-controls select{min-width:0;width:100%;height:48px;min-height:48px;padding:0 8px;border-radius:11px;font-weight:800;color-scheme:dark;background:#12111e;border:1px solid rgba(218,165,240,.36);}
        .op-match-page .op-quick-dates,.op-match-page .op-quick-times{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;align-items:center;}
        .op-match-page .op-quick-label{font-size:10px;color:#cc9ab6;font-weight:750;letter-spacing:.5px;margin-right:2px;}
        .op-match-page .op-preset-chip{border-radius:999px;border:1px solid rgba(245,137,204,.35);background:#26172b;color:#ffdaeb;padding:8px 12px;cursor:pointer;font-size:11px;font-weight:800;transition:background .18s,border-color .18s,box-shadow .18s;}
        .op-match-page .op-preset-chip:hover,.op-match-page .op-preset-chip[aria-pressed="true"]{background:#542340;border-color:#ff82bc;box-shadow:0 0 14px rgba(248,79,149,.20);}
        .op-match-page .op-schedule-preview{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;padding:12px 14px;border-radius:12px;background:rgba(6,8,16,.65);border:1px solid rgba(232,145,213,.2);}
        .op-match-page .op-schedule-preview span{font-size:10px;letter-spacing:1px;font-weight:850;color:#ccacc8;}
        .op-match-page .op-schedule-preview strong{color:#fff0bd;text-shadow:0 0 13px rgba(255,195,101,.37);font-size:13px;}
        .op-match-page .op-date-help{margin-top:9px;color:#ab91ac;font-size:11px;}
        @media(max-width:950px){.op-match-page .op-smart-date-field{grid-column:1/-1;}}
        @media(max-width:650px){.op-match-page .op-date-controls{grid-template-columns:minmax(0,1fr);}.op-match-page .op-smart-scheduler{padding:13px;}.op-match-page .op-smart-date-field{grid-column:1/-1;}}

        @media (prefers-reduced-motion:reduce){.op-match-page .rule-pill{animation:none!important;}}
        @media(prefers-reduced-motion:reduce){.op-match-page .rule-pill,.op-match-page .ambient,.op-match-page .save-button::after{animation:none!important}
          .op-match-page .panel,.op-match-page .finance-card{transition:none!important}}


        /* V4 FULL-WIDTH REPAIR — scoped, with no financial JS changes */
        .op-match-page {--op-green:#39ffab;--op-blue:#57baff;--op-gold:#ffe176;--op-white:#f5faff;}
        .op-match-page .shell{max-width:1280px;width:min(100%,1280px);}
        .op-match-page .shell>form{width:100%!important;max-width:none!important;display:block!important;}
        .op-match-page .shell>form>.panel{width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;padding:clamp(20px,3vw,36px)!important;}
        .op-match-page .form-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:24px!important;row-gap:25px!important;align-items:start;}
        .op-match-page .form-grid>*{min-width:0;width:100%;}
        .op-match-page .op-smart-date-field{grid-column:1/-1!important;min-width:0;width:100%;}
        .op-match-page .field-wrap{min-width:0;width:100%;}
        .op-match-page .field-wrap :is(input,select){width:100%;min-width:0;}
        .op-match-page .topbar{border-color:rgba(89,194,255,.5);box-shadow:0 0 27px rgba(66,163,255,.18),0 22px 65px #0009,inset 0 1px rgba(255,255,255,.19);}
        .op-match-page .topbar h1{background:linear-gradient(90deg,#fff,#98ecff,#fff2a7,#b4ffdb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 14px #62bfff5a);}
        .op-match-page .section-title h2{color:var(--op-white)!important;text-shadow:0 0 13px #a5f8ff55,0 0 28px #49afff40;font-weight:950;}
        .op-match-page .field-wrap label,.op-match-page .section-title small{color:#ceeeff!important;text-shadow:0 0 10px #82e1ff80;letter-spacing:1.35px;}
        .op-match-page .panel,.op-match-page .history{border:1px solid rgba(103,195,255,.43)!important;background:linear-gradient(140deg,#12101e,#0a101a 64%,#12121c)!important;box-shadow:0 0 25px rgba(45,167,255,.12),0 18px 54px #0008,inset 0 1px rgba(255,255,255,.10)!important;overflow:visible;}
        .op-match-page .field-wrap :is(input,select),.op-match-page textarea{border:1px solid #5fa6d966!important;background:#0a1020!important;color:#f6fbff!important;min-height:50px;box-shadow:inset 0 0 12px #76bbff0c,0 0 11px #71bbff0e;}
        .op-match-page .field-wrap :is(input,select):focus{border-color:#64e5ff!important;box-shadow:0 0 0 3px #67dfff25,0 0 22px #46a4ff55!important;}
        .op-match-page .rule-pill{border:1px solid #ffdc73!important;background:linear-gradient(145deg,#261c1b,#101422)!important;animation:opV4MultiGlow 4.5s linear infinite!important;}
        .op-match-page .rule-pill strong{color:#ffe78f!important;text-shadow:0 0 12px #ffe27d,0 0 26px #ffd24a88!important;}
        .op-match-page .section-number{border-color:#75dbff!important;color:white!important;background:linear-gradient(130deg,#242046,#132d41)!important;box-shadow:0 0 18px #48c5ff55!important;}
        .op-match-page .save-button{animation:opV4Save 4.5s ease-in-out infinite!important;background:linear-gradient(110deg,#006dd8,#14b7a2,#7953f6,#eb368b)!important;background-size:250% 250%!important;}
        .op-match-page .finance-card{border-color:#76baff66!important;box-shadow:0 0 15px #66aaff26,inset 0 1px #ffffff1c!important;}
        .op-match-page .finance-card strong{filter:drop-shadow(0 0 12px currentColor);}
        .op-match-page .op-v4-scheduler{width:100%;max-width:none;padding:24px!important;border:1px solid #61d5ff88!important;border-radius:22px!important;background:linear-gradient(120deg,#111d2b,#131025 70%,#131b25)!important;box-shadow:0 0 30px #36aaff2a,inset 0 1px #ffffff22!important;}
        .op-match-page .op-v4-scheduler-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-bottom:17px;margin-bottom:20px;border-bottom:1px solid #79c4ff3d;}
        .op-match-page .op-v4-scheduler-head>span:first-child{color:#d7f9ff;font-weight:950;letter-spacing:1.4px;font-size:12px;text-shadow:0 0 12px #4ac5ff91;}
        .op-match-page .op-v4-scheduler-hint{color:#ffe68d;font-size:10px;font-weight:850;letter-spacing:1px;}
        .op-match-page .op-v4-live-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#41ffc0;box-shadow:0 0 12px #41ffab;margin-right:8px;animation:opV4Dot 1.7s ease-in-out infinite;}
        .op-match-page .op-v4-scheduler-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start;}
        .op-match-page .op-v4-date-column,.op-match-page .op-v4-time-column{position:relative;min-width:0;padding:20px;border:1px solid #67c0ff44;border-radius:16px;background:#0b1120a8;}
        .op-match-page .op-date-subheading{color:#bfe9ff!important;font-size:11px!important;margin-bottom:12px!important;text-shadow:0 0 12px #57adff55;}
        .op-match-page .op-v4-date-button{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:58px;text-align:left;padding:13px 17px;border-radius:13px;background:#0f1930;border:1px solid #75c7ff88;color:#fff;font-size:14px;font-weight:850;cursor:pointer;box-shadow:0 0 15px #40aaff1c;}
        .op-match-page .op-v4-date-button:hover,.op-match-page .op-v4-date-button[aria-expanded=true]{border-color:#67f9ff;box-shadow:0 0 20px #55cfff4a;}
        .op-match-page .op-v4-date-button span:last-child{color:#ffe184;font-size:24px;}
        .op-match-page .op-v4-clock-row{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) minmax(0,1.2fr);gap:10px;align-items:center;}
        .op-match-page .op-v4-clock-row select{width:100%;min-width:0;height:58px;padding:0 10px;border:1px solid #6cbbff88;border-radius:13px;background:#0f1930;color:#fff;font-size:17px;font-weight:900;cursor:pointer;color-scheme:dark;}
        .op-match-page .op-v4-colon{font-size:22px;font-weight:900;color:#ffe17b;text-shadow:0 0 15px #ffe17b66;}
        .op-match-page .op-v4-preset-group{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:16px;}
        .op-match-page .op-v4-preset-group>span{width:100%;color:#93aeca;font-size:10px;letter-spacing:1px;font-weight:850;}
        .op-match-page .op-v4-chip{padding:9px 13px;border-radius:9px;border:1px solid #6b9bd265;background:#142238;color:#eaf7ff;font-size:11px;font-weight:850;cursor:pointer;}
        .op-match-page .op-v4-chip:hover,.op-match-page .op-v4-chip[aria-pressed=true]{color:#09121f;background:#ffe68e;border-color:#ffe68e;box-shadow:0 0 18px #ffdb736b;}
        .op-match-page .op-v4-calendar{position:absolute;top:106px;left:20px;right:20px;z-index:180;background:#0d1527;color:#fff;border:1px solid #6dcfff;padding:15px;border-radius:15px;box-shadow:0 24px 54px #000e,0 0 30px #4eaaff66;}
        .op-match-page .op-v4-calendar-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;color:#fff3be;}
        .op-match-page .op-v4-calendar-top button{border:1px solid #77c8ff66;border-radius:9px;background:#162b42;color:#fff;font-size:23px;width:38px;height:35px;cursor:pointer;}
        .op-match-page .op-v4-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;text-align:center;}
        .op-match-page .op-v4-weekday{font-size:11px;font-weight:900;color:#81cfff;padding:8px 0;}
        .op-match-page .op-v4-calendar-cell button{width:100%;aspect-ratio:1/1;min-height:28px;background:transparent;border:0;border-radius:8px;color:#f4f8ff;font-weight:800;cursor:pointer;}
        .op-match-page .op-v4-calendar-cell button:hover{background:#295275;}
        .op-match-page .op-v4-calendar-cell button.today{box-shadow:inset 0 0 0 1px #5df3c4;color:#80ffd7;}
        .op-match-page .op-v4-calendar-cell button.chosen{background:#ffe47b;color:#131424;box-shadow:0 0 15px #ffe47b88;}
        .op-match-page .op-v4-preview{display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap;margin-top:19px;padding:17px 19px;background:#09182b;border:1px solid #52e6c466;border-radius:13px;box-shadow:0 0 14px #3dffc21b;}
        .op-match-page .op-v4-preview span{font-size:11px;font-weight:950;letter-spacing:1px;color:#8cfbd5;}
        .op-match-page .op-v4-preview strong{font-size:15px;color:#ffe998;text-shadow:0 0 15px #ffe99888;}
        .op-match-page .op-sponsor-trigger{border-color:#ffe68099!important;box-shadow:0 0 14px #ffe6802b!important;}
        @keyframes opV4MultiGlow{0%,100%{box-shadow:0 0 20px #4db6ff77,0 0 36px #4db6ff26;}25%{box-shadow:0 0 25px #45ffaa88,0 0 40px #45ffaa33;}50%{box-shadow:0 0 25px #ffe77b99,0 0 45px #ffe77b33;}75%{box-shadow:0 0 23px #fff9eb99,0 0 43px #fff9eb33;}}
        @keyframes opV4Dot{0%,100%{opacity:.55;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}}
        @keyframes opV4Save{0%,100%{background-position:0 50%;box-shadow:0 0 17px #4db6ff55}50%{background-position:100% 50%;box-shadow:0 0 27px #50ffa666}}
        @media(max-width:900px){.op-match-page .op-v4-scheduler-columns{grid-template-columns:1fr;}.op-match-page .form-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}}
        @media(max-width:640px){.op-match-page .form-grid,.op-match-page .team-grid,.op-match-page .money-inputs{grid-template-columns:1fr!important;}.op-match-page .op-smart-date-field{grid-column:1/-1!important;}.op-match-page .op-v4-scheduler{padding:14px!important;}.op-match-page .op-v4-date-column,.op-match-page .op-v4-time-column{padding:13px;}.op-match-page .op-v4-calendar{top:93px;left:7px;right:7px;}.op-match-page .op-v4-clock-row{gap:5px;}.op-match-page .op-v4-clock-row select{font-size:14px;padding:0 5px;}}
        @media(prefers-reduced-motion:reduce){.op-match-page .op-v4-live-dot,.op-match-page .rule-pill,.op-match-page .save-button{animation:none!important;}}
      `}</style>
    </main>
  );
}


// Premium Date & Time picker, using the same local YYYY-MM-DDTHH:mm value
// that the existing create_esports_match RPC expects.
function SmartMatchDateTime({ value, onChange }) {
  const today = new Date();
  const selectedDate = value?.split("T")[0] || "";
  const selectedTime = value?.split("T")[1]?.slice(0, 5) || "20:00";
  const hour24 = Number(selectedTime.slice(0, 2));
  const minute = selectedTime.slice(3, 5);
  const hour12 = String(hour24 % 12 || 12).padStart(2, "0");
  const period = hour24 >= 12 ? "PM" : "AM";
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const parts = selectedDate.split("-").map(Number);
    return parts.length === 3 && parts[0] ? new Date(parts[0], parts[1] - 1, 1) : new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const pad = (x) => String(x).padStart(2, "0");
  function iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function setDate(d) { onChange(`${d}T${selectedTime}`); setCalendarOpen(false); }
  function setTime24(t) { onChange(`${selectedDate || iso(new Date())}T${t}`); }
  function setClock(h, m, p) {
    const next = (Number(h) % 12) + (p === "PM" ? 12 : 0);
    setTime24(`${pad(next)}:${m}`);
  }
  function offsetDate(n) { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function shiftMonth(n) { setVisibleMonth(d => new Date(d.getFullYear(), d.getMonth() + n, 1)); }
  const calendarStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const offset = (calendarStart.getDay() + 6) % 7;
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const friendlyDate = selectedDate ? (() => {
    const [y,m,d] = selectedDate.split("-").map(Number);
    return new Date(y, m-1, d).toLocaleDateString("en-GB", {weekday:"short", day:"numeric", month:"short", year:"numeric"});
  })() : "Choose match date";
  return (
    <div className="op-smart-scheduler op-v4-scheduler">
      <div className="op-v4-scheduler-head">
        <span><span className="op-v4-live-dot" /> SMART MATCH SCHEDULER</span>
        <span className="op-v4-scheduler-hint">ONE-CLICK DATE & TIME</span>
      </div>
      <div className="op-v4-scheduler-columns">
        <div className="op-v4-date-column">
          <span className="op-date-subheading">📅 SELECT MATCH DATE</span>
          <button type="button" className="op-v4-date-button" aria-expanded={calendarOpen} aria-label="Choose match date" onClick={() => setCalendarOpen(v => !v)}>
            <span>{friendlyDate}</span><span>▦</span>
          </button>
          {calendarOpen && <div className="op-v4-calendar">
            <div className="op-v4-calendar-top">
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
              <strong>{visibleMonth.toLocaleDateString("en-US", {month:"long", year:"numeric"})}</strong>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
            </div>
            <div className="op-v4-calendar-grid">
              {["M","T","W","T","F","S","S"].map((d,i) => <span key={i} className="op-v4-weekday">{d}</span>)}
              {cells.map((day,i) => <div key={i} className="op-v4-calendar-cell">{day && <button type="button" className={`${selectedDate === iso(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)) ? "chosen" : ""} ${iso(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)) === iso(new Date()) ? "today" : ""}`} onClick={() => setDate(iso(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)))}>{day}</button>}</div>)}
            </div>
          </div>}
          <div className="op-v4-preset-group">
            <span>QUICK DATE</span>
            {[{label:"Today",n:0},{label:"Tomorrow",n:1},{label:"Day After",n:2}].map(x => <button type="button" key={x.n} className="op-v4-chip" aria-pressed={selectedDate===offsetDate(x.n)} onClick={() => setDate(offsetDate(x.n))}>{x.label}</button>)}
          </div>
        </div>
        <div className="op-v4-time-column">
          <span className="op-date-subheading">⏰ SELECT MATCH TIME</span>
          <div className="op-v4-clock-row">
            <select aria-label="Hour" value={hour12} onChange={e => setClock(e.target.value, minute, period)}>{Array.from({length:12},(_,i)=>pad(i+1)).map(h=><option value={h} key={h}>{h}</option>)}</select>
            <span className="op-v4-colon">:</span>
            <select aria-label="Minute" value={minute} onChange={e => setClock(hour12,e.target.value,period)}>{Array.from({length:60},(_,i)=>pad(i)).map(m=><option value={m} key={m}>{m}</option>)}</select>
            <select aria-label="AM PM" value={period} onChange={e => setClock(hour12,minute,e.target.value)}><option>AM</option><option>PM</option></select>
          </div>
          <div className="op-v4-preset-group">
            <span>QUICK TIME</span>
            {[{label:"6 PM",time:"18:00"},{label:"8 PM",time:"20:00"},{label:"10 PM",time:"22:00"},{label:"12 AM",time:"00:00"}].map(x=><button type="button" key={x.time} className="op-v4-chip" aria-pressed={selectedTime===x.time} onClick={()=>setTime24(x.time)}>{x.label}</button>)}
          </div>
        </div>
      </div>
      <div className="op-v4-preview"><span>✦ LIVE MATCH SCHEDULE</span><strong>{friendlyDate} · {hour12}:{minute} {period}</strong></div>
    </div>
  );
}

function SectionTitle({ number, small, title }) {
  return (
    <div className="section-title">
      <div className="section-number">{number}</div>
      <div>
        <small>{small}</small>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function FieldWrap({ label, children }) {
  return (
    <div className="field-wrap">
      <label>{label}</label>
      {children}
    </div>
  );
}

function FinanceCard({ label, value, type }) {
  return (
    <article className={`finance-card ${type}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

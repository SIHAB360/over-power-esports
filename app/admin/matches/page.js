"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";


const MANAGEMENT_PERCENTAGE = 30;
const PLAYER_PERCENTAGE = 70;
const REQUIRED_PLAYERS = 4;


export default function AdminMatchesPage() {

  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);

  const [selectedPlayers, setSelectedPlayers] = useState([]);

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


      if (profileError) {
        throw profileError;
      }


      const role = profile?.role?.toLowerCase();


      if (role !== "admin" && role !== "moderator") {
        router.replace("/");
        return;
      }


      await Promise.all([
        loadTeams(),
        loadTournaments(),
        loadRecentMatches(),
      ]);


    } catch (error) {

      console.error(error);

      setMessage(
        error.message || "Unable to load Match Management."
      );

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


    if (error) {
      throw error;
    }


    setTeams(data || []);

  }


  async function loadTournaments() {

    const { data, error } = await supabase
      .from("tournaments")
      .select(
        "id, name, status, start_date, end_date"
      )
      .order("created_at", { ascending: false });


    if (error) {
      throw error;
    }


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

      /*
        match_results relationship unavailable হলেও
        main page যেন বন্ধ না হয়।
      */

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


      if (fallback.error) {
        throw fallback.error;
      }


      setRecentMatches(fallback.data || []);

      return;
    }


    setRecentMatches(data || []);

  }


  async function loadTeamPlayers(teamId) {

    setSelectedPlayers([]);
    setTeamPlayers([]);


    if (!teamId) {
      return;
    }


    const { data, error } = await supabase
      .from("players")
      .select(`
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
      `)
      .eq("team_id", teamId)
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


  function togglePlayer(playerId) {

    setMessage("");
    setMessageType("");


    setSelectedPlayers((current) => {

      if (current.includes(playerId)) {

        return current.filter(
          (id) => id !== playerId
        );

      }


      if (current.length >= REQUIRED_PLAYERS) {

        setMessage(
          "Exactly 4 players can play this match."
        );

        setMessageType("error");

        return current;

      }


      return [...current, playerId];

    });

  }


  const entryFee =
    Number(form.entry_fee) || 0;

  const prizeMoney =
    Number(form.prize_money) || 0;

  const netProfit =
    prizeMoney - entryFee;


  /*
    Loss হলে negative profit database-এ থাকবে।
    কিন্তু negative earning player-দের দেওয়া হবে না।
  */

  const distributableProfit =
    netProfit > 0 ? netProfit : 0;


  const managementAmount =
    distributableProfit *
    (MANAGEMENT_PERCENTAGE / 100);


  const playerPool =
    distributableProfit *
    (PLAYER_PERCENTAGE / 100);


  const perPlayerAmount =
    selectedPlayers.length === REQUIRED_PLAYERS
      ? playerPool / REQUIRED_PLAYERS
      : 0;


  function money(value) {

    return Number(value || 0).toLocaleString(
      "en-BD",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );

  }


  function teamName(teamId) {

    if (!teamId) {
      return "—";
    }


    return (
      teams.find(
        (team) => team.id === teamId
      )?.team_name || "Unknown Team"
    );

  }


  function tournamentName(tournamentId) {

    if (!tournamentId) {
      return "Independent Match";
    }


    return (
      tournaments.find(
        (item) => item.id === tournamentId
      )?.name || "Tournament"
    );

  }


  async function rollbackMatch(matchId) {

    if (!matchId) return;


    try {

      await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);

    } catch (error) {

      console.error(
        "Rollback failed:",
        error
      );

    }

  }


  async function handleSaveMatch(e) {

    e.preventDefault();

    setMessage("");
    setMessageType("");


    if (!form.team1_id) {

      setMessage("Select your team.");

      setMessageType("error");

      return;

    }


    if (
      form.team2_id &&
      form.team2_id === form.team1_id
    ) {

      setMessage(
        "Team 1 and Team 2 cannot be the same."
      );

      setMessageType("error");

      return;

    }


    if (!form.match_date) {

      setMessage(
        "Select match date and time."
      );

      setMessageType("error");

      return;

    }


    if (
      selectedPlayers.length !==
      REQUIRED_PLAYERS
    ) {

      setMessage(
        "You must select exactly 4 active players."
      );

      setMessageType("error");

      return;

    }


    setSaving(true);

    let createdMatchId = null;


    try {

      /*
        STEP 1
        CREATE MATCH
      */

     const matchPayload = {

 tournament_id: form.tournament_id || null,

 team1_id: form.team1_id,

 team2_id: form.team2_id || null,

 team1_score: Number(form.team1_score) || 0,

 team2_score: Number(form.team2_score) || 0,

 winner_id: form.winner_id || null,

 match_date: form.match_date,

 status: form.status,

 match_type: form.match_type,

 entry_fee: entryFee,

 prize_money: prizeMoney,

 profit: netProfit,

 platform: form.platform,

 map: form.map || null,

 sponsor: form.sponsor || null,

 notice: form.notice || null

};


      const {
        data: match,
        error: matchError,
      } = await supabase
        .from("matches")
        .insert([matchPayload])
        .select()
        .single();


      if (matchError) {
        throw matchError;
      }


      createdMatchId = match.id;


      /*
        STEP 2
        SAVE EXACT 4 ACTIVE PLAYERS
      */

      const matchPlayerRows =
        selectedPlayers.map(
          (playerId, index) => ({
            match_id: match.id,
            player_id: playerId,
            team_id: form.team1_id,
            slot_number: index + 1,
          })
        );


      const { error: playersError } =
        await supabase
          .from("match_players")
          .insert(matchPlayerRows);


      if (playersError) {
        throw playersError;
      }


      /*
        STEP 3
        SAVE MATCH FINANCE

        Profit = Prize - Entry

        Positive Profit:
        Management = 30%
        Players = 70%
      */

      const { error: financeError } =
        await supabase
          .from("match_finance")
          .insert([
            {
              match_id: match.id,

              team_id:
                form.team1_id,

              entry_fee:
                entryFee,

              prize_money:
                prizeMoney,

              profit:
                netProfit,

              management_percentage:
                MANAGEMENT_PERCENTAGE,

              management_amount:
                managementAmount,

              player_amount:
                playerPool,
            },
          ]);


      if (financeError) {
        throw financeError;
      }


      /*
        STEP 4
        COMPLETED MATCH RESULT
      */

      if (form.status === "completed") {

  if (
    form.position ||
    form.points ||
    form.kills ||
    form.prize_money
  ) {


    const { error: resultError } =
      await supabase
      .from("match_results")
      .insert([
        {

          match_id:
            match.id,


          team_id:
            form.team1_id,


          position:
            form.position
            ? Number(form.position)
            : null,


          kills:
            form.kills
            ? Number(form.kills)
            : 0,


          points:
            form.points
            ? Number(form.points)
            : 0,


          prize_money:
            form.prize_money
            ? Number(form.prize_money)
            : 0,


          status:
            form.result_status || "completed"

        },
      ]);


    if(resultError){

      throw resultError;

    }

  }

}


        /*
          STEP 5
          PLAYER EARNINGS

          ONLY THE 4 PLAYERS
          IN match_players GET PAID.
        */

        if (playerPool > 0) {

          const playerEarningRows =
            selectedPlayers.map(
              (playerId) => ({
                player_id:
                  playerId,

                match_id:
                  match.id,

                team_id:
                  form.team1_id,

                amount:
                  perPlayerAmount,
              })
            );


          const {
            error:
              playerEarningsError,
          } = await supabase
            .from("player_earnings")
            .insert(
              playerEarningRows
            );


          if (playerEarningsError) {
            throw playerEarningsError;
          }


          /*
            MANAGEMENT / TEAM SHARE
          */

          const {
            error:
              teamEarningsError,
          } = await supabase
            .from("team_earnings")
            .insert([
              {
                team_id:
                  form.team1_id,

                match_id:
                  match.id,

                amount:
                  managementAmount,
              },
            ]);


          if (teamEarningsError) {
            throw teamEarningsError;
          }
        }

      setMessage(
        form.status === "completed"
          ? `Match saved. Each active player receives ${money(perPlayerAmount)}`
          : "Match created successfully."
      );

      setMessageType("success");
        


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


      await loadRecentMatches();


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });


    } catch (error) {

      console.error(error);


      /*
        কোনো child insert fail করলে
        partially-created match রেখে দেব না।
      */

      if (createdMatchId) {

        await rollbackMatch(
          createdMatchId
        );

      }


      setMessage(
        error.message ||
          "Unable to save match."
      );

      setMessageType("error");


    } finally {

      setSaving(false);

    }

  }


  if (pageLoading) {

    return (

      <main className="op-loading">

        <div className="loader"></div>

        <span>
          LOADING MATCH COMMAND CENTER
        </span>


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

            font-family:
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;

          }


          .loader {

            width: 52px;

            height: 52px;

            border-radius: 50%;

            border:
              3px solid
              rgba(
                255,
                255,
                255,
                0.08
              );

            border-top-color:
              #ff2457;

            animation:
              spin 0.8s linear
              infinite;

          }


          span {

            color: #747481;

            font-size: 11px;

            letter-spacing: 2px;

            font-weight: 800;

          }


          @keyframes spin {

            to {
              transform:
                rotate(360deg);
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


      <div className="shell">


        {/* HEADER */}

        <header className="topbar">


          <div>

            <span className="eyebrow">
              OVER POWER ESPORTS
            </span>

            <h1>
              MATCH COMMAND CENTER
            </h1>

            <p>
              Record matches, active
              players, results and
              earnings.
            </p>

          </div>


          <div className="rule-pill">

            <span>
              PROFIT RULE
            </span>

            <strong>
              30 / 70
            </strong>

          </div>


        </header>



        {message && (

          <div
            className={
              messageType ===
              "success"
                ? "message success"
                : "message error"
            }
          >

            {message}

          </div>

        )}



        <form
          onSubmit={
            handleSaveMatch
          }
        >


          {/* STEP 01 */}

          <section className="panel">


            <SectionTitle
              number="01"
              small="MATCH SETUP"
              title="MATCH INFORMATION"
            />


            <div className="form-grid">


              <FieldWrap
                label="Tournament Creator"
              >

                <select
                  name="tournament_id"
                  value={
                    form.tournament_id
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                   Manager/
                    Modrator
                  </option>

                  {tournaments.map(
                    (item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>

                    )
                  )}

                </select>

              </FieldWrap>



              <FieldWrap
                label="Match Type"
              >

                <select
                  name="match_type"
                  value={
                    form.match_type
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="Scrim">
                    Scrim / 
                  </option>

                  <option value="CR">
                    Champion Rush
                  </option>


                  <option value="Offical">
                    Offical Tournament
                  </option>

                  <option value="Custom">
                    Custom Tournamnet
                  </option>

                </select>

              </FieldWrap>



              <FieldWrap
                label="Date & Time"
              >

                <input
                  type="datetime-local"
                  name="match_date"
                  value={
                    form.match_date
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </FieldWrap>



              <FieldWrap
                label="Status"
              >

                <select
                  name="status"
                  value={form.status}
                  onChange={
                    handleChange
                  }
                >

                  <option value="completed">
                    Completed
                  </option>

                  <option value="upcoming">
                    Upcoming
                  </option>

                  <option value="live">
                    Live
                  </option>

                </select>

              </FieldWrap>



              <FieldWrap
                label="Platform"
              >

                <input
                  name="platform"
                  value={
                    form.platform
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Free Fire"
                />

              </FieldWrap>



              <FieldWrap
                label="Map"
              >

                <input
                  name="map"
                  value={form.map}
                  onChange={
                    handleChange
                  }
                  placeholder="Optional"
                />

              </FieldWrap>



              <FieldWrap
                label="Sponsor / Organizer"
              >

                <input
                  name="sponsor"
                  value={
                    form.sponsor
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional"
                />

              </FieldWrap>


            </div>


          </section>



          {/* STEP 02 */}

          <section className="panel">


            <SectionTitle
              number="02"
              small="TEAM"
              title="SELECT TEAM"
            />


            <div className="team-grid">


              <FieldWrap
                label="Your Team"
              >

                <select
                  name="team1_id"
                  value={
                    form.team1_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select Team
                  </option>

                  {teams.map(
                    (team) => (

                      <option
                        key={team.id}
                        value={team.id}
                      >
                        {
                          team.team_name
                        }
                      </option>

                    )
                  )}

                </select>

              </FieldWrap>



              <FieldWrap
                label="Opponent Team (Optional)"
              >

                <select
                  name="team2_id"
                  value={
                    form.team2_id
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    No Opponent
                  </option>

                  {teams
                    .filter(
                      (team) =>
                        team.id !==
                        form.team1_id
                    )
                    .map(
                      (team) => (

                        <option
                          key={
                            team.id
                          }
                          value={
                            team.id
                          }
                        >
                          {
                            team.team_name
                          }
                        </option>

                      )
                    )}

                </select>

              </FieldWrap>


            </div>


          </section>



          {/* STEP 03 */}

          <section className="panel">


            <SectionTitle
              number="03"
              small="ACTIVE LINEUP"
              title="SELECT EXACTLY 4 PLAYERS"
            />


            <div className="selection-counter">

              <span>
                SELECTED
              </span>

              <strong>
                {
                  selectedPlayers.length
                } / 4
              </strong>

            </div>


            {!form.team1_id ? (

              <div className="empty-state">

                Select your team
                first.

              </div>

            ) : teamPlayers.length ===
              0 ? (

              <div className="empty-state">

                No players are
                connected to this
                team.

              </div>

            ) : (

              <div className="player-grid">

                {teamPlayers.map(
                  (player) => {

                    const selected =
                      selectedPlayers.includes(
                        player.id
                      );


                    return (

                      <button
                        type="button"
                        key={
                          player.id
                        }
                        className={
                          selected
                            ? "player-card selected"
                            : "player-card"
                        }
                        onClick={() =>
                          togglePlayer(
                            player.id
                          )
                        }
                      >


                        <div className="avatar">

                          {player.profile_image ||
                          player.avatar_url ? (

                            <img
                              src={
                                player.profile_image ||
                                player.avatar_url
                              }
                              alt={
                                player.ign ||
                                player.full_name
                              }
                            />

                          ) : (

                            <span>

                              {(
                                player.ign ||
                                player.full_name ||
                                "P"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </span>

                          )}

                        </div>


                        <div className="player-copy">

                          <strong>
                            {
                              player.ign ||
                              player.full_name
                            }
                          </strong>

                          <span>
                            {
                              player.full_name
                            }
                          </span>

                          <small>
                            {
                              player.primary_role ||
                              "PLAYER"
                            }
                          </small>

                        </div>


                        <div className="check">

                          {selected
                            ? "✓"
                            : "+"}

                        </div>


                      </button>

                    );

                  }
                )}

              </div>

            )}


          </section>



          {/* STEP 04 */}

          <section className="panel">


            <SectionTitle
              number="04"
              small="RESULT"
              title="MATCH RESULT"
            />


            <div className="form-grid">


              <FieldWrap
                label="Position"
              >

                <input
                  type="number"
                  min="1"
                  name="position"
                  value={
                    form.position
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: 1"
                />

              </FieldWrap>



              <FieldWrap
                label="Points"
              >

                <input
                  type="number"
                  min="0"
                  name="points"
                  value={
                    form.points
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                />

              </FieldWrap>



              <FieldWrap
                label="Team 1 Score"
              >

                <input
                  type="number"
                  min="0"
                  name="team1_score"
                  value={
                    form.team1_score
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                />

              </FieldWrap>



              <FieldWrap
                label="Team 2 Score"
              >

                <input
                  type="number"
                  min="0"
                  name="team2_score"
                  value={
                    form.team2_score
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                />

              </FieldWrap>



              <FieldWrap
                label="Winner"
              >

                <select
                  name="winner_id"
                  value={
                    form.winner_id
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    No Winner /
                    Placement Match
                  </option>

                  {form.team1_id && (

                    <option
                      value={
                        form.team1_id
                      }
                    >
                      {
                        teamName(
                          form.team1_id
                        )
                      }
                    </option>

                  )}

                  {form.team2_id && (

                    <option
                      value={
                        form.team2_id
                      }
                    >
                      {
                        teamName(
                          form.team2_id
                        )
                      }
                    </option>

                  )}

                </select>

              </FieldWrap>


            </div>


          </section>



          {/* STEP 05 */}

          <section className="panel finance-panel">


            <SectionTitle
              number="05"
              small="FINANCE ENGINE"
              title="PROFIT & PLAYER EARNINGS"
            />


            <div className="money-inputs">


              <FieldWrap
                label="Entry Fee"
              >

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="entry_fee"
                  value={
                    form.entry_fee
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                />

              </FieldWrap>



              <FieldWrap
                label="Prize Money"
              >

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="prize_money"
                  value={
                    form.prize_money
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                />

              </FieldWrap>


            </div>



            <div className="finance-grid">


              <FinanceCard
                label="NET PROFIT"
                value={`৳${money(
                  netProfit
                )}`}
                type={
                  netProfit >= 0
                    ? "green"
                    : "red"
                }
              />


              <FinanceCard
                label="MANAGEMENT 30%"
                value={`৳${money(
                  managementAmount
                )}`}
                type="red"
              />


              <FinanceCard
                label="PLAYERS 70%"
                value={`৳${money(
                  playerPool
                )}`}
                type="purple"
              />


              <FinanceCard
                label="EACH PLAYER"
                value={`৳${money(
                  perPlayerAmount
                )}`}
                type="green"
              />


            </div>



            <div className="rule-box">


              <div>

                <span>
                  ACTIVE PLAYERS
                </span>

                <strong>
                  {
                    selectedPlayers.length
                  } / 4
                </strong>

              </div>


              <p>

                Only the 4 players
                selected for this
                match receive the
                player share.

                Players who did not
                participate receive
                no earning record
                for this match.

              </p>


            </div>


          </section>



          {/* STEP 06 */}

          <section className="panel">


            <SectionTitle
              number="06"
              small="NOTES"
              title="MATCH NOTICE"
            />


            <textarea
              name="notice"
              value={
                form.notice
              }
              onChange={
                handleChange
              }
              placeholder="Optional notes about this match..."
            />


          </section>



          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >

            <span>

              {saving
                ? "PROCESSING MATCH..."
                : "SAVE MATCH & CALCULATE"}

            </span>

            <strong>
              →
            </strong>

          </button>


        </form>



        {/* RECENT MATCHES */}

        <section className="history">


          <SectionTitle
            number="07"
            small="HISTORY"
            title="RECENT MATCHES"
          />


          {recentMatches.length ===
          0 ? (

            <div className="empty-state">

              No match history yet.

            </div>

          ) : (

            <div className="history-list">

              {recentMatches.map(
                (match) => (

                  <article
                    key={
                      match.id
                    }
                    className="history-card"
                  >


                    <div className="history-main">

                      <span>

                        {
                          tournamentName(
                            match.tournament_id
                          )
                        }

                      </span>

                      <strong>

                        {
                          teamName(
                            match.team1_id
                          )
                        }

                      </strong>

                      <small>

                        {
                          match.match_type ||
                          "Match"
                        }

                      </small>

                    </div>


                    <div className="history-money">

                      <span>
                        PROFIT
                      </span>

                      <strong>

                        ৳
                        {money(
                          match.profit
                        )}

                      </strong>

                    </div>


                    <div className="history-status">

                      {
                        match.status
                      }

                    </div>


                  </article>

                )
              )}

            </div>

          )}


        </section>


      </div>



      <style jsx global>{`


        .op-match-page,
        .op-match-page * {

          box-sizing:
            border-box;

          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

        }


        body {

          margin: 0;

          background:
            #050507;

        }


        .op-match-page {

          position: relative;

          min-height: 100vh;

          overflow: hidden;

          padding:
            30px 18px 80px;

          background:

            radial-gradient(
              circle at 8% 0%,
              rgba(
                255,
                20,
                75,
                0.13
              ),
              transparent 28%
            ),

            radial-gradient(
              circle at 95% 20%,
              rgba(
                116,
                40,
                255,
                0.13
              ),
              transparent 30%
            ),

            #050507;

          color: white;

        }


        .ambient {

          position: fixed;

          border-radius: 50%;

          filter:
            blur(150px);

          pointer-events: none;

          opacity: 0.22;

        }


        .ambient-one {

          width: 400px;

          height: 400px;

          background:
            #ff174d;

          top: -200px;

          left: -160px;

        }


        .ambient-two {

          width: 450px;

          height: 450px;

          background:
            #6524ff;

          right: -220px;

          top: 280px;

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

          justify-content:
            space-between;

          align-items:
            center;

          gap: 30px;

          padding:
            34px;

          margin-bottom:
            20px;

          border-radius:
            26px;

          background:

            linear-gradient(
              145deg,
              rgba(
                28,
                10,
                17,
                0.94
              ),
              rgba(
                8,
                8,
                13,
                0.96
              )
            );

          border:

            1px solid
            rgba(
              255,
              38,
              83,
              0.22
            );

          box-shadow:

            0 30px 80px
            rgba(
              0,
              0,
              0,
              0.4
            );

        }


        .eyebrow {

          color: #ff4167;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            2.7px;

        }


        .topbar h1 {

          margin:
            7px 0 8px;

          font-size:
            clamp(
              26px,
              4vw,
              46px
            );

          line-height: 1;

        }


        .topbar p {

          margin: 0;

          color: #777784;

          font-size: 13px;

        }


        .rule-pill {

          min-width:
            150px;

          padding:
            17px 20px;

          border-radius:
            17px;

          background:
            rgba(
              255,
              23,
              77,
              0.07
            );

          border:

            1px solid
            rgba(
              255,
              23,
              77,
              0.18
            );

          text-align:
            center;

        }


        .rule-pill span {

          display: block;

          color: #777784;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.5px;

        }


        .rule-pill strong {

          display: block;

          margin-top:
            5px;

          color: #ff4368;

          font-size: 23px;

        }


        .message {

          padding:
            15px 18px;

          margin-bottom:
            16px;

          border-radius:
            13px;

          font-size: 13px;

          font-weight: 700;

        }


        .message.success {

          color:
            #64ffb6;

          background:
            rgba(
              25,
              255,
              155,
              0.07
            );

          border:

            1px solid
            rgba(
              25,
              255,
              155,
              0.2
            );

        }


        .message.error {

          color:
            #ff718d;

          background:
            rgba(
              255,
              25,
              75,
              0.07
            );

          border:

            1px solid
            rgba(
              255,
              25,
              75,
              0.2
            );

        }


        .panel,
        .history {

          position: relative;

          margin-bottom:
            18px;

          padding:
            28px;

          border-radius:
            22px;

          background:

            linear-gradient(
              145deg,
              rgba(
                18,
                18,
                24,
                0.95
              ),
              rgba(
                8,
                8,
                12,
                0.97
              )
            );

          border:

            1px solid
            rgba(
              255,
              255,
              255,
              0.075
            );

          box-shadow:

            0 22px 60px
            rgba(
              0,
              0,
              0,
              0.25
            );

        }


        .section-title {

          display: flex;

          align-items:
            center;

          gap: 14px;

          margin-bottom:
            24px;

          padding-bottom:
            20px;

          border-bottom:

            1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );

        }


        .section-number {

          width: 45px;

          height: 45px;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          flex-shrink: 0;

          border-radius:
            13px;

          color:
            #ff4167;

          background:
            rgba(
              255,
              23,
              77,
              0.08
            );

          border:

            1px solid
            rgba(
              255,
              23,
              77,
              0.2
            );

          font-size: 11px;

          font-weight: 900;

        }


        .section-title small {

          display: block;

          margin-bottom:
            3px;

          color: #626270;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            2px;

        }


        .section-title h2 {

          margin: 0;

          font-size: 18px;

          letter-spacing:
            0.4px;

        }


        .form-grid {

          display: grid;

          grid-template-columns:
            repeat(
              3,
              1fr
            );

          gap: 15px;

        }


        .team-grid,
        .money-inputs {

          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 15px;

        }


        .field-wrap label {

          display: block;

          margin-bottom:
            8px;

          color: #8a8a96;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            1.2px;

          text-transform:
            uppercase;

        }


        .field-wrap input,
        .field-wrap select,
        textarea {

          width: 100%;

          min-height:
            52px;

          border-radius:
            13px;

          border:

            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );

          background:
            rgba(
              0,
              0,
              0,
              0.28
            );

          color: white;

          outline: none;

          padding:
            0 15px;

          font-size: 13px;

          transition:
            0.2s ease;

          color-scheme:
            dark;

        }


        textarea {

          min-height:
            120px;

          padding: 15px;

          resize: vertical;

        }


        .field-wrap input:focus,
        .field-wrap select:focus,
        textarea:focus {

          border-color:
            rgba(
              255,
              35,
              80,
              0.55
            );

          box-shadow:

            0 0 0 3px
            rgba(
              255,
              23,
              77,
              0.08
            );

        }


        .selection-counter {

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          margin-bottom:
            15px;

          padding:
            12px 15px;

          border-radius:
            12px;

          background:
            rgba(
              255,
              23,
              77,
              0.04
            );

          border:

            1px solid
            rgba(
              255,
              23,
              77,
              0.1
            );

        }


        .selection-counter span {

          color:
            #73737f;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.6px;

        }


        .selection-counter strong {

          color:
            #ff4167;

          font-size: 17px;

        }


        .player-grid {

          display: grid;

          grid-template-columns:
            repeat(
              2,
              1fr
            );

          gap: 12px;

        }


        .player-card {

          width: 100%;

          display: grid;

          grid-template-columns:
            auto 1fr auto;

          align-items:
            center;

          gap: 13px;

          padding:
            14px;

          text-align: left;

          color: white;

          cursor: pointer;

          border-radius:
            15px;

          border:

            1px solid
            rgba(
              255,
              255,
              255,
              0.075
            );

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          transition:
            0.22s ease;

        }


        .player-card:hover {

          border-color:
            rgba(
              255,
              23,
              77,
              0.28
            );

          transform:
            translateY(-2px);

        }


        .player-card.selected {

          background:
            rgba(
              255,
              23,
              77,
              0.075
            );

          border-color:
            rgba(
              255,
              23,
              77,
              0.45
            );

          box-shadow:

            0 0 25px
            rgba(
              255,
              23,
              77,
              0.08
            );

        }


        .avatar {

          width: 52px;

          height: 52px;

          border-radius:
            14px;

          overflow: hidden;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          background:

            linear-gradient(
              135deg,
              #ff174d,
              #702dff
            );

          font-weight: 900;

        }


        .avatar img {

          width: 100%;

          height: 100%;

          object-fit:
            cover;

        }


        .player-copy strong {

          display: block;

          font-size: 13px;

        }


        .player-copy span {

          display: block;

          margin-top:
            3px;

          color: #777784;

          font-size: 10px;

        }


        .player-copy small {

          display: inline-block;

          margin-top:
            5px;

          color: #ff6483;

          font-size: 8px;

          font-weight: 800;

        }


        .check {

          width: 31px;

          height: 31px;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            9px;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          font-size: 15px;

          font-weight: 900;

        }


        .selected .check {

          background:
            #ff174d;

          box-shadow:

            0 0 15px
            rgba(
              255,
              23,
              77,
              0.3
            );

        }


        .finance-panel {

          border-color:
            rgba(
              112,
              43,
              255,
              0.18
            );

        }


        .finance-grid {

          display: grid;

          grid-template-columns:
            repeat(
              4,
              1fr
            );

          gap: 12px;

          margin-top:
            18px;

        }


        .finance-card {

          min-height:
            120px;

          padding:
            18px;

          display: flex;

          flex-direction:
            column;

          justify-content:
            space-between;

          border-radius:
            17px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:

            1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );

        }


        .finance-card span {

          color: #777784;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.5px;

        }


        .finance-card strong {

          font-size:
            clamp(
              20px,
              3vw,
              30px
            );

        }


        .finance-card.green strong {

          color:
            #22f29d;

        }


        .finance-card.red strong {

          color:
            #ff456a;

        }


        .finance-card.purple strong {

          color:
            #a77aff;

        }


        .rule-box {

          display: grid;

          grid-template-columns:
            auto 1fr;

          align-items:
            center;

          gap: 20px;

          margin-top:
            14px;

          padding:
            16px;

          border-radius:
            15px;

          background:
            rgba(
              0,
              0,
              0,
              0.23
            );

        }


        .rule-box div {

          min-width:
            110px;

          padding:
            12px;

          text-align:
            center;

          border-radius:
            12px;

          background:
            rgba(
              255,
              23,
              77,
              0.07
            );

        }


        .rule-box span {

          display: block;

          color: #777784;

          font-size: 7px;

          font-weight: 900;

        }


        .rule-box strong {

          display: block;

          margin-top:
            5px;

          color:
            #ff456a;

          font-size: 19px;

        }


        .rule-box p {

          margin: 0;

          color: #898995;

          font-size: 11px;

          line-height: 1.65;

        }


        .save-button {

          width: 100%;

          min-height:
            64px;

          margin:
            3px 0 28px;

          padding:
            0 22px;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          color: white;

          cursor: pointer;

          border-radius:
            17px;

          border:

            1px solid
            rgba(
              255,
              255,
              255,
              0.18
            );

          background:

            linear-gradient(
              105deg,
              #c90038,
              #ff174d,
              #6f2bff
            );

          box-shadow:

            0 16px 45px
            rgba(
              255,
              0,
              70,
              0.18
            );

          font-size: 12px;

          font-weight: 900;

          letter-spacing:
            1.5px;

          transition:
            0.25s ease;

        }


        .save-button:hover {

          transform:
            translateY(-2px);

          box-shadow:

            0 20px 55px
            rgba(
              255,
              0,
              70,
              0.27
            );

        }


        .save-button:disabled {

          opacity: 0.5;

          cursor:
            not-allowed;

          transform: none;

        }


        .save-button strong {

          font-size: 24px;

        }


        .empty-state {

          padding:
            28px;

          border-radius:
            14px;

          color: #70707c;

          text-align:
            center;

          background:
            rgba(
              255,
              255,
              255,
              0.02
            );

          border:

            1px dashed
            rgba(
              255,
              255,
              255,
              0.08
            );

          font-size: 12px;

        }


        .history {

          margin-bottom: 0;

        }


        .history-list {

          display: flex;

          flex-direction:
            column;

          gap: 9px;

        }


        .history-card {

          display: grid;

          grid-template-columns:
            1fr auto auto;

          align-items:
            center;

          gap: 20px;

          padding:
            16px;

          border-radius:
            14px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:

            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );

        }


        .history-main span {

          display: block;

          color:
            #ff5878;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.2px;

        }


        .history-main strong {

          display: block;

          margin-top:
            4px;

          font-size: 13px;

        }


        .history-main small {

          display: block;

          margin-top:
            3px;

          color: #696976;

        }


        .history-money {

          text-align:
            right;

        }


        .history-money span {

          display: block;

          color: #676774;

          font-size: 7px;

          font-weight: 900;

        }


        .history-money strong {

          display: block;

          margin-top:
            3px;

          color:
            #25efa0;

          font-size: 16px;

        }


        .history-status {

          padding:
            8px 11px;

          border-radius:
            999px;

          color:
            #c9c9d0;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          font-size: 8px;

          font-weight: 800;

          text-transform:
            uppercase;

        }


        @media (
          max-width: 900px
        ) {

          .form-grid {

            grid-template-columns:
              repeat(
                2,
                1fr
              );

          }


          .finance-grid {

            grid-template-columns:
              1fr 1fr;

          }

        }


        @media (
          max-width: 650px
        ) {

          .op-match-page {

            padding:
              12px 10px
              45px;

          }


          .topbar {

            align-items:
              flex-start;

            padding:
              24px 18px;

            border-radius:
              20px;

          }


          .rule-pill {

            min-width:
              110px;

          }


          .panel,
          .history {

            padding:
              20px 14px;

            border-radius:
              18px;

          }


          .form-grid,
          .team-grid,
          .money-inputs {

            grid-template-columns:
              1fr;

          }


          .player-grid {

            grid-template-columns:
              1fr;

          }


          .finance-grid {

            grid-template-columns:
              1fr 1fr;

            gap: 8px;

          }


          .finance-card {

            min-height:
              105px;

            padding:
              14px;

          }


          .rule-box {

            grid-template-columns:
              1fr;

          }


          .history-card {

            grid-template-columns:
              1fr auto;

          }


          .history-status {

            grid-column:
              1 / -1;

            width:
              fit-content;

          }

        }


        @media (
          max-width: 420px
        ) {

          .topbar {

            display: block;

          }


          .rule-pill {

            margin-top:
              18px;

            width:
              fit-content;

          }


          .finance-grid {

            grid-template-columns:
              1fr;

          }

        }


      `}</style>


    </main>

  );

}



function SectionTitle({
  number,
  small,
  title,
}) {

  return (

    <div className="section-title">

      <div className="section-number">

        {number}

      </div>


      <div>

        <small>
          {small}
        </small>

        <h2>
          {title}
        </h2>

      </div>

    </div>

  );

}



function FieldWrap({
  label,
  children,
}) {

  return (

    <div className="field-wrap">

      <label>
        {label}
      </label>

      {children}

    </div>

  );

}



function FinanceCard({
  label,
  value,
  type,
}) {

  return (

    <article
      className={`finance-card ${type}`}
    >

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </article>

  );

}

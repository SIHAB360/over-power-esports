"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const inputStyle = {
  flex: "1 1 180px",
  minWidth: "170px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(7,7,12,0.9)",
  color: "#f8fafc",
  outline: "none",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

function money(value) {
  const amount = Number(value || 0);

  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SummaryCard({ title, value, color, background }) {
  return (
    <div
      style={{
        padding: "22px",
        borderRadius: "18px",
        border: `1px solid ${color}55`,
        background,
        boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
      }}
    >
      <div
        style={{
          color,
          fontSize: "13px",
          fontWeight: 700,
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color,
          fontSize: "30px",
          fontWeight: 800,
        }}
      >
        {money(value)}
      </div>
    </div>
  );
}

export default function ProfitPage() {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMatchType, setSelectedMatchType] = useState("");
  const [selectedProfitStatus, setSelectedProfitStatus] = useState("");

  const [playerStatsMap, setPlayerStatsMap] = useState({});
  const [openPerformance, setOpenPerformance] = useState(null);
  const [loadingStats, setLoadingStats] = useState(null);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("match_finance")
      .select(
        `
        *,
        matches!match_finance_match_id_fkey (
          id,
          tournament_id,
          match_type,
          created_at,
          tournaments (
            id,
            name
          )
        ),
        teams!match_finance_team_id_fkey (
          id,
          team_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("PROFIT FETCH ERROR:", error);

      setFinanceData([]);
      setErrorMessage(error.message || "Profit data load failed.");
      setLoading(false);

      return;
    }

    setFinanceData(data || []);
    setLoading(false);
  };

  const fetchPlayerStats = async (matchId) => {
    if (!matchId) return;

    if (
      Object.prototype.hasOwnProperty.call(
        playerStatsMap,
        matchId
      )
    ) {
      return;
    }

    setLoadingStats(matchId);

    const { data: stats, error } = await supabase
      .from("match_player_stats")
      .select(
        `
        id,
        match_id,
        player_id,
        kills,
        assists,
        damage,
        mvp,
        placement,
        players (
          ign,
          full_name
        )
      `
      )
      .eq("match_id", matchId);

    if (error) {
      console.error("PLAYER STATS ERROR:", error);

      setPlayerStatsMap((prev) => ({
        ...prev,
        [matchId]: [],
      }));
    } else {
      setPlayerStatsMap((prev) => ({
        ...prev,
        [matchId]: stats || [],
      }));
    }

    setLoadingStats(null);
  };

  const handleTogglePerformance = (item) => {
    const matchId = item.match_id || item.matches?.id;

    if (openPerformance === item.id) {
      setOpenPerformance(null);
      return;
    }

    setOpenPerformance(item.id);

    fetchPlayerStats(matchId);
  };

  const teamOptions = [
    ...new Set(
      financeData
        .map((item) => item.teams?.team_name)
        .filter(Boolean)
    ),
  ];

  const tournamentOptions = [
    ...new Set(
      financeData
        .map(
          (item) =>
            item.matches?.tournaments?.name
        )
        .filter(Boolean)
    ),
  ];

  const matchTypeOptions = [
    ...new Set(
      financeData
        .map(
          (item) => item.matches?.match_type
        )
        .filter(Boolean)
    ),
  ];

  const filteredData = financeData.filter((item) => {
    if (
      selectedTeam &&
      item.teams?.team_name !== selectedTeam
    ) {
      return false;
    }

    if (
      selectedTournament &&
      item.matches?.tournaments?.name !==
        selectedTournament
    ) {
      return false;
    }

    if (
      selectedMatchType &&
      item.matches?.match_type !== selectedMatchType
    ) {
      return false;
    }

    if (selectedProfitStatus) {
      const profit = Number(item.profit || 0);

      if (
        selectedProfitStatus === "profit" &&
        profit <= 0
      ) {
        return false;
      }

      if (
        selectedProfitStatus === "loss" &&
        profit >= 0
      ) {
        return false;
      }

      if (
        selectedProfitStatus === "break_even" &&
        profit !== 0
      ) {
        return false;
      }
    }

    if (selectedMonth) {
      const date = item.created_at
        ? new Date(item.created_at)
        : null;

      if (!date || Number.isNaN(date.getTime())) {
        return false;
      }

      const itemMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (itemMonth !== selectedMonth) {
        return false;
      }
    }

    return true;
  });

  const totalProfit = filteredData.reduce(
    (sum, item) =>
      sum + Number(item.profit || 0),
    0
  );

  const totalPlayer = filteredData.reduce(
    (sum, item) =>
      sum + Number(item.player_amount || 0),
    0
  );

  const totalManagement = filteredData.reduce(
    (sum, item) =>
      sum +
      Number(item.management_amount || 0),
    0
  );

  const clearFilters = () => {
    setSelectedTeam("");
    setSelectedTournament("");
    setSelectedMonth("");
    setSelectedMatchType("");
    setSelectedProfitStatus("");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg,#1a0000,#0a0a0a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fbbf24",
          fontSize: "28px",
          fontWeight: 600,
        }}
      >
        Loading Profit Data...
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg,#1a0505 0%,#0c0c0c 40%,#050510 100%)",
        padding: "40px 20px 80px",
        color: "white",
        fontFamily:
          "'Segoe UI',system-ui,sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize:
            "clamp(32px,5vw,48px)",
          fontWeight: 800,
          marginBottom: "50px",
          background:
            "linear-gradient(90deg,#fbbf24,#f472b6,#60a5fa,#34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:
            "transparent",
          letterSpacing: "1px",
        }}
      >
        PROFIT MANAGEMENT
      </h1>

      {errorMessage && (
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto 30px",
            padding: "16px 18px",
            borderRadius: "14px",
            background:
              "rgba(127,29,29,0.35)",
            border:
              "1px solid rgba(248,113,113,0.45)",
            color: "#fecaca",
          }}
        >
          <strong>
            Data Load Error:
          </strong>{" "}
          {errorMessage}
        </div>
      )}

      {/* SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: "24px",
          marginBottom: "40px",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <SummaryCard
          title="Total Profit"
          value={totalProfit}
          color="#fbbf24"
          background="rgba(127,29,29,0.4)"
        />

        <SummaryCard
          title="Player Share (70%)"
          value={totalPlayer}
          color="#34d399"
          background="rgba(20,83,45,0.4)"
        />

        <SummaryCard
          title="Management Share (30%)"
          value={totalManagement}
          color="#60a5fa"
          background="rgba(30,58,138,0.4)"
        />
      </div>

      {/* FILTERS */}

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 35px",
          padding: "20px",
          borderRadius: "20px",
          background:
            "rgba(255,255,255,0.045)",
          border:
            "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 12px 35px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            color: "#fbbf24",
            fontSize: "15px",
            fontWeight: 700,
            marginBottom: "15px",
          }}
        >
          Filter Financial Records
        </div>

        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <select
            value={selectedTeam}
            onChange={(e) =>
              setSelectedTeam(
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option value="">
              All Teams
            </option>

            {teamOptions.map((team) => (
              <option
                key={team}
                value={team}
              >
                {team}
              </option>
            ))}
          </select>

          <select
            value={selectedTournament}
            onChange={(e) =>
              setSelectedTournament(
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option value="">
              All Tournaments
            </option>

            {tournamentOptions.map(
              (tournament) => (
                <option
                  key={tournament}
                  value={tournament}
                >
                  {tournament}
                </option>
              )
            )}
          </select>

          <select
            value={selectedMatchType}
            onChange={(e) =>
              setSelectedMatchType(
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option value="">
              All Match Types
            </option>

            {matchTypeOptions.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              )
            )}
          </select>

          <select
            value={
              selectedProfitStatus
            }
            onChange={(e) =>
              setSelectedProfitStatus(
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option value="">
              All Profit Status
            </option>

            <option value="profit">
              🟢 Profit
            </option>

            <option value="loss">
              🔴 Loss
            </option>

            <option value="break_even">
              ⚪ Break Even
            </option>
          </select>

          {(selectedTeam ||
            selectedTournament ||
            selectedMonth ||
            selectedMatchType ||
            selectedProfitStatus) && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding:
                  "12px 20px",
                borderRadius:
                  "12px",
                border:
                  "1px solid rgba(251,191,36,0.4)",
                background:
                  "rgba(251,191,36,0.1)",
                color: "#fbbf24",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* HISTORY TITLE */}

      <h2
        style={{
          textAlign: "center",
          marginBottom: "28px",
          color: "#e5e7eb",
        }}
      >
        Financial History

        <span
          style={{
            fontSize: "16px",
            opacity: 0.6,
            marginLeft: "10px",
          }}
        >
          ({filteredData.length} records)
        </span>
      </h2>

      {/* RECORDS */}

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {filteredData.length === 0 && (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              borderRadius: "18px",
              border:
                "1px solid rgba(255,255,255,0.1)",
              background:
                "rgba(255,255,255,0.035)",
              color: "#9ca3af",
            }}
          >
            No financial records found.
          </div>
        )}

        {filteredData.map((item) => {
          const matchId =
            item.match_id ||
            item.matches?.id;

          const stats =
            playerStatsMap[matchId] ||
            [];

          const isOpen =
            openPerformance === item.id;

          return (
            <div
              key={item.id}
              style={{
                background:
                  "linear-gradient(145deg,rgba(20,20,30,0.7),rgba(10,10,15,0.85))",
                backdropFilter:
                  "blur(16px)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                borderRadius:
                  "22px",
                padding:
                  "28px 32px",
                boxShadow:
                  "0 10px 40px rgba(0,0,0,0.4)",
              }}
            >
              {/* HEADER INFO */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: "12px 20px",
                  marginBottom:
                    "20px",
                  fontSize:
                    "14.5px",
                  color: "#d1d5db",
                }}
              >
                <div>
                  📅 Date:{" "}
                  <strong>
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </div>

                <div>
                  🏆 Tournament:{" "}
                  <strong>
                    {item.matches
                      ?.tournaments
                      ?.name ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  🎮 Match Type:{" "}
                  <strong>
                    {item.matches
                      ?.match_type ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  👥 Team:{" "}
                  <strong>
                    {item.teams
                      ?.team_name ||
                      "N/A"}
                  </strong>
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
                  margin:
                    "18px 0",
                }}
              />

              {/* MONEY */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(210px,1fr))",
                  gap: "14px 24px",
                  fontSize:
                    "15.5px",
                }}
              >
                <div>
                  💰 Entry Fee

                  <div
                    style={{
                      fontWeight: 600,
                      marginTop:
                        "4px",
                    }}
                  >
                    {money(
                      item.entry_fee
                    )}
                  </div>
                </div>

                <div>
                  🏆 Prize Money

                  <div
                    style={{
                      fontWeight: 600,
                      marginTop:
                        "4px",
                    }}
                  >
                    {money(
                      item.prize_money
                    )}
                  </div>
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                    background:
                      "rgba(251,191,36,0.08)",
                    border:
                      "1px solid rgba(251,191,36,0.2)",
                    borderRadius:
                      "12px",
                    padding:
                      "14px 18px",
                  }}
                >
                  📈 Net Profit

                  <div
                    style={{
                      fontSize:
                        "26px",
                      fontWeight: 700,
                      color:
                        Number(
                          item.profit ||
                            0
                        ) < 0
                          ? "#f87171"
                          : "#fbbf24",
                      marginTop:
                        "4px",
                    }}
                  >
                    {money(
                      item.profit
                    )}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      color:
                        "#34d399",
                    }}
                  >
                    👤 Player 70%
                  </span>

                  <div
                    style={{
                      fontWeight: 600,
                      marginTop:
                        "4px",
                      color:
                        "#34d399",
                      fontSize:
                        "18px",
                    }}
                  >
                    {money(
                      item.player_amount
                    )}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      color:
                        "#60a5fa",
                    }}
                  >
                    🏢 Management 30%
                  </span>

                  <div
                    style={{
                      fontWeight: 600,
                      marginTop:
                        "4px",
                      color:
                        "#60a5fa",
                      fontSize:
                        "18px",
                    }}
                  >
                    {money(
                      item.management_amount
                    )}
                  </div>
                </div>
              </div>

              {/* PERFORMANCE BUTTON */}

              <button
                type="button"
                onClick={() =>
                  handleTogglePerformance(
                    item
                  )
                }
                disabled={!matchId}
                style={{
                  width: "100%",
                  marginTop:
                    "22px",
                  padding:
                    "13px 16px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid rgba(244,114,182,0.35)",
                  background:
                    isOpen
                      ? "rgba(244,114,182,0.15)"
                      : "rgba(244,114,182,0.08)",
                  color:
                    "#f9a8d4",
                  fontWeight: 700,
                  cursor: matchId
                    ? "pointer"
                    : "not-allowed",
                  opacity: matchId
                    ? 1
                    : 0.55,
                }}
              >
                {isOpen
                  ? "Hide Player Performance"
                  : "🎮 Player Performance Details"}
              </button>

              {/* PLAYER PERFORMANCE */}

              {isOpen && (
                <div
                  style={{
                    marginTop:
                      "18px",
                    paddingTop:
                      "18px",
                    borderTop:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {loadingStats ===
                  matchId ? (
                    <div
                      style={{
                        color:
                          "#c4b5fd",
                      }}
                    >
                      Loading player
                      stats...
                    </div>
                  ) : stats.length ===
                    0 ? (
                    <div
                      style={{
                        color:
                          "#9ca3af",
                      }}
                    >
                      No player
                      performance data
                      found for this
                      match.
                    </div>
                  ) : (
                    <div
                      style={{
                        display:
                          "grid",
                        gap: "12px",
                      }}
                    >
                      {stats.map(
                        (
                          stat,
                          index
                        ) => (
                          <div
                            key={
                              stat.id ||
                              `${matchId}-${stat.player_id}-${index}`
                            }
                            style={{
                              padding:
                                "14px 16px",
                              borderRadius:
                                "12px",
                              background:
                                "rgba(255,255,255,0.035)",
                              border:
                                "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 800,
                                color:
                                  "#f8fafc",
                                marginBottom:
                                  "10px",
                              }}
                            >
                              {stat
                                .players
                                ?.ign ||
                                stat
                                  .players
                                  ?.full_name ||
                                "Unknown Player"}
                            </div>

                            <div
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit,minmax(110px,1fr))",
                                gap:
                                  "10px",
                                color:
                                  "#d1d5db",
                                fontSize:
                                  "14px",
                              }}
                            >
                              <span>
                                🔫 Kills:{" "}
                                {Number(
                                  stat.kills ||
                                    0
                                )}
                              </span>

                              <span>
                                🤝 Assists:{" "}
                                {Number(
                                  stat.assists ||
                                    0
                                )}
                              </span>

                              <span>
                                💥 Damage:{" "}
                                {Number(
                                  stat.damage ||
                                    0
                                )}
                              </span>

                              <span>
                                📍 Placement:{" "}
                                {stat.placement ??
                                  "N/A"}
                              </span>

                              <span>
                                ⭐ MVP:{" "}
                                {stat.mvp
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

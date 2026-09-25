"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfitPage() {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMatchType, setSelectedMatchType] = useState("");
  const [selectedProfitStatus, setSelectedProfitStatus] = useState("");

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    const { data, error } = await supabase
      .from("match_finance")
      .select(`
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
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("PROFIT FETCH ERROR:", JSON.stringify(error, null, 2));
      setLoading(false);
      return;
    }

    setFinanceData(data || []);
    setLoading(false);
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
        .map((item) => item.matches?.tournaments?.name)
        .filter(Boolean)
    ),
  ];

  const matchTypeOptions = [
  ...new Set(
    financeData
      .map((item) => item.matches?.match_type)
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
      item.matches?.tournaments?.name !== selectedTournament
    ) {
      return false;
    }
 if (
  selectedMatchType &&
  item.matches?.match_type !== selectedMatchType
) {
  return false;
}


// Profit Status Filter
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

      if (!date) return false;

      const itemMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (itemMonth !== selectedMonth) return false;
    }

    return true;
  });

  const totalProfit = filteredData.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const totalPlayer = filteredData.reduce(
    (sum, item) => sum + Number(item.player_amount || 0),
    0
  );

  const totalManagement = filteredData.reduce(
    (sum, item) => sum + Number(item.management_amount || 0),
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
          background: "linear-gradient(135deg, #1a0000, #0a0a0a)",
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
          "linear-gradient(160deg, #1a0505 0%, #0c0c0c 40%, #050510 100%)",
        padding: "40px 20px",
        color: "white",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 800,
          marginBottom: "50px",
          background:
            "linear-gradient(90deg, #fbbf24, #f472b6, #60a5fa, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "1px",
        }}
      >
        PROFIT MANAGEMENT
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
          background="rgba(127, 29, 29, 0.4)"
        />

        <SummaryCard
          title="Player Share (70%)"
          value={totalPlayer}
          color="#34d399"
          background="rgba(20, 83, 45, 0.4)"
        />

        <SummaryCard
          title="Management Share (30%)"
          value={totalManagement}
          color="#60a5fa"
          background="rgba(30, 58, 138, 0.4)"
        />
      </div>

      {/* Exact location: Advanced Filter Bar */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 35px",
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.045)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            marginBottom: "15px",
            color: "#fbbf24",
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
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={inputStyle}
          />

              <div
  style={{
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    width: "100%",
    marginTop: "10px",
  }}
>

<select
  value={selectedMatchType}
  onChange={(e) => setSelectedMatchType(e.target.value)}
  style={selectStyle}
>
  <option value="">All Match Types</option>

<select
  value={selectedTeam}
  onChange={(e) => setSelectedTeam(e.target.value)}
  style={selectStyle}
>
  <option value="">All Teams</option>

  {teamOptions.map((team) => (
    <option key={team} value={team}>
      {team}
    </option>
  ))}
</select>


<select
  value={selectedTournament}
  onChange={(e) => setSelectedTournament(e.target.value)}
  style={selectStyle}
>
  <option value="">All Tournaments</option>

  {tournamentOptions.map((tournament) => (
    <option key={tournament} value={tournament}>
      {tournament}
    </option>
  ))}
</select>


<select
  value={selectedMatchType}
  onChange={(e) => setSelectedMatchType(e.target.value)}
  style={selectStyle}
>
  <option value="">
    All Match Types
  </option>

  {matchTypeOptions.map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}

</select>


<select
  value={selectedProfitStatus}
  onChange={(e) => setSelectedProfitStatus(e.target.value)}
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
    onClick={clearFilters}
    style={{
      padding: "12px 20px",
      borderRadius: "12px",
      border: "1px solid rgba(251,191,36,0.4)",
      background: "rgba(251,191,36,0.1)",
      color: "#fbbf24",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    Clear Filters
  </button>

)}
      <h2
        style={{
          fontSize: "26px",
          marginBottom: "28px",
          textAlign: "center",
          fontWeight: 600,
          color: "#e5e7eb",
        }}
      >
        Financial History
        <span
          style={{
            fontSize: "16px",
            opacity: 0.6,
            marginLeft: "12px",
          }}
        >
          ({filteredData.length} records)
        </span>
      </h2>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {filteredData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              opacity: 0.6,
              fontSize: "18px",
            }}
          >
            No matching records found
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id}
              style={{
                background:
                  "linear-gradient(145deg, rgba(20,20,30,0.7), rgba(10,10,15,0.85))",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "22px",
                padding: "28px 32px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 20px",
                  marginBottom: "20px",
                  fontSize: "14.5px",
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
                    {item.matches?.tournaments?.name || "N/A"}
                  </strong>
                </div>

                <div>
                  🎮 Match Type:{" "}
                  <strong>
                    {item.matches?.match_type || "N/A"}
                  </strong>
                </div>

                <div>
                  👥 Team:{" "}
                  <strong>
                    {item.teams?.team_name || "N/A"}
                  </strong>
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                  margin: "18px 0",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px 24px",
                  fontSize: "15.5px",
                }}
              >
                <div>
                  💰 Entry Fee
                  <div style={{ fontWeight: 600, marginTop: "4px" }}>
                    ৳{Number(item.entry_fee || 0).toFixed(2)}
                  </div>
                </div>

                <div>
                  🏆 Prize Money
                  <div style={{ fontWeight: 600, marginTop: "4px" }}>
                    ৳{Number(item.prize_money || 0).toFixed(2)}
                  </div>
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    borderRadius: "12px",
                    padding: "14px 18px",
                  }}
                >
                  📈 Net Profit
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: 700,
                      color: "#fbbf24",
                      marginTop: "4px",
                    }}
                  >
                    ৳{Number(item.profit || 0).toFixed(2)}
                  </div>
                </div>

                <div>
                  <span style={{ color: "#34d399" }}>
                    👤 Player 70%
                  </span>
                  <div
                    style={{
                      fontWeight: 600,
                      marginTop: "4px",
                      color: "#34d399",
                      fontSize: "18px",
                    }}
                  >
                    ৳{Number(item.player_amount || 0).toFixed(2)}
                  </div>
                </div>

                <div>
                  <span style={{ color: "#60a5fa" }}>
                    🏢 Management 30%
                  </span>
                  <div
                    style={{
                      fontWeight: 600,
                      marginTop: "4px",
                      color: "#60a5fa",
                      fontSize: "18px",
                    }}
                  >
                    ৳{Number(item.management_amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        input[type="month"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        select option {
          background: #171118;
          color: white;
        }
      `}</style>
    </main>
  );
}

function SummaryCard({ title, value, color, background }) {
  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${background}, rgba(10,10,15,0.6))`,
        backdropFilter: "blur(12px)",
        border: `1px solid ${color}55`,
        borderRadius: "20px",
        padding: "28px",
        boxShadow: `0 8px 32px ${color}22`,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "15px",
          opacity: 0.85,
        }}
      >
        {title}
      </h3>

      <h2
        style={{
          margin: "12px 0 0",
          fontSize: "32px",
          fontWeight: 700,
          color,
        }}
      >
        ৳{Number(value || 0).toFixed(2)}
      </h2>
    </div>
  );
}

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  minWidth: "180px",
  flex: 1,
};

const selectStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#171118",
  color: "white",
  fontSize: "14px",
  outline: "none",
  minWidth: "200px",
  flex: 1,
  cursor: "pointer",
};
const quickButtonStyle = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(251,191,36,0.35)",
  background: "rgba(251,191,36,0.08)",
  color: "#fbbf24",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "0.3s",
};

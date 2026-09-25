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


      const itemMonth =
        `${date.getFullYear()}-${String(
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
      sum + Number(item.management_amount || 0),
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
      <div>
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
        }}
      >
        PROFIT MANAGEMENT
      </h1>


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
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


      <div
        style={{
          maxWidth:"900px",
          margin:"0 auto 35px",
          padding:"20px",
          borderRadius:"20px",
          background:"rgba(255,255,255,0.045)",
          border:"1px solid rgba(255,255,255,0.12)",
        }}
      >

        <div
          style={{
            color:"#fbbf24",
            fontWeight:700,
            marginBottom:"15px"
          }}
        >
          Filter Financial Records
        </div>


        <div
          style={{
            display:"flex",
            gap:"14px",
            flexWrap:"wrap"
          }}
        >

          <input
            type="month"
            value={selectedMonth}
            onChange={(e)=>setSelectedMonth(e.target.value)}
            style={inputStyle}
          />


          <select
            value={selectedTeam}
            onChange={(e)=>setSelectedTeam(e.target.value)}
            style={selectStyle}
          >

            <option value="">
              All Teams
            </option>

            {teamOptions.map((team)=>(
              <option key={team} value={team}>
                {team}
              </option>
            ))}

          </select>


          <select
            value={selectedTournament}
            onChange={(e)=>setSelectedTournament(e.target.value)}
            style={selectStyle}
          >

            <option value="">
              All Tournaments
            </option>

            {tournamentOptions.map((tournament)=>(
              <option key={tournament} value={tournament}>
                {tournament}
              </option>
            ))}

          </select>


          <select
            value={selectedMatchType}
            onChange={(e)=>setSelectedMatchType(e.target.value)}
            style={selectStyle}
          >

            <option value="">
              All Match Types
            </option>

            {matchTypeOptions.map((type)=>(
              <option key={type} value={type}>
                {type}
              </option>
            ))}

          </select>


          <select
            value={selectedProfitStatus}
            onChange={(e)=>setSelectedProfitStatus(e.target.value)}
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
                padding:"12px 20px",
                borderRadius:"12px",
                border:"1px solid rgba(251,191,36,0.4)",
                background:"rgba(251,191,36,0.1)",
                color:"#fbbf24",
                cursor:"pointer"
              }}
            >
              Clear Filters
            </button>

          )}

        </div>

      </div>


      <h2
        style={{
          textAlign:"center",
          marginBottom:"28px"
        }}
      >
        Financial History ({filteredData.length} records)
      </h2>


      <div
        style={{
          maxWidth:"900px",
          margin:"0 auto",
          display:"flex",
          flexDirection:"column",
          gap:"22px"
        }}
      >

        {filteredData.map((item)=>(
          <div
            key={item.id}
            style={{
              background:
              "linear-gradient(145deg, rgba(20,20,30,.7), rgba(10,10,15,.85))",
              borderRadius:"22px",
              padding:"28px",
            }}
          >

            <div>
              📅 Date:
              <strong>
                {" "}
                {new Date(item.created_at).toLocaleDateString()}
              </strong>
            </div>

            <div>
              🏆 Tournament:
              <strong>
                {" "}
                {item.matches?.tournaments?.name || "N/A"}
              </strong>
            </div>

            <div>
              🎮 Match Type:
              <strong>
                {" "}
                {item.matches?.match_type || "N/A"}
              </strong>
            </div>

            <div>
              👥 Team:
              <strong>
                {" "}
                {item.teams?.team_name || "N/A"}
              </strong>
            </div>


            <hr />


            <div>
              💰 Entry Fee:
              ৳{Number(item.entry_fee || 0).toFixed(2)}
            </div>

            <div>
              🏆 Prize Money:
              ৳{Number(item.prize_money || 0).toFixed(2)}
            </div>

            <div>
              📈 Net Profit:
              ৳{Number(item.profit || 0).toFixed(2)}
            </div>

            <div>
              👤 Player 70%:
              ৳{Number(item.player_amount || 0).toFixed(2)}
            </div>

            <div>
              🏢 Management 30%:
              ৳{Number(item.management_amount || 0).toFixed(2)}
            </div>

          </div>
        ))}

      </div>


      <style jsx global>{`
        select option {
          background:#171118;
          color:white;
        }
      `}</style>


    </main>
  );
}


function SummaryCard({
  title,
  value,
  color,
  background
}) {

  return (
    <div
      style={{
        background:
        `linear-gradient(145deg, ${background}, rgba(10,10,15,.6))`,
        borderRadius:"20px",
        padding:"28px",
        border:`1px solid ${color}55`
      }}
    >

      <h3>{title}</h3>

      <h2 style={{color}}>
        ৳{Number(value || 0).toFixed(2)}
      </h2>

    </div>
  );
}


const inputStyle = {
  padding:"12px 16px",
  borderRadius:"12px",
  background:"rgba(255,255,255,0.06)",
  color:"white",
  border:"1px solid rgba(255,255,255,0.15)"
};


const selectStyle = {
  padding:"12px 16px",
  borderRadius:"12px",
  background:"#171118",
  color:"white",
  border:"1px solid rgba(255,255,255,0.15)",
  minWidth:"200px"
};

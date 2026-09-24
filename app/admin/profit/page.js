"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfitPage() {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);

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
          name
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

  const totalProfit = financeData.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );
  const totalPlayer = financeData.reduce(
    (sum, item) => sum + Number(item.player_amount || 0),
    0
  );
  const totalManagement = financeData.reduce(
    (sum, item) => sum + Number(item.management_amount || 0),
    0
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #1a0505 0%, #0c0c0c 40%, #050510 100%)",
        padding: "40px 20px",
        color: "white",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 800,
          marginBottom: "50px",
          background: "linear-gradient(90deg, #fbbf24, #f472b6, #60a5fa, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "1px",
          textShadow: "0 0 30px rgba(251, 191, 36, 0.3)",
        }}
      >
        PROFIT MANAGEMENT
      </h1>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          marginBottom: "50px",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Total Profit */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(127, 29, 29, 0.4), rgba(30, 10, 10, 0.6))",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 8px 32px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)",
              animation: "pulseGlow 4s ease-in-out infinite",
            }}
          />
          <h3 style={{ margin: 0, fontSize: "15px", opacity: 0.85, letterSpacing: "0.5px" }}>
            Total Profit
          </h3>
          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "32px",
              fontWeight: 700,
              color: "#fbbf24",
              textShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
            }}
          >
            ৳{totalProfit.toFixed(2)}
          </h2>
        </div>

        {/* Player Share */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(20, 83, 45, 0.4), rgba(10, 30, 20, 0.6))",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(52, 211, 153, 0.25)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 8px 32px rgba(52, 211, 153, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)",
              animation: "pulseGlow 4.5s ease-in-out infinite",
            }}
          />
          <h3 style={{ margin: 0, fontSize: "15px", opacity: 0.85, letterSpacing: "0.5px" }}>
            Player Share (70%)
          </h3>
          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "32px",
              fontWeight: 700,
              color: "#34d399",
              textShadow: "0 0 20px rgba(52, 211, 153, 0.5)",
            }}
          >
            ৳{totalPlayer.toFixed(2)}
          </h2>
        </div>

        {/* Management Share */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(30, 58, 138, 0.4), rgba(10, 20, 40, 0.6))",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(96, 165, 250, 0.25)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 8px 32px rgba(96, 165, 250, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)",
              animation: "pulseGlow 5s ease-in-out infinite",
            }}
          />
          <h3 style={{ margin: 0, fontSize: "15px", opacity: 0.85, letterSpacing: "0.5px" }}>
            Management Share (30%)
          </h3>
          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "32px",
              fontWeight: 700,
              color: "#60a5fa",
              textShadow: "0 0 20px rgba(96, 165, 250, 0.5)",
            }}
          >
            ৳{totalManagement.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* History Title */}
      <h2
        style={{
          fontSize: "26px",
          marginBottom: "28px",
          textAlign: "center",
          fontWeight: 600,
          color: "#e5e7eb",
          letterSpacing: "0.5px",
        }}
      >
        Financial History
      </h2>

      {/* History Cards */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {financeData.map((item, index) => (
          <div
            key={item.id}
            style={{
              background: "linear-gradient(145deg, rgba(20, 20, 30, 0.7), rgba(10, 10, 15, 0.85))",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "22px",
              padding: "28px 32px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 16px 50px rgba(0,0,0,0.5), 0 0 30px rgba(251, 191, 36, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)";
            }}
          >
            {/* Top accent line with mixed colors */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, 
                  ${index % 3 === 0 ? "#fbbf24" : index % 3 === 1 ? "#34d399" : "#60a5fa"}, 
                  ${index % 3 === 0 ? "#f472b6" : index % 3 === 1 ? "#60a5fa" : "#a78bfa"}, 
                  transparent)`,
                animation: "shimmer 3s linear infinite",
              }}
            />

            {/* Header Info */}
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
                <span style={{ opacity: 0.6 }}>📅 Date:</span>{" "}
                <strong>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "N/A"}
                </strong>
              </div>
              <div>
                <span style={{ opacity: 0.6 }}>🏆 Tournament:</span>{" "}
                {item.matches?.tournaments?.name || "N/A"}
              </div>
              <div>
                <span style={{ opacity: 0.6 }}>🎮 Match Type:</span>{" "}
                <strong>{item.matches?.match_type || "N/A"}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.6 }}>👥 Team:</span>{" "}
                <strong>{item.teams?.team_name || "N/A"}</strong>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                margin: "18px 0",
              }}
            />

            {/* Money Section */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px 24px",
                fontSize: "15.5px",
              }}
            >
              <div>
                <span style={{ opacity: 0.65 }}>💰 Entry Fee</span>
                <div style={{ fontWeight: 600, marginTop: "4px" }}>
                  ৳{item.entry_fee}
                </div>
              </div>
              <div>
                <span style={{ opacity: 0.65 }}>🏆 Prize Money</span>
                <div style={{ fontWeight: 600, marginTop: "4px" }}>
                  ৳{item.prize_money}
                </div>
              </div>

              {/* Net Profit - highlighted */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "rgba(251, 191, 36, 0.08)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  marginTop: "6px",
                }}
              >
                <span style={{ opacity: 0.8, fontSize: "14px" }}>📈 Net Profit</span>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "#fbbf24",
                    marginTop: "4px",
                    textShadow: "0 0 18px rgba(251, 191, 36, 0.45)",
                    animation: "blinkSoft 2.8s ease-in-out infinite",
                  }}
                >
                  ৳{item.profit}
                </div>
              </div>

              <div>
                <span style={{ color: "#34d399", opacity: 0.9 }}>👤 Player 70%</span>
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
                <span style={{ color: "#60a5fa", opacity: 0.9 }}>🏢 Management 30%</span>
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
        ))}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes blinkSoft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.72; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </main>
  );
}

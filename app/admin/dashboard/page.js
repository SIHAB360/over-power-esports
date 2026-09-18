"use client";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const {
data:{
session
}
}= await supabase.auth.getSession();


if(!session){

window.location.href="/login";
return;

}

const user = session.user;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role,email")
      .eq("id", user.id)
      .single();

    if (error || profile?.role?.toLowerCase() !== "admin") {
      window.location.href = "/login";
      return;
    }

    setAdminEmail(profile.email);
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>INITIALIZING COMMAND CENTER</p>
      </div>
    );
  }

  const cards = [
   { 
  num: "01", 
  icon: "👥", 
  title: "PLAYERS", 
  desc: "Manage player accounts",
  href: "/admin/players"
},
    {
  num: "02",
  icon: "⚔️",
  title: "MATCHES",
  desc: "Create and control matches",
  href: "/admin/matches"
},
    {
 num: "03",
 icon: "🛡️",
 title: "TEAMS",
 desc: "Manage your esports teams",
 href: "/admin/teams"
},
    { num: "04", icon: "🏆", title: "TOURNAMENTS", desc: "Tournament management" },
    { num: "05", icon: "💰", title: "PROFIT", desc: "Income calculation" },
    { num: "06", icon: "💳", title: "SALARY", desc: "Player salary control" },
    { num: "07", icon: "🔐", title: "VERIFICATION", desc: "Generate access codes" },
  ];

  return (
    <main className="admin-page">
      {/* Background */}
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="brand">
            <div className="top-label">
              <span className="dot"></span>
              ADMIN CONTROL CENTER
            </div>
            <h1>OVER POWER</h1>
            <h2>ADMIN PANEL</h2>
            <p className="tagline">ESPORTS COMMAND CENTER</p>
          </div>

          <div className="user-card">
            <div className="avatar">A</div>
            <div className="user-info">
              <span className="email">{adminEmail}</span>
              <button className="logout-btn" onClick={logout}>
                LOGOUT
              </button>
            </div>
          </div>
        </header>
  <section className="stats-grid">


<div className="stat-card">

<span>
TOTAL PLAYERS
</span>

<h2>
120
</h2>

</div>



<div className="stat-card">

<span>
ACTIVE MATCHES
</span>

<h2>
08
</h2>

</div>



<div className="stat-card">

<span>
TOURNAMENTS
</span>

<h2>
05
</h2>

</div>



<div className="stat-card">

<span>
REVENUE
</span>

<h2>
৳45000
</h2>

</div>


</section>

       {/* Cards Grid */}
<div className="cards-grid">
  {cards.map((card) => (
    <div key={card.num} className="card">
      <div className="card-top">
        <div className="icon-box">{card.icon}</div>
        <span className="number">{card.num}</span>
      </div>

      <h3>{card.title}</h3>
      <p>{card.desc}</p>

      <button
  className="action-btn"
  onClick={() => {
    window.location.href = card.href;
  }}
>
  OPEN PANEL
  <span>→</span>
</button>
    </div>
    ))}
</div>

</div>

<style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: #050505;
          color: #fff;
          position: relative;
          overflow: hidden;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        .bg-glow {
          position: fixed;
          width: 700px;
          height: 700px;
          background: #ff1744;
          filter: blur(180px);
          opacity: 0.16;
          top: -300px;
          left: -200px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-glow-2 {
          position: fixed;
          width: 500px;
          height: 500px;
          background: #ff0040;
          filter: blur(160px);
          opacity: 0.1;
          bottom: -150px;
          right: -100px;
          pointer-events: none;
          z-index: 0;
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 50px 40px 80px;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 60px;
        }

        .brand {
          max-width: 600px;
        }

        .top-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          letter-spacing: 3px;
          color: #ff4d6d;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .top-label .dot {
          width: 8px;
          height: 8px;
          background: #ff1744;
          border-radius: 50%;
          box-shadow: 0 0 12px #ff1744;
        }

        .brand h1 {
          font-size: 56px;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          line-height: 1.1;
          background: linear-gradient(180deg, #ffffff 30%, #ff8a9b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand h2 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 6px;
          margin: 6px 0 0;
          color: #ff1744;
          text-shadow: 0 0 20px rgba(255, 23, 68, 0.6);
        }

        .tagline {
          font-size: 13px;
          color: #777;
          letter-spacing: 3px;
          margin-top: 12px;
        }

        /* User Card */
        .user-card {
          background: rgba(20, 5, 10, 0.7);
          border: 1px solid rgba(255, 23, 68, 0.45);
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          backdrop-filter: blur(12px);
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.15);
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff1744, #b30022);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(255, 23, 68, 0.5);
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .email {
          font-size: 12px;
          color: #ccc;
        }

        .logout-btn {
          background: linear-gradient(135deg, #ff1744, #c4002b);
          border: none;
          color: white;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 8px 18px;
          border-radius: 20px;
          cursor: pointer;
          box-shadow: 0 0 18px rgba(255, 23, 68, 0.4);
          transition: all 0.25s ease;
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 26px rgba(255, 23, 68, 0.65);
        }

        /* Cards Grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* Card */
        .card {
          background: rgba(12, 3, 6, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.4);
          border-radius: 22px;
          padding: 28px 26px 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 0 0 1px rgba(255, 23, 68, 0.1),
            0 15px 40px rgba(0, 0, 0, 0.5);
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 22px;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(255, 23, 68, 0.6),
            rgba(255, 23, 68, 0.05),
            rgba(255, 23, 68, 0.4)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .card::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at center,
            rgba(255, 23, 68, 0.08) 0%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .card:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 23, 68, 0.75);
          box-shadow: 0 0 45px rgba(255, 23, 68, 0.28),
            0 18px 40px rgba(0, 0, 0, 0.55);
        }

        .card:hover::after {
          opacity: 1;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .icon-box {
          width: 48px;
          height: 48px;
          background: rgba(255, 23, 68, 0.12);
          border: 1px solid rgba(255, 23, 68, 0.3);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .number {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #ff4d6d;
        }

        .card h3 {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin: 0 0 8px;
          color: #fff;
        }

        .card p {
          font-size: 14px;
          color: #999;
          margin: 0 0 26px;
          line-height: 1.4;
        }

        .action-btn {
          width: 100%;
          height: 46px;
          background: rgba(255, 23, 68, 0.1);
          border: 1px solid rgba(255, 23, 68, 0.45);
          border-radius: 14px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }

        .action-btn:hover {
          background: linear-gradient(135deg, #ff1744, #c4002b);
          border-color: #ff1744;
          box-shadow: 0 0 28px rgba(255, 23, 68, 0.5);
          transform: translateY(-1px);
        }

        .action-btn span {
          font-size: 16px;
          transition: transform 0.3s ease;
        }

        .action-btn:hover span {
          transform: translateX(5px);
        }

        /* Loading */
        .loading-screen {
          min-height: 100vh;
          background: #050505;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loader {
          width: 52px;
          height: 52px;
          border: 3px solid rgba(255, 23, 68, 0.15);
          border-top-color: #ff1744;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-screen p {
          font-size: 12px;
          letter-spacing: 3px;
          color: #ff4d6d;
          font-weight: 600;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
  .container {
    padding: 30px 16px 50px;
  }

  .header {
    flex-direction: column;
    gap: 24px;
  }

  .brand h1 {
    font-size: 36px;
  }

  .brand h2 {
    font-size: 20px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}


/* =========================
   DASHBOARD STATS
========================= */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 50px;
}

.stat-card {
  padding: 24px 20px;
  border-radius: 20px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 20, 60, .12),
      rgba(0, 0, 0, .75)
    );

  border: 1px solid rgba(255, 20, 60, .4);

  box-shadow:
    0 15px 40px rgba(0, 0, 0, .5),
    inset 0 0 25px rgba(255, 20, 60, .05);

  text-align: center;
}

.stat-card span {
  font-size: 10px;
  letter-spacing: 3px;
  color: #888;
}

.stat-card h2 {
  font-size: 30px;
  margin: 12px 0 0;
  color: #fff;
}


/* =========================
   STATS RESPONSIVE
========================= */

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 35px;
  }

  .stat-card {
    padding: 20px 16px;
  }

  .stat-card h2 {
    font-size: 26px;
  }
}
      `}</style>
    </main>
  );
}

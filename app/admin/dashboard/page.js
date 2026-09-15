"use client";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

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
        <div className="loader-ring"></div>
        <p>INITIALIZING COMMAND CENTER</p>
      </div>
    );
  }

  return (
    <main className="admin-root">
      {/* Background Layers */}
      <div className="bg-layer">
        <div className="glow glow-top-left"></div>
        <div className="glow glow-bottom-right"></div>
        <div className="glow glow-center"></div>
        <div className="grid-lines"></div>
      </div>

      <div className="content-wrapper">
        {/* Header */}
        <header className="admin-header">
          <div className="brand-block">
            <span className="top-label">ADMIN CONTROL CENTER</span>
            <h1 className="main-title">OVER POWER</h1>
            <h2 className="sub-title">ADMIN PANEL</h2>
            <p className="tagline">ESPORTS COMMAND CENTER</p>
          </div>

          <div className="user-panel">
            <div className="avatar">A</div>
            <span className="user-email">{adminEmail}</span>
            <button className="logout-btn" onClick={logout}>
              LOGOUT
            </button>
          </div>
        </header>

        {/* Cards Grid */}
        <section className="cards-grid">
          <div className="glass-card">
            <div className="card-header">
              <span className="card-icon">👥</span>
              <span className="card-num">01</span>
            </div>
            <h3>PLAYERS</h3>
            <p>Manage player accounts</p>
            <button className="card-action">OPEN PANEL →</button>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <span className="card-icon">⚔</span>
              <span className="card-num">02</span>
            </div>
            <h3>MATCHES</h3>
            <p>Create and control matches</p>
            <button className="card-action">OPEN PANEL →</button>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <span className="card-icon">🏆</span>
              <span className="card-num">03</span>
            </div>
            <h3>TOURNAMENTS</h3>
            <p>Tournament management</p>
            <button className="card-action">OPEN PANEL →</button>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <span className="card-icon">💰</span>
              <span className="card-num">04</span>
            </div>
            <h3>PROFIT</h3>
            <p>Income calculation</p>
            <button className="card-action">OPEN PANEL →</button>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <span className="card-icon">💳</span>
              <span className="card-num">05</span>
            </div>
            <h3>SALARY</h3>
            <p>Player salary control</p>
            <button className="card-action">OPEN PANEL →</button>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <span className="card-icon">🔐</span>
              <span className="card-num">06</span>
            </div>
            <h3>VERIFICATION</h3>
            <p>Generate access codes</p>
            <button className="card-action">OPEN PANEL →</button>
          </div>
        </section>
      </div>

      <style jsx>{`
        /* ========== ROOT & BACKGROUND ========== */
        .admin-root {
          min-height: 100vh;
          background: #050505;
          color: #fff;
          position: relative;
          overflow-x: hidden;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .bg-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
        }

        .glow-top-left {
          width: 650px;
          height: 650px;
          background: #ff1744;
          top: -280px;
          left: -220px;
          opacity: 0.22;
        }

        .glow-bottom-right {
          width: 550px;
          height: 550px;
          background: #ff0040;
          bottom: -200px;
          right: -150px;
          opacity: 0.15;
        }

        .glow-center {
          width: 400px;
          height: 400px;
          background: #ff2d55;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.07;
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              rgba(255, 23, 68, 0.04) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 23, 68, 0.04) 1px, transparent 1px);
          background-size: 70px 70px;
        }

        /* ========== CONTENT WRAPPER ========== */
        .content-wrapper {
          position: relative;
          z-index: 2;
          max-width: 1320px;
          margin: 0 auto;
          padding: 50px 40px 80px;
        }

        /* ========== HEADER ========== */
        .admin-header {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin-bottom: 70px;
        }

        .brand-block {
          text-align: center;
        }

        .top-label {
          display: block;
          font-size: 11px;
          letter-spacing: 7px;
          color: #ff1744;
          font-weight: 600;
          text-shadow: 0 0 18px rgba(255, 23, 68, 0.9);
          margin-bottom: 10px;
        }

        .main-title {
          font-size: 68px;
          font-weight: 900;
          letter-spacing: 12px;
          margin: 0;
          line-height: 1;
          background: linear-gradient(180deg, #ffffff 20%, #ff9aab 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.25));
        }

        .sub-title {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 9px;
          margin: 6px 0 0;
          color: #ff1744;
          text-shadow: 0 0 28px rgba(255, 23, 68, 0.75);
        }

        .tagline {
          font-size: 12px;
          letter-spacing: 5px;
          color: #777;
          margin-top: 14px;
          font-weight: 500;
        }

        /* User Panel */
        .user-panel {
          position: absolute;
          right: 0;
          top: 8px;
          background: rgba(15, 3, 8, 0.7);
          border: 1px solid rgba(255, 23, 68, 0.4);
          border-radius: 22px;
          padding: 16px 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 0 35px rgba(255, 23, 68, 0.18),
            inset 0 0 20px rgba(255, 23, 68, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          min-width: 190px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff1744, #b30022);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 17px;
          box-shadow: 0 0 18px rgba(255, 23, 68, 0.55);
        }

        .user-email {
          font-size: 11px;
          color: #bbb;
          letter-spacing: 0.3px;
        }

        .logout-btn {
          height: 38px;
          padding: 0 28px;
          border-radius: 19px;
          border: none;
          background: linear-gradient(135deg, #ff1744, #c4002b);
          color: white;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 1.5px;
          cursor: pointer;
          box-shadow: 0 0 22px rgba(255, 23, 68, 0.5);
          transition: all 0.25s ease;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 32px rgba(255, 23, 68, 0.75);
        }

        /* ========== CARDS GRID ========== */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 26px;
        }

        /* ========== GLASS CARD ========== */
        .glass-card {
          background: rgba(18, 4, 9, 0.65);
          border: 1px solid rgba(255, 23, 68, 0.32);
          border-radius: 26px;
          padding: 30px 28px 26px;
          min-height: 265px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.55),
            inset 0 0 35px rgba(255, 23, 68, 0.04);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          right: 12%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #ff1744 30%,
            #ff1744 70%,
            transparent
          );
          opacity: 0.85;
        }

        .glass-card::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 140px;
          height: 140px;
          background: radial-gradient(
            circle,
            rgba(255, 23, 68, 0.15) 0%,
            transparent 70%
          );
          pointer-events: none;
        }

        .glass-card:hover {
          transform: translateY(-10px);
          border-color: rgba(255, 23, 68, 0.65);
          box-shadow: 0 28px 60px rgba(255, 23, 68, 0.22),
            0 0 0 1px rgba(255, 23, 68, 0.25),
            inset 0 0 40px rgba(255, 23, 68, 0.07);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .card-icon {
          font-size: 34px;
          filter: drop-shadow(0 0 10px rgba(255, 23, 68, 0.55));
          transition: transform 0.3s ease;
        }

        .glass-card:hover .card-icon {
          transform: scale(1.12);
        }

        .card-num {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #ff1744;
          opacity: 0.9;
        }

        .glass-card h3 {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2.5px;
          margin: 0 0 8px;
          color: #fff;
        }

        .glass-card p {
          font-size: 14px;
          color: #999;
          margin: 0 0 28px;
          line-height: 1.45;
          flex-grow: 1;
        }

        .card-action {
          height: 44px;
          width: 100%;
          border-radius: 22px;
          border: 1px solid rgba(255, 23, 68, 0.5);
          background: rgba(255, 23, 68, 0.12);
          color: #fff;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .card-action::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ff1744, #c4002b);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .glass-card:hover .card-action {
          border-color: #ff1744;
          box-shadow: 0 0 22px rgba(255, 23, 68, 0.4);
        }

        .glass-card:hover .card-action::before {
          opacity: 1;
        }

        .card-action span,
        .card-action {
          position: relative;
          z-index: 1;
        }

        /* ========== LOADING ========== */
        .loading-screen {
          min-height: 100vh;
          background: #050505;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 22px;
        }

        .loader-ring {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 4px solid rgba(255, 23, 68, 0.15);
          border-top-color: #ff1744;
          animation: spin 0.85s linear infinite;
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.35);
        }

        .loading-screen p {
          font-size: 12px;
          letter-spacing: 3.5px;
          color: #ff1744;
          font-weight: 600;
          animation: pulse 1.6s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1100px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .content-wrapper {
            padding: 35px 18px 60px;
          }

          .admin-header {
            flex-direction: column;
            gap: 30px;
          }

          .user-panel {
            position: static;
          }

          .main-title {
            font-size: 42px;
            letter-spacing: 6px;
          }

          .sub-title {
            font-size: 26px;
            letter-spacing: 4px;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </main>
  );
}

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
      <div className="loading">
        <div className="loader"></div>
        <p className="loading-text">INITIALIZING COMMAND CENTER...</p>
      </div>
    );
  }

  return (
    <main className="admin-page">
      {/* Background Effects */}
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      <div className="bg-glow glow-3"></div>
      <div className="grid-overlay"></div>

      <div className="dashboard-wrapper">
        <header>
          <div className="brand">
            <span className="label">ADMIN CONTROL CENTER</span>
            <h1>OVER POWER</h1>
            <h2>ADMIN PANEL</h2>
            <p>ESPORTS COMMAND CENTER</p>
          </div>

          <div className="profile-box">
            <div className="profile-avatar">A</div>
            <span className="email">{adminEmail}</span>
            <button className="logout-btn" onClick={logout}>
              LOGOUT
            </button>
          </div>
        </header>

        <section className="dashboard-grid">
          <Card
            number="01"
            icon="👥"
            title="PLAYERS"
            text="Manage player accounts"
            color="#ff1744"
          />
          <Card
            number="02"
            icon="⚔"
            title="MATCHES"
            text="Create and control matches"
            color="#ff2d55"
          />
          <Card
            number="03"
            icon="🏆"
            title="TOURNAMENTS"
            text="Tournament management"
            color="#ff1744"
          />
          <Card
            number="04"
            icon="💰"
            title="PROFIT"
            text="Income calculation"
            color="#ff3d71"
          />
          <Card
            number="05"
            icon="💳"
            title="SALARY"
            text="Player salary control"
            color="#ff1744"
          />
          <Card
            number="06"
            icon="🔐"
            title="VERIFICATION"
            text="Generate access codes"
            color="#ff2d55"
          />
        </section>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 60px 40px;
          background: #050505;
          color: white;
          position: relative;
          overflow: hidden;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        /* Background Glow Effects */
        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.18;
          pointer-events: none;
          z-index: 0;
        }
        .glow-1 {
          width: 700px;
          height: 700px;
          background: #ff1744;
          top: -250px;
          left: -200px;
        }
        .glow-2 {
          width: 500px;
          height: 500px;
          background: #ff0040;
          bottom: -150px;
          right: -100px;
          opacity: 0.12;
        }
        .glow-3 {
          width: 400px;
          height: 400px;
          background: #ff2d55;
          top: 40%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0.08;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              rgba(255, 23, 68, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 23, 68, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .dashboard-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* Header */
        header {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin-bottom: 80px;
        }

        .brand {
          text-align: center;
        }

        .label {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 8px;
          color: #ff1744;
          font-weight: 600;
          text-shadow: 0 0 20px rgba(255, 23, 68, 0.8);
          margin-bottom: 12px;
        }

        .brand h1 {
          font-size: 72px;
          letter-spacing: 14px;
          margin: 0;
          font-weight: 900;
          background: linear-gradient(180deg, #ffffff 30%, #ff8a9b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.25);
          line-height: 1;
        }

        .brand h2 {
          font-size: 42px;
          letter-spacing: 10px;
          margin: 8px 0 0;
          font-weight: 800;
          color: #ff1744;
          text-shadow: 0 0 30px rgba(255, 23, 68, 0.7);
        }

        .brand p {
          font-size: 12px;
          letter-spacing: 6px;
          color: #777;
          margin-top: 14px;
          font-weight: 500;
        }

        /* Profile Box */
        .profile-box {
          position: absolute;
          right: 0;
          top: 10px;
          padding: 18px 22px;
          border-radius: 24px;
          background: rgba(20, 5, 10, 0.6);
          border: 1px solid rgba(255, 23, 68, 0.35);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 0 40px rgba(255, 23, 68, 0.15),
            inset 0 0 20px rgba(255, 23, 68, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          min-width: 200px;
        }

        .profile-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff1744, #990022);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          box-shadow: 0 0 20px rgba(255, 23, 68, 0.5);
        }

        .email {
          font-size: 11px;
          color: #bbb;
          letter-spacing: 0.5px;
        }

        .logout-btn {
          height: 40px;
          padding: 0 32px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, #ff1744, #c4002b);
          color: white;
          font-weight: 800;
          letter-spacing: 2px;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.45);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logout-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 40px rgba(255, 23, 68, 0.7);
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        /* Card Styles */
        .card {
          height: 280px;
          padding: 32px;
          border-radius: 28px;
          background: rgba(18, 4, 8, 0.55);
          border: 1px solid rgba(255, 23, 68, 0.25);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6),
            inset 0 0 40px rgba(255, 23, 68, 0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #ff1744,
            transparent
          );
          opacity: 0.7;
        }

        .card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at top right,
            rgba(255, 23, 68, 0.12),
            transparent 60%
          );
          pointer-events: none;
        }

        .card:hover {
          transform: translateY(-12px);
          border-color: rgba(255, 23, 68, 0.6);
          box-shadow: 0 30px 70px rgba(255, 23, 68, 0.25),
            0 0 0 1px rgba(255, 23, 68, 0.3),
            inset 0 0 50px rgba(255, 23, 68, 0.08);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-icon {
          font-size: 36px;
          filter: drop-shadow(0 0 12px rgba(255, 23, 68, 0.6));
          transition: transform 0.3s ease;
        }

        .card:hover .card-icon {
          transform: scale(1.1);
        }

        .card-number {
          font-size: 13px;
          letter-spacing: 4px;
          color: #ff1744;
          font-weight: 700;
          opacity: 0.9;
        }

        .card-content h3 {
          font-size: 26px;
          letter-spacing: 3px;
          margin: 0 0 8px;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
        }

        .card-content p {
          font-size: 14px;
          color: #999;
          margin: 0;
          line-height: 1.4;
        }

        .card-btn {
          height: 44px;
          border-radius: 22px;
          background: rgba(255, 23, 68, 0.12);
          border: 1px solid rgba(255, 23, 68, 0.45);
          color: white;
          font-weight: 800;
          letter-spacing: 1.5px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .card-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ff1744, #c4002b);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .card:hover .card-btn {
          border-color: #ff1744;
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.4);
        }

        .card:hover .card-btn::before {
          opacity: 1;
        }

        .card-btn span {
          position: relative;
          z-index: 1;
        }

        /* Loading */
        .loading {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #050505;
          gap: 24px;
        }

        .loader {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 4px solid rgba(255, 23, 68, 0.15);
          border-top-color: #ff1744;
          animation: spin 0.9s linear infinite;
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.3);
        }

        .loading-text {
          font-size: 13px;
          letter-spacing: 4px;
          color: #ff1744;
          font-weight: 600;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .admin-page {
            padding: 40px 20px;
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .profile-box {
            position: static;
            margin: 30px auto 0;
          }
          header {
            flex-direction: column;
          }
          .brand h1 {
            font-size: 42px;
            letter-spacing: 6px;
          }
          .brand h2 {
            font-size: 28px;
            letter-spacing: 4px;
          }
        }
      `}</style>
    </main>
  );
}

function Card({ number, icon, title, text }) {
  return (
    <div className="card">
      <div className="card-top">
        <div className="card-icon">{icon}</div>
        <div className="card-number">{number}</div>
      </div>

      <div className="card-content">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <button className="card-btn">
        <span>OPEN PANEL →</span>
      </button>
    </div>
  );
}

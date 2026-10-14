"use client";

export default function BestPlayerCard({ data }) {
  const { team, bestPlayer } = data;
  const { player, stats, score } = bestPlayer;

  return (
    <div className="vip-card">
      <div className="energy-border"></div>

      <div className="badge">🏆 BEST PLAYER</div>

      <div className="team">{team.name}</div>

      <div className="avatar-box">
        <div className="ring"></div>
        <img src={player.image} alt={player.ign} />
      </div>

      <h2>{player.ign}</h2>
      <p className="role">{player.role}</p>

      <div className="score">
        <span>PERFORMANCE SCORE</span>
        <strong>{score}</strong>
      </div>

      <div className="stats">
        <div className="stat-box">
          <span className="icon">⚔</span>
          <small>KILLS</small>
          <b>{stats.kills}</b>
        </div>
        <div className="stat-box">
          <span className="icon">💥</span>
          <small>DAMAGE</small>
          <b>{stats.damage}</b>
        </div>
        <div className="stat-box">
          <span className="icon">🎯</span>
          <small>ASSIST</small>
          <b>{stats.assists}</b>
        </div>
        <div className="stat-box">
          <span className="icon">🏆</span>
          <small>MVP</small>
          <b>{stats.mvp}</b>
        </div>
      </div>

      <div className="rank">#1 TEAM PLAYER</div>

      <style jsx>{`
        .vip-card {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 580px;
          padding: 28px 24px;
          border-radius: 28px;
          overflow: hidden;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.08),
            rgba(10, 0, 15, 0.95)
          );
          border: 1px solid rgba(255, 215, 74, 0.35);
          box-shadow:
            0 0 40px rgba(255, 23, 68, 0.18),
            inset 0 0 30px rgba(139, 92, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .vip-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow:
            0 0 70px rgba(255, 215, 74, 0.3),
            0 0 100px rgba(139, 92, 255, 0.2);
          border-color: rgba(255, 215, 74, 0.7);
        }

        /* Animated energy border */
        .energy-border {
          position: absolute;
          inset: -2px;
          border-radius: 30px;
          background: linear-gradient(
            90deg,
            #ff1744,
            #ffd54a,
            #8b5cff,
            #00f5ff,
            #ff1744
          );
          background-size: 300%;
          animation: borderMove 4s linear infinite;
          z-index: -1;
          opacity: 0.7;
        }

        .vip-card:hover .energy-border {
          opacity: 1;
          animation-duration: 2.5s;
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 50px;
          background: rgba(255, 215, 74, 0.12);
          border: 1px solid #ffd54a;
          color: #ffd54a;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          box-shadow: 0 0 20px rgba(255, 215, 74, 0.25);
          animation: pulseGlow 2.5s ease-in-out infinite;
        }

        /* Team name */
        .team {
          margin-top: 18px;
          color: #00f5ff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        /* Avatar */
        .avatar-box {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 22px auto 10px;
          flex-shrink: 0;
        }

        .avatar-box img {
          width: 128px;
          height: 128px;
          object-fit: cover;
          border-radius: 50%;
          position: absolute;
          top: 11px;
          left: 11px;
          border: 4px solid #0a0a0f;
          z-index: 2;
        }

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            #ff1744,
            #ffd54a,
            #8b5cff,
            #00f5ff,
            #ff1744
          );
          animation: spin 3.5s linear infinite;
        }

        h2 {
          margin: 8px 0 4px;
          font-size: 26px;
          font-weight: 800;
          color: white;
          letter-spacing: 1px;
        }

        .role {
          color: #ffd54a;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          margin: 0;
        }

        /* Score box */
        .score {
          width: 100%;
          margin: 22px 0 18px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(255, 23, 68, 0.1);
          border: 1px solid rgba(255, 215, 74, 0.25);
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.12);
        }

        .score span {
          display: block;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 1.5px;
          margin-bottom: 4px;
        }

        .score strong {
          font-size: 48px;
          font-weight: 900;
          color: #ffd54a;
          text-shadow: 0 0 30px rgba(255, 215, 74, 0.6);
          line-height: 1;
        }

        /* Stats grid */
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          margin-top: auto;
        }

        .stat-box {
          padding: 14px 10px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          transition: all 0.3s ease;
        }

        .stat-box:hover {
          background: rgba(255, 215, 74, 0.1);
          border-color: rgba(255, 215, 74, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 215, 74, 0.15);
        }

        .stat-box .icon {
          font-size: 18px;
          margin-bottom: 2px;
        }

        .stat-box small {
          color: rgba(255, 255, 255, 0.45);
          font-size: 10px;
          letter-spacing: 1px;
        }

        .stat-box b {
          font-size: 20px;
          font-weight: 800;
          color: white;
        }

        /* Rank badge */
        .rank {
          margin-top: 20px;
          padding: 10px 22px;
          border-radius: 50px;
          background: rgba(255, 23, 68, 0.15);
          border: 1px solid rgba(255, 23, 68, 0.5);
          font-size: 12px;
          font-weight: 800;
          color: #ff1744;
          letter-spacing: 2px;
          box-shadow: 0 0 20px rgba(255, 23, 68, 0.25);
          animation: pulseRed 2.2s ease-in-out infinite;
        }

        /* Animations */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes borderMove {
          0% { background-position: 0%; }
          100% { background-position: 300%; }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 215, 74, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 215, 74, 0.45);
          }
        }

        @keyframes pulseRed {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 23, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 28px rgba(255, 23, 68, 0.5);
          }
        }

        @media (max-width: 600px) {
          .vip-card {
            min-height: 540px;
          }
          .score strong {
            font-size: 42px;
          }
          h2 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

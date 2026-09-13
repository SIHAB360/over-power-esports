"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyCode(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/register/player";
      } else {
        setMessage(data.message || "Invalid or expired registration code");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="energy-orb orb-one" />
      <div className="energy-orb orb-two" />
      <div className="grid-overlay" />

      <section className="register-card">
        <div className="status-badge">
          <span />
          SECURE ACCESS REQUIRED
        </div>

        <div className="brand-mark">OP</div>

        <small className="eyebrow">OVER POWER ESPORTS</small>

        <h1>
          ENTER THE
          <span> ARENA</span>
        </h1>

        <p className="subtitle">
          Verify your official registration code to unlock the player
          application portal.
        </p>

        <div className="divider">
          <span />
          <b>PLAYER VERIFICATION</b>
          <span />
        </div>

        <form onSubmit={verifyCode}>
          <label htmlFor="registration-code">REGISTRATION CODE</label>

          <div className="input-wrap">
            <span className="input-icon">◈</span>

            <input
              id="registration-code"
              type="text"
              placeholder="ENTER YOUR CODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoComplete="off"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            <span>{loading ? "VERIFYING ACCESS" : "CONTINUE TO REGISTRATION"}</span>
            <b>{loading ? "..." : "→"}</b>
          </button>
        </form>

        {message && (
          <div className="error-message">
            <span>!</span>
            {message}
          </div>
        )}

        <div className="security-note">
          <span>◉</span>
          Your registration access is protected and verified securely.
        </div>
      </section>

      <style jsx>{`
        .register-page {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          overflow: hidden;
          padding: 30px 18px;
          color: #fff;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255, 20, 65, 0.3),
              transparent 38%
            ),
            linear-gradient(135deg, #050507, #260008 50%, #030305);
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.18;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255, 30, 70, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 30, 70, 0.08) 1px, transparent 1px);
          background-size: 45px 45px;
          mask-image: linear-gradient(to bottom, #000, transparent);
        }

        .energy-orb {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.24;
          pointer-events: none;
          animation: floatOrb 6s ease-in-out infinite alternate;
        }

        .orb-one {
          top: 8%;
          left: -130px;
          background: #ff003c;
        }

        .orb-two {
          right: -140px;
          bottom: 5%;
          background: #a00025;
          animation-delay: 2s;
        }

        .register-card {
          position: relative;
          z-index: 2;
          width: min(560px, 100%);
          padding: 48px 46px;
          overflow: hidden;
          text-align: center;
          border: 1px solid rgba(255, 25, 70, 0.65);
          border-radius: 26px;
          background:
            linear-gradient(
              145deg,
              rgba(45, 5, 15, 0.96),
              rgba(8, 8, 12, 0.98)
            );
          box-shadow:
            0 0 35px rgba(255, 0, 50, 0.2),
            0 0 100px rgba(255, 0, 50, 0.08),
            inset 0 0 45px rgba(255, 0, 50, 0.07);
        }

        .register-card::before {
          position: absolute;
          top: 0;
          left: -100%;
          width: 75%;
          height: 2px;
          content: "";
          background: linear-gradient(
            90deg,
            transparent,
            #ff174d,
            #ff9bad,
            #ff174d,
            transparent
          );
          box-shadow: 0 0 18px #ff174d;
          animation: scanLine 4s linear infinite;
        }

        .register-card::after {
          position: absolute;
          top: -100px;
          left: 50%;
          width: 220px;
          height: 220px;
          content: "";
          transform: translateX(-50%);
          border-radius: 50%;
          background: #ff174d;
          filter: blur(100px);
          opacity: 0.1;
          pointer-events: none;
        }

        .status-badge {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 26px;
          padding: 8px 14px;
          color: #ff6381;
          border: 1px solid rgba(255, 40, 80, 0.5);
          border-radius: 30px;
          background: rgba(255, 20, 60, 0.1);
          font-family: var(--font-orbitron), sans-serif;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .status-badge span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ff174d;
          box-shadow: 0 0 12px #ff174d;
          animation: blink 1.2s infinite;
        }

        .brand-mark {
          position: relative;
          z-index: 2;
          display: grid;
          width: 66px;
          height: 66px;
          margin: 0 auto 18px;
          place-items: center;
          color: #fff;
          border: 2px solid #ff244b;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff174d, #650018);
          box-shadow:
            0 0 18px #ff174d,
            0 0 40px rgba(255, 20, 65, 0.55),
            inset 0 0 15px rgba(255, 255, 255, 0.25);
          font-family: var(--font-orbitron), sans-serif;
          font-size: 20px;
          font-weight: 900;
          animation: logoGlow 2s ease-in-out infinite;
        }

        .eyebrow {
          position: relative;
          z-index: 2;
          color: #ff3157;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 3px;
          text-shadow: 0 0 14px #ff3157;
        }

        h1 {
          position: relative;
          z-index: 2;
          margin: 14px 0;
          color: #fff;
          font-family: var(--font-orbitron), sans-serif;
          font-size: clamp(30px, 6vw, 48px);
          line-height: 1.1;
          letter-spacing: 2px;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }

        h1 span {
          color: #ff244b;
          text-shadow:
            0 0 10px #ff174d,
            0 0 28px rgba(255, 20, 65, 0.75);
        }

        .subtitle {
          position: relative;
          z-index: 2;
          max-width: 420px;
          margin: 0 auto;
          color: #bcbcc5;
          font-size: 14px;
          line-height: 1.8;
        }

        .divider {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 30px 0 24px;
        }

        .divider span {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ff174d);
          box-shadow: 0 0 10px #ff174d;
        }

        .divider span:last-child {
          background: linear-gradient(90deg, #ff174d, transparent);
        }

        .divider b {
          color: #ff5270;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        form {
          position: relative;
          z-index: 2;
          text-align: left;
        }

        label {
          display: block;
          margin-bottom: 9px;
          color: #ff5270;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .input-icon {
          position: absolute;
          left: 17px;
          z-index: 1;
          color: #ff3157;
          font-size: 17px;
          text-shadow: 0 0 12px #ff3157;
        }

        input {
          width: 100%;
          height: 56px;
          padding: 0 18px 0 48px;
          color: #fff;
          outline: none;
          border: 1px solid rgba(255, 60, 90, 0.5);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.06);
          font-family: var(--font-orbitron), sans-serif;
          font-size: 12px;
          letter-spacing: 1px;
          transition: 0.3s ease;
        }

        input::placeholder {
          color: #777782;
        }

        input:focus {
          border-color: #ff174d;
          background: rgba(255, 20, 60, 0.1);
          box-shadow:
            0 0 15px rgba(255, 20, 60, 0.3),
            inset 0 0 15px rgba(255, 20, 60, 0.06);
        }

        button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 56px;
          padding: 0 20px;
          color: #fff;
          cursor: pointer;
          border: 1px solid #ff496d;
          border-radius: 11px;
          background: linear-gradient(100deg, #d90732, #ff3155);
          box-shadow:
            0 0 20px rgba(255, 20, 55, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          font-family: var(--font-orbitron), sans-serif;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
          transition: 0.35s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow:
            0 0 30px rgba(255, 20, 55, 0.8),
            0 0 60px rgba(255, 20, 55, 0.25);
        }

        button:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        button b {
          font-size: 22px;
        }

        .error-message {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 18px;
          padding: 12px;
          color: #ff758f;
          border: 1px solid rgba(255, 30, 70, 0.45);
          border-radius: 9px;
          background: rgba(255, 20, 60, 0.1);
          font-size: 12px;
        }

        .error-message span {
          display: grid;
          width: 20px;
          height: 20px;
          place-items: center;
          border-radius: 50%;
          background: #ff174d;
          color: #fff;
          font-weight: 900;
        }

        .security-note {
          position: relative;
          z-index: 2;
          margin-top: 25px;
          color: #777782;
          font-size: 11px;
        }

        .security-note span {
          margin-right: 6px;
          color: #35e878;
          text-shadow: 0 0 10px #35e878;
        }

        @keyframes scanLine {
          0% {
            left: -100%;
          }

          100% {
            left: 130%;
          }
        }

        @keyframes floatOrb {
          0% {
            transform: translateY(0) scale(1);
          }

          100% {
            transform: translateY(35px) scale(1.15);
          }
        }

        @keyframes blink {
          50% {
            opacity: 0.25;
          }
        }

        @keyframes logoGlow {
          0%,
          100% {
            box-shadow:
              0 0 18px #ff174d,
              0 0 35px rgba(255, 20, 65, 0.55);
          }

          50% {
            box-shadow:
              0 0 25px #ff174d,
              0 0 55px rgba(255, 20, 65, 0.9);
          }
        }

        @media (max-width: 520px) {
          .register-card {
            padding: 36px 22px;
          }

          h1 {
            font-size: 29px;
          }

          .subtitle {
            font-size: 13px;
          }

          .status-badge {
            font-size: 8px;
          }
        }
      `}</style>
    </main>
  );
}

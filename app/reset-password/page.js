"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";
import styles from "../login/login.module.css";

export default function ResetPasswordPage() {
  const [theme, setTheme] = useState("light");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("op-login-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

    let active = true;
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      setHasRecoverySession(Boolean(data && data.session));
      setChecking(false);
      if (error) {
        setNotice({ type: "error", text: error.message });
      }
    };

    checkSession();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) setHasRecoverySession(true);
      if (event === "SIGNED_OUT") setHasRecoverySession(false);
      setChecking(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem("op-login-theme", nextTheme);
    setTheme(nextTheme);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!hasRecoverySession) {
      setNotice({
        type: "error",
        text: "This reset link is invalid or has expired. Return to login and request a new link."
      });
      return;
    }

    if (password.length < 8) {
      setNotice({ type: "error", text: "Choose a password with at least 8 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setNotice({ type: "error", text: "The passwords do not match. Please check them and try again." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setNotice({ type: "error", text: error.message });
        return;
      }

      await supabase.auth.signOut();
      setComplete(true);
      setNotice({ type: "success", text: "Your password has been updated. You can now sign in with your new password." });
    } catch (error) {
      setNotice({ type: "error", text: error && error.message ? error.message : "Unable to update your password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={[styles.page, theme === "dark" ? styles.dark : styles.light].join(" ")}>
      <div className={[styles.glow, styles.glowOne].join(" ")} aria-hidden="true" />
      <div className={[styles.glow, styles.glowTwo].join(" ")} aria-hidden="true" />
      <div className={[styles.glow, styles.glowThree].join(" ")} aria-hidden="true" />

      <button
        type="button"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        aria-pressed={theme === "dark"}
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        <span className={styles.themeIcon} aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
      </button>

      <div className={styles.shell}>
        <section className={styles.brandPanel} aria-label="Over Power Esports">
          <div className={styles.brandKicker}><span className={styles.kickerDot} /> SECURE PLAYER ACCESS</div>
          <h2 className={styles.brandWords}>OVER POWER<span className={styles.brandAccent}>ESPORTS</span></h2>
          <div className={styles.brandRule} />
          <p className={styles.brandDescription}>A stronger account starts with a secure password.</p>
          <div className={styles.brandFooter}>
            <span className={styles.brandMark}>OP</span>
            <span>PLAY. COMPETE. GROW TOGETHER.</span>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="reset-title">
          <header className={styles.formHeader}>
            <div className={styles.logoFrame}>
              <Image src={logo} alt="Over Power Esports logo" className={styles.logoImage} priority />
            </div>
            <div className={styles.eyebrow}>OVER POWER ESPORTS</div>
            <h1 className={styles.title} id="reset-title">CREATE NEW PASSWORD</h1>
            <p className={styles.subtitle}>Choose a new password to securely return to your player account.</p>
          </header>

          {checking ? (
            <p className={[styles.notice, styles.noticeSuccess].join(" ")} role="status">Checking your secure reset link…</p>
          ) : complete ? (
            <div className={styles.form}>
              {notice && <p className={[styles.notice, notice.type === "success" ? styles.noticeSuccess : styles.noticeError].join(" ")} role="status">{notice.text}</p>}
              <button type="button" className={styles.primaryButton} onClick={() => window.location.assign("/login")}>
                <span className={styles.buttonText}>BACK TO LOGIN</span>
                <span className={styles.buttonArrow} aria-hidden="true">↗</span>
              </button>
            </div>
          ) : !hasRecoverySession ? (
            <div className={styles.form}>
              <p className={[styles.notice, styles.noticeError].join(" ")} role="alert">
                This reset link is invalid or has expired. Return to login and use “Forgot Password?” to request a fresh link.
              </p>
              <button type="button" className={styles.primaryButton} onClick={() => window.location.assign("/login")}>
                <span className={styles.buttonText}>RETURN TO LOGIN</span>
                <span className={styles.buttonArrow} aria-hidden="true">↗</span>
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="new-password">New password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </span>
                  <input id="new-password" className={styles.input} type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="confirm-password">Confirm new password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </span>
                  <input id="confirm-password" className={styles.input} type="password" autoComplete="new-password" placeholder="Enter the password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} />
                </div>
              </div>

              {notice && <p className={[styles.notice, notice.type === "success" ? styles.noticeSuccess : styles.noticeError].join(" ")} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</p>}

              <button className={styles.primaryButton} type="submit" disabled={loading}>
                <span className={styles.buttonText}>{loading ? "UPDATING PASSWORD…" : "UPDATE PASSWORD"}</span>
                <span className={styles.buttonArrow} aria-hidden="true">↗</span>
              </button>
            </form>
          )}

          <footer className={styles.footer}>
            <div className={styles.footerLine} />
            PLAY • COMPETE • GROW TOGETHER
          </footer>
        </section>
      </div>
    </main>
  );
}

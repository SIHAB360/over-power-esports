"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";
import styles from "./login.module.css";

const REMEMBER_EMAIL_KEY = "op-login-email";
const THEME_KEY = "op-login-theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("light");
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
    const savedTheme = window.localStorage.getItem(THEME_KEY);

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem(THEME_KEY, nextTheme);
    setTheme(nextTheme);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setNotice(null);
    setLoading(true);

    try {
      window.localStorage.setItem("op-remember-session", rememberMe ? "true" : "false");
      if (!rememberMe) window.localStorage.removeItem(REMEMBER_EMAIL_KEY);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setNotice({ type: "error", text: error.message });
        return;
      }

      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setNotice({
          type: "error",
          text: "Your player profile could not be found. Please contact an administrator."
        });
        return;
      }

      const role = String(profile.role || "").toLowerCase();

      if (role === "admin") {
        window.location.assign("/admin/dashboard");
        return;
      }

      if (role === "player") {
        window.location.assign("/player/dashboard");
        return;
      }

      await supabase.auth.signOut();
      setNotice({ type: "error", text: "This account does not have a valid player or admin role." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error && error.message ? error.message : "Unable to sign in right now. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!email.trim()) {
      setNotice({ type: "error", text: "Enter your account email address first." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/reset-password"
      });

      if (error) {
        setNotice({ type: "error", text: error.message });
        return;
      }

      setNotice({
        type: "success",
        text: "If an account exists for this email, a password reset link will be sent. Please check your inbox."
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error && error.message ? error.message : "Unable to send the reset email. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setMode("login");
    setNotice(null);
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
          <div className={styles.brandKicker}><span className={styles.kickerDot} /> OFFICIAL PLAYER PORTAL</div>
          <h2 className={styles.brandWords}>OVER POWER<span className={styles.brandAccent}>ESPORTS</span></h2>
          <div className={styles.brandRule} />
          <p className={styles.brandDescription}>Your next chapter starts here. Sign in, sharpen your skills, and compete with the Over Power community.</p>
          <div className={styles.brandFooter}>
            <span className={styles.brandMark}>OP</span>
            <span>PLAY. COMPETE. GROW TOGETHER.</span>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="login-title">
          <header className={styles.formHeader}>
            <div className={styles.logoFrame}>
              <Image src={logo} alt="Over Power Esports logo" className={styles.logoImage} priority />
            </div>
            <div className={styles.eyebrow}>OVER POWER ESPORTS</div>
            <h1 className={styles.title} id="login-title">{mode === "forgot" ? "FORGOT PASSWORD?" : "WELCOME BACK"}</h1>
            <p className={styles.subtitle}>
              {mode === "forgot"
                ? "Enter the email linked to your account and we’ll send a secure reset link."
                : "Sign in to continue to your player account."}
            </p>
          </header>

          <form className={styles.form} onSubmit={mode === "forgot" ? handleForgotPassword : handleLogin}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="login-email">Email address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m5 7 7 5.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            {mode === "login" && (
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="login-password">Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="4.5" y="10" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.8 4.5 9.5 6.1a1.9 1.9 0 0 1 0 1.8 12.7 12.7 0 0 1-3.2 3.8M6.2 6.2a13.3 13.3 0 0 0-3.7 4.9 1.9 1.9 0 0 0 0 1.8C3.2 14.5 6.8 19 12 19c.9 0 1.8-.2 2.6-.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className={styles.formOptions}>
                <label className={styles.remember}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className={styles.forgotLink} onClick={() => { setMode("forgot"); setNotice(null); }}>
                  Forgot Password?
                </button>
              </div>
            )}

            {notice && (
              <p className={[styles.notice, notice.type === "success" ? styles.noticeSuccess : styles.noticeError].join(" ")} role={notice.type === "error" ? "alert" : "status"}>
                {notice.text}
              </p>
            )}

            <button className={styles.primaryButton} type="submit" disabled={loading}>
              <span className={styles.buttonText}>
                {loading
                  ? (mode === "forgot" ? "SENDING RESET LINK…" : "SIGNING IN…")
                  : (mode === "forgot" ? "SEND RESET LINK" : "LOGIN")}
              </span>
              <span className={styles.buttonArrow} aria-hidden="true">↗</span>
            </button>

            {mode === "forgot" && (
              <button type="button" className={styles.backLink} onClick={switchToLogin}>
                ← Back to login
              </button>
            )}
          </form>

          <footer className={styles.footer}>
            <div className={styles.footerLine} />
            PLAY • COMPETE • GROW TOGETHER
          </footer>
        </section>
      </div>
    </main>
  );
}

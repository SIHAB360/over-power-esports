"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../player/dashboard/PlayerWithdrawal.module.css";

const money = (value) => {
  const n = Number(value);
  return Number.isFinite(n)
    ? "৳" + n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";
};

const dates = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
};

const maskNumber = (value) =>
  typeof value === "string" && /^01[3-9][0-9]{8}$/.test(value)
    ? value.slice(0, 3) + "•••••" + value.slice(-3)
    : "Hidden";

const statuses = {
  pending: { title: "Under Review", note: "Awaiting admin approval" },
  approved: { title: "Approved", note: "Waiting for payment transfer" },
  paid: { title: "Paid", note: "Payment confirmed by admin" },
  rejected: { title: "Rejected", note: "Funds returned to available balance" },
};

export default function PlayerWithdrawal() {
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [provider, setProvider] = useState("bkash");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [accepted, setAccepted] = useState(false);
  const mounted = useRef(false);
  const submitting = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (!silent && mounted.current) setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) throw new Error("Please sign in again.");
      const response = await fetch("/api/player/wallet", {
        method: "GET",
        cache: "no-store",
        headers: { Authorization: "Bearer " + session.access_token },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.wallet) {
        if (response.status === 503) {
          if (mounted.current) {
            setEnabled(false);
            setError("Withdrawal service is temporarily unavailable. Your earnings are safe.");
          }
          return;
        }
        throw new Error(body?.message || "Unable to load wallet details.");
      }
      if (!mounted.current) return;
      setWallet(body.wallet);
      setHistory(Array.isArray(body.withdrawals) ? body.withdrawals : []);
      setEnabled(true);
      setError("");
    } catch (err) {
      if (mounted.current) {
        setEnabled(false);
        setError(err?.message || "Unable to load wallet details.");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  const available = Number(wallet?.available_balance || 0);
  const reserved = Number(wallet?.reserved_withdrawals || 0);
  const hasActive = history.some((item) => ["pending", "approved"].includes(item.status));
  const amountValid = /^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(amount);
  const requested = amountValid ? Number(amount) : 0;
  const numberValid = /^01[3-9][0-9]{8}$/.test(number.replace(/\s+/g, ""));
  const canSubmit = enabled && !loading && !busy && !hasActive
    && amountValid && requested > 0 && requested <= available && numberValid && accepted;

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setFeedback("");
    setError("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) throw new Error("Sign in to request a withdrawal.");
      const response = await fetch("/api/player/withdrawals", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: "Bearer " + session.access_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          receiverNumber: number.replace(/\s+/g, ""),
          amount,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.message || "Unable to submit your withdrawal.");
      if (mounted.current) {
        setFeedback("Your withdrawal request was submitted. Money will not be transferred until the admin approves and pays it.");
        setAmount("");
        setNumber("");
        setAccepted(false);
        // Server is authoritative for both available balance and history.
        await load(true);
      }
    } catch (err) {
      if (mounted.current) setError(err?.message || "Withdrawal request failed.");
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <section id="player-withdrawal" data-provider={provider} className={styles.shell} aria-labelledby="op-wallet-title">
      <div className={styles.topGlow} aria-hidden="true" />
      <div className={styles.header}>
        <div>
          <p className={styles.overline}><span className={styles.led} /> PLAYER FINANCE / SECURE WALLET</p>
          <h2 id="op-wallet-title">Earnings & <span>Withdrawals</span></h2>
          <p className={styles.subtitle}>Review your earnings and request bKash or Nagad payouts.</p>
        </div>
        <button type="button" className={styles.refresh} onClick={() => load()} disabled={loading || busy} aria-label="Refresh Wallet">
          <span aria-hidden="true">↻</span> {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      {error && <div className={styles.warning} role="status">{error}</div>}
      {feedback && <div className={styles.success} role="status">{feedback}</div>}

      <div className={styles.statGrid}>
        <article className={[styles.stat, styles.primaryStat].join(" ")}>
          <span>Available Balance</span>
          <strong>{enabled ? money(available) : "—"}</strong>
          <small>অনিষ্পন্ন ও Paid উত্তোলন বাদ দেওয়ার পর</small>
        </article>
        <article className={styles.stat}>
          <span>Total Net Earnings</span>
          <strong>{enabled ? money(wallet?.net_earnings) : "—"}</strong>
          <small>Based on completed matches</small>
        </article>
        <article className={styles.stat}>
          <span>Pending Amount</span>
          <strong>{enabled ? money(reserved) : "—"}</strong>
          <small>অনুমোদনের অপেক্ষায় বা Approved অনুরোধ</small>
        </article>
        <article className={styles.stat}>
          <span>মোট Paid টাকা</span>
          <strong>{enabled ? money(wallet?.paid_withdrawals) : "—"}</strong>
          <small>Confirmed payouts</small>
        </article>
      </div>

      <div className={styles.mainGrid}>
        <form className={styles.withdrawForm} onSubmit={submit} autoComplete="off">
          <div className={styles.panelHeading}>
            <span className={styles.step}>01</span>
            <div><h3>Request Withdrawal</h3><p>Choose your preferred mobile wallet.</p></div>
          </div>
          {hasActive && <div className={styles.info} role="status">আপনার একটি অনুরোধ সক্রিয় রয়েছে। সেটি পরিশোধ বা Rejected হওয়ার পর নতুন অনুরোধ করুন।</div>}

          <fieldset disabled={!enabled || busy || hasActive} className={styles.methods}>
            <legend>Select Payment Method</legend>
            <label className={[styles.method, provider === "bkash" ? styles.activePink : ""].join(" ")}>
              <input type="radio" name="paymentMethod" value="bkash" checked={provider === "bkash"} onChange={() => setProvider("bkash")} />
              <span className={styles.providerIdentity}><img className={styles.providerLogo} src="data:image/webp;base64,UklGRnQBAABXRUJQVlA4IGgBAABQCACdASocABwAPpFCnEqlo6KhqAgAsBIJbAC+cII4BYALYz/QDWAPQA/YDrQiVVeTD6DDOkr/8ifygNc1CmIZ7MgfzkwhcE11I4AA/rcKutRZaemt+kFwkd4fezZGH/zWjBdkJsNx/nCWdBcAV6IsRVZ5ajIXMZW51a/EjelJrOAW2P/x1UoApFU/5egv6t7//BQKzprw9ZgCYdGiUyIx78aknbsbb6HYWlE4voeX/gka+QkDSRs23frEOrxbUZimOl58PRF+5/THVUeu32of5YDZ7Arc2vz/xQWhhh7nMdpKJJMYj/GKVK79+eXPoaf2YXVhVNslvrnrhnXIEU1UmFV7kxaFel3WAP4uHgxDSJ1u9o9vr7SiIApjoiX96RmodBs2vh58G7HEoI4v0To/NTZSXCO9/RyYizOWF2rtBDwgNyFa940ugfKeRXtrydeNuVk/6TzvfG5+Z9k9od/ByYopWpBbUAA=" alt="" loading="lazy" /><span><strong>bKash</strong><small>Personal Account</small></span></span>
            </label>
            <label className={[styles.method, provider === "nagad" ? styles.activeOrange : ""].join(" ")}>
              <input type="radio" name="paymentMethod" value="nagad" checked={provider === "nagad"} onChange={() => setProvider("nagad")} />
              <span className={styles.providerIdentity}><img className={styles.providerLogo} src="data:image/webp;base64,UklGRn4BAABXRUJQVlA4IHIBAADwBwCdASocABwAPoE2lEelIyIhN/qoAKAQCWwAnTKEdXeZp4l3lFu3FYf+kRkyYJcWTsK2Ik8D6cDCsclU/EYQn+V9o3LK5KAA/uu+g1YVVnxosunEWsftb34Y/UCVuXEj/mI2sIGJv8N0oYELAruUPQy9aHd2/t2NAAdixzczA//PfV+fZILHfhXgDfe1pbIhZFkt5ZzdPaU98z5q3ns6QSnp8emyOHMe1FeY61/5i5tls6KiGvpKwNYHnMxaRpJTdv1YAD7Ry9u8FTar/k7zwO7hGXgR2negBxrZ6rQGll9ViCBXUAp0wVrXcVvLju0lUVNkpsmxJNX8hfBd0ApR9n4S299d0+heXfsNKFP+OWOQsozeE/54bJiUoC9LnxG8WbaCEyvUfq2UTu8fMUkeziSUUlC5mIWvzIe2WzPtAJPy1J8iic9ff5xTZ/Tn/xJVgN+xV7gKVJYtrff6r+6vKOKCRA8P0jb/xAfH/4XaAAAA" alt="" loading="lazy" /><span><strong>Nagad</strong><small>Personal Account</small></span></span>
            </label>
          </fieldset>

          <label className={styles.field}>
            <span>Recipient Mobile Number</span>
            <input type="tel" inputMode="numeric" autoComplete="off" placeholder="01XXXXXXXXX" maxLength={11}
              pattern="01[3-9][0-9]{8}" value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              disabled={!enabled || busy || hasActive} aria-invalid={number.length > 0 && !numberValid} />
            <small>Enter the correct number to receive your payment.</small>
          </label>

          <label className={styles.field}>
            <span>Withdrawal Amount (BDT)</span>
            <input type="text" inputMode="decimal" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, "").slice(0, 16))}
              disabled={!enabled || busy || hasActive} aria-invalid={amount.length > 0 && (!amountValid || requested > available || requested <= 0)} />
            <small>Current Balance: {enabled ? money(available) : "—"}</small>
          </label>

          <div className={styles.feeNotice}>
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>TRANSFER CHARGE Paid BY PLAYER</strong>
              <p>Actual bKash/Nagad transfer charges are deducted from your withdrawal amount. You receive the remainder. After payment, the admin records the actual fee and transaction reference. No fixed fee rate is assumed.</p>
            </div>
          </div>

          <label className={styles.consent}>
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={!enabled || busy || hasActive} />
            <span>I confirm the recipient number is correct and accept actual transfer charges.</span>
          </label>

          <button type="submit" className={styles.submit} disabled={!canSubmit}>
            {busy ? "Submitting..." : !enabled ? "Withdrawals unavailable" : hasActive ? "An active request exists" : "Request Withdrawal"}
            <span aria-hidden="true">→</span>
          </button>
          <p className={styles.formFooter}>Admin approval is required. Approval alone does not mean payment was sent.</p>
        </form>

        <div className={styles.history}>
          <div className={styles.panelHeading}>
            <span className={styles.step}>02</span>
            <div><h3>Withdrawal History</h3><p>Your 25 latest requests and payment updates.</p></div>
          </div>
          {loading ? (
            <p className={styles.empty}>Withdrawal History Loading...</p>
          ) : !enabled ? (
            <p className={styles.empty}>History will appear when withdrawal service is available.</p>
          ) : history.length === 0 ? (
            <div className={styles.emptyBox}>
              <span aria-hidden="true">◇</span>
              <strong>No Withdrawals Yet</strong>
              <p>Your first withdrawal will appear here.</p>
            </div>
          ) : (
            <ul className={styles.historyList}>
              {history.map((item) => {
                const status = statuses[item.status] || { title: "Unknown", note: "Awaiting update" };
                return (
                  <li key={item.id} className={styles.historyRow}>
                    <div className={styles.historyTop}>
                      <span className={styles.historyAmount}>{money(item.amount)}</span>
                      <span className={[styles.status, styles[item.status] || ""].join(" ")}>{status.title}</span>
                    </div>
                    <div className={styles.historyMeta}>
                      <span>{item.provider === "nagad" ? "Nagad" : "bKash"} · {maskNumber(item.receiver_number)}</span>
                      <span>{dates(item.created_at)}</span>
                    </div>
                    <small className={styles.statusNote}>{status.note}</small>
                    {item.status === "paid" && (
                      <div className={styles.paymentDetail}>
                        <span>Fee {money(item.transfer_fee)}</span>
                        <span>Received {money(item.net_payout)}</span>
                        <span>Transaction ID: {item.transaction_reference || "—"}</span>
                      </div>
                    )}
                    {item.status === "rejected" && item.rejection_reason && (
                      <p className={styles.rejectReason}>Reason: {item.rejection_reason}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className={styles.disclaimer}>
            <span aria-hidden="true">🔒</span>
            <p>Only your wallet information is shown here. Never share your bKash/Nagad PIN, OTP or login password.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

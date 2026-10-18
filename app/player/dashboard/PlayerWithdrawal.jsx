"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./PlayerWithdrawal.module.css";

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
  pending: { title: "PENDING REVIEW", note: "Awaiting admin review" },
  approved: { title: "APPROVED", note: "Awaiting manual payment" },
  paid: { title: "PAID", note: "Admin confirmed payout" },
  rejected: { title: "REJECTED", note: "Amount returned to available wallet" },
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
            setError("Withdrawals are being prepared. Your earnings remain safely recorded.");
          }
          return;
        }
        throw new Error(body?.message || "Unable to load wallet.");
      }
      if (!mounted.current) return;
      setWallet(body.wallet);
      setHistory(Array.isArray(body.withdrawals) ? body.withdrawals : []);
      setEnabled(true);
      setError("");
    } catch (err) {
      if (mounted.current) {
        setEnabled(false);
        setError(err?.message || "Unable to load wallet.");
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
      if (!response.ok) throw new Error(body?.message || "Request could not be submitted.");
      if (mounted.current) {
        setFeedback("Your withdrawal request is pending admin review. No money has been sent yet.");
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
    <section id="player-withdrawal" className={styles.shell} aria-labelledby="op-wallet-title">
      <div className={styles.topGlow} aria-hidden="true" />
      <div className={styles.header}>
        <div>
          <p className={styles.overline}><span className={styles.led} /> PLAYER FINANCE / SECURE WALLET</p>
          <h2 id="op-wallet-title">EARNINGS & <span>WITHDRAWALS</span></h2>
          <p className={styles.subtitle}>Track completed-match earnings. Request a manual bKash or Nagad payout.</p>
        </div>
        <button type="button" className={styles.refresh} onClick={() => load()} disabled={loading || busy} aria-label="Refresh wallet and withdrawals">
          <span aria-hidden="true">↻</span> {loading ? "LOADING" : "REFRESH"}
        </button>
      </div>

      {error && <div className={styles.warning} role="status">{error}</div>}
      {feedback && <div className={styles.success} role="status">{feedback}</div>}

      <div className={styles.statGrid}>
        <article className={[styles.stat, styles.primaryStat].join(" ")}>
          <span>AVAILABLE BALANCE</span>
          <strong>{enabled ? money(available) : "—"}</strong>
          <small>Completed earnings, less pending and paid withdrawals</small>
        </article>
        <article className={styles.stat}>
          <span>LIFETIME NET EARNINGS</span>
          <strong>{enabled ? money(wallet?.net_earnings) : "—"}</strong>
          <small>Based on completed matches</small>
        </article>
        <article className={styles.stat}>
          <span>RESERVED AMOUNT</span>
          <strong>{enabled ? money(reserved) : "—"}</strong>
          <small>Pending or approved requests</small>
        </article>
        <article className={styles.stat}>
          <span>TOTAL PAID OUT</span>
          <strong>{enabled ? money(wallet?.paid_withdrawals) : "—"}</strong>
          <small>Confirmed manual payouts</small>
        </article>
      </div>

      <div className={styles.mainGrid}>
        <form className={styles.withdrawForm} onSubmit={submit} autoComplete="off">
          <div className={styles.panelHeading}>
            <span className={styles.step}>01</span>
            <div><h3>REQUEST WITHDRAWAL</h3><p>Your money, your preferred mobile wallet.</p></div>
          </div>
          {hasActive && <div className={styles.info} role="status">One request is already pending or approved. You can submit another after it is paid or rejected.</div>}

          <fieldset disabled={!enabled || busy || hasActive} className={styles.methods}>
            <legend>SELECT PAYMENT METHOD</legend>
            <label className={[styles.method, provider === "bkash" ? styles.activePink : ""].join(" ")}>
              <input type="radio" name="paymentMethod" value="bkash" checked={provider === "bkash"} onChange={() => setProvider("bkash")} />
              <strong>bKash</strong><small>Personal wallet</small>
            </label>
            <label className={[styles.method, provider === "nagad" ? styles.activeOrange : ""].join(" ")}>
              <input type="radio" name="paymentMethod" value="nagad" checked={provider === "nagad"} onChange={() => setProvider("nagad")} />
              <strong>Nagad</strong><small>Personal wallet</small>
            </label>
          </fieldset>

          <label className={styles.field}>
            <span>RECEIVER NUMBER</span>
            <input type="tel" inputMode="numeric" autoComplete="off" placeholder="01XXXXXXXXX" maxLength={11}
              pattern="01[3-9][0-9]{8}" value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              disabled={!enabled || busy || hasActive} aria-invalid={number.length > 0 && !numberValid} />
            <small>Enter the exact number where the admin will send your payout.</small>
          </label>

          <label className={styles.field}>
            <span>REQUEST AMOUNT (BDT)</span>
            <input type="text" inputMode="decimal" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, "").slice(0, 16))}
              disabled={!enabled || busy || hasActive} aria-invalid={amount.length > 0 && (!amountValid || requested > available || requested <= 0)} />
            <small>Available now: {enabled ? money(available) : "—"}</small>
          </label>

          <div className={styles.feeNotice}>
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>TRANSFER CHARGE PAID BY PLAYER</strong>
              <p>The actual bKash/Nagad transfer charge is paid by you and deducted from your requested amount. You receive the remaining amount after the charge. After sending payment, the admin records the actual charge and transaction ID. No fixed charge rate has been set.</p>
            </div>
          </div>

          <label className={styles.consent}>
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={!enabled || busy || hasActive} />
            <span>I confirm the receiver number is correct and understand that the actual transfer fee will reduce my payout.</span>
          </label>

          <button type="submit" className={styles.submit} disabled={!canSubmit}>
            {busy ? "SUBMITTING..." : !enabled ? "WITHDRAWALS NOT YET ENABLED" : hasActive ? "REQUEST ALREADY ACTIVE" : "REQUEST WITHDRAWAL"}
            <span aria-hidden="true">→</span>
          </button>
          <p className={styles.formFooter}>Admin approval is required. Approval does not mean payment was sent.</p>
        </form>

        <div className={styles.history}>
          <div className={styles.panelHeading}>
            <span className={styles.step}>02</span>
            <div><h3>WITHDRAWAL HISTORY</h3><p>Your latest 25 requests and payment updates.</p></div>
          </div>
          {loading ? (
            <p className={styles.empty}>Loading your withdrawal history...</p>
          ) : !enabled ? (
            <p className={styles.empty}>Wallet history will appear here once the secure withdrawal service is enabled.</p>
          ) : history.length === 0 ? (
            <div className={styles.emptyBox}>
              <span aria-hidden="true">◇</span>
              <strong>No withdrawals yet</strong>
              <p>Your first request will appear here after submission.</p>
            </div>
          ) : (
            <ul className={styles.historyList}>
              {history.map((item) => {
                const status = statuses[item.status] || { title: "UNKNOWN", note: "Awaiting an update" };
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
                        <span>Charge {money(item.transfer_fee)}</span>
                        <span>Received {money(item.net_payout)}</span>
                        <span>Transaction ref: {item.transaction_reference || "—"}</span>
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
            <p>Only your own wallet information is available here. Never share your bKash/Nagad PIN, OTP or login password.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

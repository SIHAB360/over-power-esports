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
    : "গোপন";

const statuses = {
  pending: { title: "পর্যালোচনাধীন", note: "অ্যাডমিনের অনুমোদনের অপেক্ষায়" },
  approved: { title: "অনুমোদিত", note: "পেমেন্ট পাঠানোর অপেক্ষায়" },
  paid: { title: "পরিশোধিত", note: "অ্যাডমিন পেমেন্ট নিশ্চিত করেছেন" },
  rejected: { title: "বাতিল", note: "টাকা উপলব্ধ ব্যালেন্সে ফেরত দেওয়া হয়েছে" },
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
      if (sessionError || !session?.access_token) throw new Error("আবার লগইন করুন।");
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
            setError("উত্তোলন সেবা এখনো চালু হয়নি। আপনার আয়ের হিসাব অক্ষত রয়েছে।");
          }
          return;
        }
        throw new Error(body?.message || "ওয়ালেটের তথ্য পাওয়া যায়নি।");
      }
      if (!mounted.current) return;
      setWallet(body.wallet);
      setHistory(Array.isArray(body.withdrawals) ? body.withdrawals : []);
      setEnabled(true);
      setError("");
    } catch (err) {
      if (mounted.current) {
        setEnabled(false);
        setError(err?.message || "ওয়ালেটের তথ্য পাওয়া যায়নি।");
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
      if (sessionError || !session?.access_token) throw new Error("উত্তোলনের অনুরোধ করতে লগইন করুন।");
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
      if (!response.ok) throw new Error(body?.message || "উত্তোলনের অনুরোধ জমা হয়নি।");
      if (mounted.current) {
        setFeedback("আপনার উত্তোলনের অনুরোধ জমা হয়েছে। অ্যাডমিন অনুমোদন ও পেমেন্ট না করা পর্যন্ত টাকা পাঠানো হবে না।");
        setAmount("");
        setNumber("");
        setAccepted(false);
        // Server is authoritative for both available balance and history.
        await load(true);
      }
    } catch (err) {
      if (mounted.current) setError(err?.message || "উত্তোলনের অনুরোধ ব্যর্থ হয়েছে।");
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
          <p className={styles.overline}><span className={styles.led} /> প্লেয়ার ফাইন্যান্স / সুরক্ষিত ওয়ালেট</p>
          <h2 id="op-wallet-title">আয় ও <span>উত্তোলন</span></h2>
          <p className={styles.subtitle}>আপনার আয়ের হিসাব দেখুন এবং বিকাশ বা নগদে পেমেন্টের অনুরোধ করুন।</p>
        </div>
        <button type="button" className={styles.refresh} onClick={() => load()} disabled={loading || busy} aria-label="ওয়ালেটের তথ্য রিফ্রেশ করুন">
          <span aria-hidden="true">↻</span> {loading ? "লোড হচ্ছে" : "রিফ্রেশ"}
        </button>
      </div>

      {error && <div className={styles.warning} role="status">{error}</div>}
      {feedback && <div className={styles.success} role="status">{feedback}</div>}

      <div className={styles.statGrid}>
        <article className={[styles.stat, styles.primaryStat].join(" ")}>
          <span>উত্তোলনযোগ্য ব্যালেন্স</span>
          <strong>{enabled ? money(available) : "—"}</strong>
          <small>অনিষ্পন্ন ও পরিশোধিত উত্তোলন বাদ দেওয়ার পর</small>
        </article>
        <article className={styles.stat}>
          <span>সর্বমোট নেট আয়</span>
          <strong>{enabled ? money(wallet?.net_earnings) : "—"}</strong>
          <small>সম্পন্ন ম্যাচের ভিত্তিতে</small>
        </article>
        <article className={styles.stat}>
          <span>অপেক্ষমাণ টাকা</span>
          <strong>{enabled ? money(reserved) : "—"}</strong>
          <small>অনুমোদনের অপেক্ষায় বা অনুমোদিত অনুরোধ</small>
        </article>
        <article className={styles.stat}>
          <span>মোট পরিশোধিত টাকা</span>
          <strong>{enabled ? money(wallet?.paid_withdrawals) : "—"}</strong>
          <small>নিশ্চিত করা পেমেন্ট</small>
        </article>
      </div>

      <div className={styles.mainGrid}>
        <form className={styles.withdrawForm} onSubmit={submit} autoComplete="off">
          <div className={styles.panelHeading}>
            <span className={styles.step}>01</span>
            <div><h3>উত্তোলনের অনুরোধ</h3><p>আপনার পছন্দের মোবাইল ওয়ালেটে টাকা নিন।</p></div>
          </div>
          {hasActive && <div className={styles.info} role="status">আপনার একটি অনুরোধ সক্রিয় রয়েছে। সেটি পরিশোধ বা বাতিল হওয়ার পর নতুন অনুরোধ করুন।</div>}

          <fieldset disabled={!enabled || busy || hasActive} className={styles.methods}>
            <legend>পেমেন্ট মাধ্যম নির্বাচন করুন</legend>
            <label className={[styles.method, provider === "bkash" ? styles.activePink : ""].join(" ")}>
              <input type="radio" name="paymentMethod" value="bkash" checked={provider === "bkash"} onChange={() => setProvider("bkash")} />
              <span className={styles.providerIdentity}><img className={styles.providerLogo} src="data:image/webp;base64,UklGRnQBAABXRUJQVlA4IGgBAABQCACdASocABwAPpFCnEqlo6KhqAgAsBIJbAC+cII4BYALYz/QDWAPQA/YDrQiVVeTD6DDOkr/8ifygNc1CmIZ7MgfzkwhcE11I4AA/rcKutRZaemt+kFwkd4fezZGH/zWjBdkJsNx/nCWdBcAV6IsRVZ5ajIXMZW51a/EjelJrOAW2P/x1UoApFU/5egv6t7//BQKzprw9ZgCYdGiUyIx78aknbsbb6HYWlE4voeX/gka+QkDSRs23frEOrxbUZimOl58PRF+5/THVUeu32of5YDZ7Arc2vz/xQWhhh7nMdpKJJMYj/GKVK79+eXPoaf2YXVhVNslvrnrhnXIEU1UmFV7kxaFel3WAP4uHgxDSJ1u9o9vr7SiIApjoiX96RmodBs2vh58G7HEoI4v0To/NTZSXCO9/RyYizOWF2rtBDwgNyFa940ugfKeRXtrydeNuVk/6TzvfG5+Z9k9od/ByYopWpBbUAA=" alt="" loading="lazy" /><span><strong>bKash</strong><small>পার্সোনাল অ্যাকাউন্ট</small></span></span>
            </label>
            <label className={[styles.method, provider === "nagad" ? styles.activeOrange : ""].join(" ")}>
              <input type="radio" name="paymentMethod" value="nagad" checked={provider === "nagad"} onChange={() => setProvider("nagad")} />
              <span className={styles.providerIdentity}><img className={styles.providerLogo} src="data:image/webp;base64,UklGRn4BAABXRUJQVlA4IHIBAADwBwCdASocABwAPoE2lEelIyIhN/qoAKAQCWwAnTKEdXeZp4l3lFu3FYf+kRkyYJcWTsK2Ik8D6cDCsclU/EYQn+V9o3LK5KAA/uu+g1YVVnxosunEWsftb34Y/UCVuXEj/mI2sIGJv8N0oYELAruUPQy9aHd2/t2NAAdixzczA//PfV+fZILHfhXgDfe1pbIhZFkt5ZzdPaU98z5q3ns6QSnp8emyOHMe1FeY61/5i5tls6KiGvpKwNYHnMxaRpJTdv1YAD7Ry9u8FTar/k7zwO7hGXgR2negBxrZ6rQGll9ViCBXUAp0wVrXcVvLju0lUVNkpsmxJNX8hfBd0ApR9n4S299d0+heXfsNKFP+OWOQsozeE/54bJiUoC9LnxG8WbaCEyvUfq2UTu8fMUkeziSUUlC5mIWvzIe2WzPtAJPy1J8iic9ff5xTZ/Tn/xJVgN+xV7gKVJYtrff6r+6vKOKCRA8P0jb/xAfH/4XaAAAA" alt="" loading="lazy" /><span><strong>Nagad</strong><small>পার্সোনাল অ্যাকাউন্ট</small></span></span>
            </label>
          </fieldset>

          <label className={styles.field}>
            <span>প্রাপকের মোবাইল নম্বর</span>
            <input type="tel" inputMode="numeric" autoComplete="off" placeholder="01XXXXXXXXX" maxLength={11}
              pattern="01[3-9][0-9]{8}" value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              disabled={!enabled || busy || hasActive} aria-invalid={number.length > 0 && !numberValid} />
            <small>যে নম্বরে টাকা নিতে চান, সেই নম্বরটি সঠিকভাবে দিন।</small>
          </label>

          <label className={styles.field}>
            <span>উত্তোলনের পরিমাণ (টাকা)</span>
            <input type="text" inputMode="decimal" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, "").slice(0, 16))}
              disabled={!enabled || busy || hasActive} aria-invalid={amount.length > 0 && (!amountValid || requested > available || requested <= 0)} />
            <small>বর্তমান ব্যালেন্স: {enabled ? money(available) : "—"}</small>
          </label>

          <div className={styles.feeNotice}>
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>TRANSFER CHARGE পরিশোধিত BY PLAYER</strong>
              <p>বিকাশ বা নগদের প্রকৃত ট্রান্সফার চার্জ আপনার অনুরোধের টাকা থেকে কাটা হবে। চার্জ বাদে বাকি টাকা পাবেন। পেমেন্টের পরে অ্যাডমিন প্রকৃত চার্জ ও ট্রানজ্যাকশন আইডি সংরক্ষণ করবেন। নির্দিষ্ট কোনো চার্জের হার এখনো নির্ধারণ করা হয়নি।</p>
            </div>
          </div>

          <label className={styles.consent}>
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={!enabled || busy || hasActive} />
            <span>প্রাপকের নম্বর সঠিক এবং প্রকৃত ট্রান্সফার চার্জ কাটা হবে—এতে আমি সম্মত।</span>
          </label>

          <button type="submit" className={styles.submit} disabled={!canSubmit}>
            {busy ? "জমা হচ্ছে..." : !enabled ? "উত্তোলন এখনো চালু হয়নি" : hasActive ? "একটি অনুরোধ সক্রিয় আছে" : "উত্তোলনের অনুরোধ"}
            <span aria-hidden="true">→</span>
          </button>
          <p className={styles.formFooter}>অ্যাডমিনের অনুমোদন প্রয়োজন। অনুমোদন মানেই টাকা পাঠানো হয়েছে, এমন নয়।</p>
        </form>

        <div className={styles.history}>
          <div className={styles.panelHeading}>
            <span className={styles.step}>02</span>
            <div><h3>উত্তোলনের ইতিহাস</h3><p>সর্বশেষ ২৫টি অনুরোধ ও পেমেন্ট আপডেট।</p></div>
          </div>
          {loading ? (
            <p className={styles.empty}>উত্তোলনের ইতিহাস লোড হচ্ছে...</p>
          ) : !enabled ? (
            <p className={styles.empty}>উত্তোলন সেবা চালু হলে এখানে ইতিহাস দেখা যাবে।</p>
          ) : history.length === 0 ? (
            <div className={styles.emptyBox}>
              <span aria-hidden="true">◇</span>
              <strong>এখনো কোনো উত্তোলন নেই</strong>
              <p>প্রথম অনুরোধ জমা দেওয়ার পর এখানে দেখা যাবে।</p>
            </div>
          ) : (
            <ul className={styles.historyList}>
              {history.map((item) => {
                const status = statuses[item.status] || { title: "অজানা", note: "আপডেটের অপেক্ষায়" };
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
                        <span>চার্জ {money(item.transfer_fee)}</span>
                        <span>প্রাপ্ত {money(item.net_payout)}</span>
                        <span>ট্রানজ্যাকশন আইডি: {item.transaction_reference || "—"}</span>
                      </div>
                    )}
                    {item.status === "rejected" && item.rejection_reason && (
                      <p className={styles.rejectReason}>কারণ: {item.rejection_reason}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className={styles.disclaimer}>
            <span aria-hidden="true">🔒</span>
            <p>এখানে শুধু আপনার ওয়ালেটের তথ্য দেখানো হয়। বিকাশ/নগদের PIN, OTP বা লগইন পাসওয়ার্ড কাউকে দেবেন না।</p>
          </div>
        </div>
      </div>
    </section>
  );
}

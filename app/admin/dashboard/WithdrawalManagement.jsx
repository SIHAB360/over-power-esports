"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle, FiArrowRight, FiCheckCircle, FiClock, FiCopy, FiCreditCard,
  FiDollarSign, FiFilter, FiRefreshCw, FiSearch, FiShield, FiX, FiXCircle,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import styles from "./WithdrawalManagement.module.css";

const FILTERS = [
  { key: "", label: "All requests" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "paid", label: "Paid" },
  { key: "rejected", label: "Rejected" },
];
const STATUS_LABEL = { pending:"PENDING REVIEW", approved:"APPROVED · AWAITING PAYMENT", paid:"PAID", rejected:"REJECTED" };
const money = (n) => {
  const value = Number(n);
  return Number.isFinite(value)
    ? "৳" + value.toLocaleString("en-BD", { minimumFractionDigits:2, maximumFractionDigits:2 })
    : "—";
};
const date = (v) => {
  if (!v) return "—";
  const x = new Date(v);
  return Number.isNaN(x.getTime()) ? "—" : x.toLocaleString("en-BD", {
    year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit",
  });
};
const redactPhone = (n) => /^01[3-9][0-9]{8}$/.test(String(n || ""))
  ? String(n).slice(0,3) + "•••••" + String(n).slice(-3) : "Hidden";
const validMoney = (value) => /^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(String(value));
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const statuses = ["pending","approved","paid","rejected"];

export default function WithdrawalManagement({ players = [], refreshVersion = 0, moderatorMode = false }) {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [scopedRights,setScopedRights]=useState({review:false,pay:false});
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [fee, setFee] = useState("0");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const requestSeq = useRef(0);
  const writeLock = useRef(false);

  const playerLookup = useMemo(() => new Map(
    players.map(p => [String(p.id), {
      name:p.ign || p.full_name || "Player",
      team:p.team_name || "Unassigned",
    }])
  ), [players]);

  const getToken = useCallback(async () => {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.access_token) throw new Error("Admin session expired. Please sign in again.");
    return session.access_token;
  }, []);

  const getData = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const query = new URLSearchParams({ page:String(page) });
      if (filter) query.set("status",filter);
      const response = await fetch((moderatorMode?"/api/moderator/withdrawals?":"/api/admin/withdrawals?") + query, {
        cache:"no-store",
        headers:{ Authorization:"Bearer " + token },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 503) throw new Error(
          "Withdrawal service is not active yet. Database migration and financial tests must pass before processing payments."
        );
        throw new Error(data.message || "Unable to load withdrawal requests.");
      }
      if (requestSeq.current !== seq) return;
      setRequests(Array.isArray(data.requests) ? data.requests : []);
      setScopedRights({review:!moderatorMode||Boolean(data.can_review),pay:!moderatorMode||Boolean(data.can_pay)});
      setTotal(Number(data.total) || 0);
      setCounts(data.counts || {});
      setSelectedId(previous => {
        const present = (data.requests || []).some(item => item.id === previous);
        return present ? previous : "";
      });
    } catch (err) {
      if (requestSeq.current !== seq) return;
      setRequests([]);
      setCounts({});
      setTotal(0);
      setError(err?.message || "Unable to load withdrawal data.");
    } finally {
      if (requestSeq.current === seq) setLoading(false);
    }
  }, [getToken,filter,page,moderatorMode]);

  useEffect(() => { getData(); return () => { requestSeq.current++; }; }, [getData,refreshVersion]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(r => {
      const p = playerLookup.get(String(r.player_id));
      return [p?.name,p?.team,r.id,r.provider,r.receiver_number,r.status,
        r.transaction_reference].some(v => String(v || "").toLowerCase().includes(q));
    });
  }, [requests,search,playerLookup]);

  const selected = requests.find(r => r.id === selectedId) || null;
  const player = selected ? (playerLookup.get(String(selected.player_id)) || null) : null;
  const feeValid = validMoney(fee) && Number(fee) >= 0 && selected && Number(fee) < Number(selected.amount);
  const actualNet = feeValid ? Number(selected.amount) - Number(fee) : null;
  const actionValid = action === "approve"
    ? selected?.status === "pending"
    : action === "reject"
      ? ["pending","approved"].includes(selected?.status) && reason.trim().length > 0 && reason.trim().length <= 350
      : action === "pay"
        ? selected?.status === "approved" && feeValid && reference.trim().length >= 5 &&
          reference.trim().length <= 100 && note.trim().length <= 500 && confirmed
        : false;

  function clearAction() {
    setAction("");setReason("");setFee("0");setReference("");setNote("");setConfirmed(false);
  }
  function choose(row) {
    setSelectedId(row.id);
    clearAction();
    setMessage("");
  }
  async function sendAction() {
    if (!actionValid || !selected || writeLock.current || !isUuid(selected.id)) return;
    writeLock.current = true;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const token = await getToken();
      const pay = action === "pay";
      const path = pay ? (moderatorMode ? "/api/moderator/withdrawals/confirm-payment" : "/api/admin/withdrawals/confirm-payment") : (moderatorMode ? "/api/moderator/withdrawals/review" : "/api/admin/withdrawals/review");
      const payload = pay
        ? { requestId:selected.id, transferFee:Number(fee), transactionReference:reference.trim(), note:note.trim() || null, confirmed }
        : { requestId:selected.id, decision:action === "approve" ? "approved" : "rejected", reason:action === "reject" ? reason.trim() : null };
      const result = await fetch(path, {
        method:"POST",cache:"no-store",
        headers:{ Authorization:"Bearer " + token,"Content-Type":"application/json" },
        body:JSON.stringify(payload),
      });
      const data = await result.json().catch(() => ({}));
      if (!result.ok) throw new Error(data.message || "The withdrawal action was not completed.");
      setMessage(pay ? "Manual payment recorded as PAID. Keep the provider receipt for reconciliation."
        : action === "approve" ? "Request approved. Money has NOT been sent yet."
        : "Request rejected and the reserved balance released.");
      clearAction();
      await getData();
    } catch (err) {
      setError(err?.message || "Unable to process withdrawal.");
    } finally {
      setBusy(false);
      writeLock.current = false;
    }
  }
  async function copyNumber() {
    if (!selected?.receiver_number) return;
    try {
      await navigator.clipboard.writeText(selected.receiver_number);
      setMessage("Receiver number copied. Verify it against the payment screen before sending.");
    } catch {
      setError("Copy was blocked; select and copy the receiver number manually.");
    }
  }

  return (
    <section data-op-withdrawal-shell className={styles.shell} aria-label="Admin player withdrawal management">
      <div data-op-withdrawal-heading className={styles.heading}>
        <div>
          <p className={styles.eyebrow}><FiShield aria-hidden="true"/> FINANCE OPERATIONS / ADMIN CONTROL</p>
          <h3>Withdrawal <span>Control Center</span></h3>
          <p className={styles.subheading}>Review player requests, approve or reject, and record real manual bKash/Nagad transfers. Approval never sends money.</p>
        </div>
        <button type="button" className={styles.refresh} onClick={getData} disabled={loading || busy}>
          <FiRefreshCw aria-hidden="true"/> {loading ? "Loading…" : "Refresh requests"}
        </button>
      </div>

      {error && <div className={styles.alert} role="alert"><FiAlertTriangle aria-hidden="true"/><p>{error}</p></div>}
      {message && <div className={styles.success} role="status"><FiCheckCircle aria-hidden="true"/><p>{message}</p></div>}
      <div className={styles.ruleStrip}>
        <FiCreditCard aria-hidden="true"/>
        <span><strong>PERSONAL bKash / Nagad</strong> · Manual payouts only · Player pays actual transfer charge · One active request per player · Minimum amount not configured</span>
      </div>

      <div className={styles.metricGrid}>
        {statuses.map(key => (
          <article data-op-withdrawal-metric className={styles.metric} key={key}>
            <div className={styles.metricLabel}>
              <span className={[styles.dot,styles[key]].join(" ")}/>
              {key === "pending" ? "PENDING REVIEW" : key === "approved" ? "AWAITING PAYMENT" : key === "paid" ? "PAID RECORDS" : "REJECTED"}
            </div>
            <strong>{loading && counts[key] === undefined ? "…" : counts[key] ?? "—"}</strong>
            <small>All requests · {key}</small>
          </article>
        ))}
      </div>

      <div className={styles.panels}>
        <div data-op-withdrawal-panel className={styles.listPanel}>
          <div className={styles.panelHead}>
            <h4>WITHDRAWAL REQUESTS</h4>
            <small>{loading ? "Syncing…" : `${requests.length} of ${total} in selected status`}</small>
          </div>
          <div className={styles.filters} aria-label="Filter withdrawals by status">
            {FILTERS.map(item => <button key={item.key || "all"} type="button"
              className={[styles.filter,filter === item.key ? styles.filterActive : ""].join(" ")}
              onClick={() => {setFilter(item.key);setPage(1);setSearch("");setSelectedId("");clearAction();}}
              disabled={busy}
              aria-pressed={filter === item.key}>{item.label}</button>)}
          </div>
          <label className={styles.search}>
            <FiSearch aria-hidden="true"/>
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search players / number / reference on this page" aria-label="Search visible withdrawal page"/>
          </label>
          <div className={styles.list} role="list" aria-label="Withdrawal records">
            {loading ? <p className={styles.empty} role="status">Loading secure withdrawal records…</p>
              : rows.length === 0 ? (
                <div className={styles.emptyState} role="status">
                  <span className={styles.emptyIcon} aria-hidden="true"><FiCreditCard /></span>
                  <strong>{search ? "No matching requests" : filter ? `No ${filter} requests` : "No withdrawal requests yet"}</strong>
                  <p>{search
                    ? "Nothing on this page matches your search. Try another name or clear the search."
                    : filter
                      ? "There are no requests with this status right now. Choose All requests to see other records."
                      : "When a player submits a bKash or Nagad withdrawal request, it will appear here for review."}</p>
                </div>
              )
              : rows.map(row => {
                  const p = playerLookup.get(String(row.player_id));
                  return <button type="button" role="listitem" key={row.id}
                    className={[styles.listRow,selectedId === row.id ? styles.listRowActive : ""].join(" ")}
                    onClick={() => choose(row)} aria-pressed={selectedId === row.id}>
                    <span className={styles.rowTop}><strong>{p?.name || "Player " + String(row.player_id).slice(0,8)}</strong>
                      <b>{money(row.amount)}</b></span>
                    <span className={styles.rowMeta}><span>{(row.provider || "wallet").toUpperCase()} · {redactPhone(row.receiver_number)}</span><time>{date(row.created_at)}</time></span>
                    <span className={[styles.status,styles[row.status] || ""].join(" ")}>{STATUS_LABEL[row.status] || row.status}</span>
                  </button>;
                })}
          </div>
          <div className={styles.pageControl}>
            <button type="button" disabled={loading || busy || page === 1} onClick={() => {setPage(v => Math.max(1,v-1));setSelectedId("");}}>← Previous</button>
            <span>Page {page} / {Math.max(1,Math.ceil(total/25))}</span>
            <button type="button" disabled={loading || busy || page * 25 >= total} onClick={() => {setPage(v => v+1);setSelectedId("");}}>Next →</button>
          </div>
        </div>

        <div data-op-withdrawal-panel className={styles.detailPanel}>
          <div className={styles.panelHead}><h4>REQUEST DETAILS</h4><FiFilter aria-hidden="true"/></div>
          {!selected ? <div className={styles.noSelection}>
            <span className={styles.noSelectionIcon} aria-hidden="true"><FiShield/></span>
            <strong>{!loading && total === 0 && !filter ? "Ready for your first request" : "Choose a withdrawal request"}</strong>
            <p>{!loading && total === 0 && !filter
              ? "New player requests will appear on the left. Select one to securely review the receiver, amount and status."
              : "Select a request on the left to view player details and the appropriate approval or payment controls."}</p>
            <span className={styles.secureNote}><FiShield aria-hidden="true"/> Admin-only receiver details</span>
          </div>
            : <div className={styles.details}>
              <div className={styles.requestHeading}>
                <div><p>PLAYER</p><h4>{player?.name || "Player " + String(selected.player_id).slice(0,8)}</h4><small>{player?.team || "Team not listed"}</small></div>
                <span className={[styles.status,styles[selected.status] || ""].join(" ")}>{STATUS_LABEL[selected.status] || selected.status}</span>
              </div>
              <div className={styles.amountBlock}><span>REQUESTED AMOUNT</span><strong>{money(selected.amount)}</strong><small>Gross wallet debit · Player pays transfer fee</small></div>
              <dl className={styles.facts}>
                <div><dt>Payment method</dt><dd>{selected.provider === "nagad" ? "Nagad" : selected.provider === "bkash" ? "bKash" : "Not specified"}</dd></div>
                <div><dt>Receiver number</dt><dd className={styles.recipient}><span>{selected.receiver_number || "—"}</span><button type="button" onClick={copyNumber} title="Copy receiver number" aria-label="Copy receiver number"><FiCopy/></button></dd></div>
                <div><dt>Requested</dt><dd>{date(selected.created_at)}</dd></div>
                <div><dt>Reviewed</dt><dd>{date(selected.reviewed_at)}</dd></div>
                {selected.status === "paid" && <>
                  <div><dt>Actual transfer fee</dt><dd>{money(selected.transfer_fee)}</dd></div>
                  <div><dt>Received by player</dt><dd>{money(selected.net_payout)}</dd></div>
                  <div><dt>Paid at</dt><dd>{date(selected.paid_at)}</dd></div>
                  <div><dt>Transaction reference</dt><dd className={styles.break}>{selected.transaction_reference || "—"}</dd></div>
                </>}
                {selected.status === "rejected" && <div><dt>Rejection reason</dt><dd className={styles.break}>{selected.rejection_reason || "—"}</dd></div>}
              </dl>

              {selected.status === "pending" && !action && scopedRights.review && <div className={styles.buttons}>
                <button type="button" className={styles.approveBtn} onClick={() => setAction("approve")} disabled={busy}><FiCheckCircle/> Approve</button>
                {scopedRights.review&&<button type="button" className={styles.rejectBtn} onClick={() => setAction("reject")} disabled={busy}><FiXCircle/> Reject</button>}
              </div>}
              {selected.status === "approved" && !action && (scopedRights.review||scopedRights.pay) && <div className={styles.buttons}>
                {scopedRights.pay&&<button type="button" className={styles.approveBtn} onClick={() => setAction("pay")} disabled={busy}><FiDollarSign/> Record payment</button>}
                {scopedRights.review&&<button type="button" className={styles.rejectBtn} onClick={() => setAction("reject")} disabled={busy}><FiXCircle/> Reject</button>}
              </div>}

              {action && <div data-op-withdrawal-action className={styles.actionPanel}>
                <div className={styles.actionHead}><strong>{action === "approve" ? "CONFIRM APPROVAL" : action === "reject" ? "REJECT WITHDRAWAL" : "MANUAL PAYMENT CONFIRMATION"}</strong>
                  <button type="button" onClick={clearAction} disabled={busy} aria-label="Close action"><FiX/></button></div>
                {action === "approve" && <p className={styles.actionHelp}>Approve this request for {money(selected.amount)}? No transfer will occur. Request remains reserved until payment is confirmed or rejected.</p>}
                {action === "reject" && <label className={styles.field}><span>REJECTION REASON (REQUIRED)</span>
                  <textarea rows="3" maxLength={350} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain why this withdrawal cannot be paid…" disabled={busy}/></label>}
                {action === "pay" && <>
                  <div className={styles.hazard}><FiAlertTriangle/><p><strong>Only after sending money manually.</strong> Open your personal bKash/Nagad app, transfer to the exact receiver number above, then copy the real transaction reference. This website does not send money.</p></div>
                  <label className={styles.field}><span>ACTUAL TRANSFER CHARGE (BDT)</span>
                    <input type="text" inputMode="decimal" value={fee} onChange={e=>setFee(e.target.value.replace(/[^\d.]/g,"").slice(0,16))} disabled={busy} aria-invalid={!feeValid}/></label>
                  <div className={styles.netPreview}><span>Player receives (after fee)</span><strong>{feeValid ? money(actualNet) : "Invalid fee"}</strong></div>
                  <label className={styles.field}><span>PROVIDER TRANSACTION REFERENCE</span>
                    <input type="text" maxLength={100} value={reference} onChange={e=>setReference(e.target.value)} placeholder="Transaction ID from your payment receipt" disabled={busy}/></label>
                  <label className={styles.field}><span>INTERNAL NOTE (OPTIONAL)</span>
                    <textarea rows="2" maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder="Payment receipt or reconciliation note" disabled={busy}/></label>
                  <label className={styles.checkbox}><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={busy}/><span>I have actually sent the net payout to the number above and independently verified the provider receipt/transaction ID.</span></label>
                </>}
                <div className={styles.buttons}>
                  <button type="button" onClick={sendAction} disabled={busy || !actionValid} className={action === "reject" ? styles.rejectBtn : styles.approveBtn}>
                    {busy ? <FiClock/> : <FiCheckCircle/>} {busy ? "Processing…" : action === "pay" ? "Confirm Paid" : action === "reject" ? "Confirm Rejection" : "Confirm Approval"}
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={clearAction} disabled={busy}>Cancel</button>
                </div>
              </div>}
              <div className={styles.privacy}><FiShield/><p>Keep payment receipts privately. Never collect or share any player's bKash/Nagad PIN or OTP.</p></div>
            </div>}
        </div>
      </div>
    </section>
  );
}

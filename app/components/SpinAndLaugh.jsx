"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./SpinAndLaugh.module.css";

const segments = ["AIM", "RUSH", "LOOT", "GRENade", "PING", "SQUAD", "CAMP", "MVP"];

export default function SpinAndLaugh() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rotation, setRotation] = useState(0);
  const timerRef = useRef(null);
  const dialogId = useId();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setSelected(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function spin() {
    if (spinning) return;
    setSelected(null);
    setSpinning(true);
    setRotation((current) => current + 360 * 7 + Math.floor(Math.random() * 360) + 90);
    try {
      const response = await fetch("/api/spin-and-laugh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const joke = await response.json();
      if (!response.ok) throw new Error(joke.error || "Joke generation failed");
      const remaining = Math.max(0, 5100);
      timerRef.current = window.setTimeout(() => {
        setSelected(joke);
        setSpinning(false);
      }, remaining);
    } catch (error) {
      timerRef.current = window.setTimeout(() => {
        setSelected({
          tag: "AI CONNECTION",
          title: "JOKE MACHINE TAKING A BREAK 🤖",
          text: error.message || "এই মুহূর্তে নতুন Joke তৈরি হচ্ছে না। একটু পরে আবার চেষ্টা করো!",
        });
        setSpinning(false);
      }, 900);
    }
  }

  function close() {
    if (spinning) return;
    setOpen(false);
    setSelected(null);
  }

  return (
    <>
      <div className={styles.launcher}>
        <button
          type="button"
          className={styles.launcherButton}
          onClick={() => setOpen(true)}
          aria-label="Open Spin and Laugh"
          aria-haspopup="dialog"
        >
          <span className={styles.launcherWheel} aria-hidden="true">🎡</span>
          <span className={styles.launcherLabel}>SPIN &amp; LAUGH</span>
        </button>
      </div>

      {open && (
        <div className={styles.backdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}>
          <div className={styles.emojiAtmosphere} aria-hidden="true">
            <span>😂</span><span>🤣</span><span>🎮</span><span>💀</span>
            <span>🤡</span><span>👾</span><span>🍿</span><span>🔥</span>
            <span>😎</span><span>💥</span><span>🫠</span><span>🎯</span>
          </div>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={dialogId}>
            <button type="button" className={styles.closeButton} onClick={close} disabled={spinning} aria-label="Close Spin and Laugh">×</button>
            <div className={styles.dialogSpark} aria-hidden="true">✨ 🤣 ✨</div>
            <div className={styles.eyebrow}>OVER POWER ESPORTS PRESENTS</div>
            <h2 id={dialogId}>SPIN <span>&amp;</span> LAUGH</h2>
            <p className={styles.subtitle}>AI দিয়ে প্রতিবার নতুন Joke তৈরি হবে—Spin করলেই Surprise!</p>

            <div className={styles.wheelStage}>
              <div className={styles.pointer} aria-hidden="true">▼</div>
              <div
                className={[styles.wheel, spinning ? styles.spinning : ""].join(" ")}
                style={{ transform: `rotate(${rotation}deg)` }}
                aria-label="Colorful joke wheel"
              >
                {segments.map((label, index) => (
                  <span
                    key={label}
                    className={styles.segmentLabel}
                    style={{ transform: `translate(-50%, -50%) rotate(${index * 45 + 22.5}deg) translateY(-82px) rotate(-${index * 45 + 22.5}deg)` }}
                  >{label}</span>
                ))}
                <span className={styles.wheelCenter}>OP</span>
              </div>
              <div className={styles.wheelGlow} aria-hidden="true" />
            </div>

            {!selected ? (
              <div className={styles.actionArea}>
                <p className={styles.hint}>{spinning ? "AI নতুন Joke বানাচ্ছে… একটু অপেক্ষা! 🤣" : "প্রস্তুত? একবার Spin করো!"}</p>
                <button type="button" className={styles.spinButton} onClick={spin} disabled={spinning}>
                  {spinning ? "SPINNING..." : "🎡 SPIN NOW"}
                </button>
              </div>
            ) : (
              <div className={styles.resultCard} role="status" aria-live="polite">
                <div className={styles.resultTag}>✨ {selected.tag}</div>
                <h3>{selected.title}</h3>
                <p>{selected.text}</p>
                <div className={styles.resultActions}>
                  <button type="button" className={styles.spinAgain} onClick={spin}>🔄 SPIN AGAIN</button>
                  <button type="button" className={styles.doneButton} onClick={close}>DONE</button>
                </div>
              </div>
            )}
            <div className={styles.footerNote}>JUST FOR FUN · PLAY FAIR · LAUGH LOUD</div>
          </section>
        </div>
      )}
    </>
  );
}

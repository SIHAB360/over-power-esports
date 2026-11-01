"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./SpinAndLaugh.module.css";

const jokes = [
  { tag: "AIM CHECK", title: "AIM ON VACATION 🎯", text: "শত্রু সামনে দাঁড়িয়ে… কিন্তু ভাইয়ের Aim ছুটিতে গিয়েছে!" },
  { tag: "RUSH ALERT", title: "RUSH আগে, ভাবনা পরে 🏃", text: "ভাই এমন Rush দিল, Teammate-রা এখনও Lobby-তে!" },
  { tag: "LOOT MASTER", title: "LOOT-এর রাজা 🎒", text: "ম্যাচ শেষ, Zone শেষ—ভাইয়ের Loot করা এখনও শেষ হয়নি!" },
  { tag: "GRENade EXPERT", title: "নিজের Grenade, নিজের বিপদ 💣", text: "Enemy-কে মারতে Grenade ছুড়েছিল… Knock হলো নিজের Team!" },
  { tag: "PING PROBLEM", title: "Wi-Fi-এর দোষ 📶", text: "হারলে Ping, জিতলে Skill—এই হলো আসল Gamer Logic!" },
  { tag: "SQUAD LEGEND", title: "একাই একশো… নাকি? 👑", text: "Squad বলল Cover দে! ভাই দিল Offline!" },
  { tag: "CAMPING PRO", title: "ঘরের কোণ Champion 🪑", text: "Enemy খুঁজছে ভাইকে, ভাই আরাম করে ঘাস গুনছে!" },
  { tag: "MVP DREAM", title: "MVP-এর স্বপ্ন 🏆", text: "Kill কম, Damage কম—কিন্তু Celebration একদম World Champion!" },
  { tag: "REVIVE PLEASE", title: "Revive কোথায়? 🥲", text: "ভাই Revive চাইছে, Teammate তখন Loot-এর হিসাব করছে!" },
  { tag: "PRO PLAYER", title: "প্রো Max Level 😎", text: "ভাইয়ের Strategy এত Secret—নিজেও জানে না কী করছে!" },
  { tag: "HEADSHOT?", title: "Headshot-এর অপেক্ষা 🎯", text: "Crosshair ঠিক মাথায়… গুলি গেল পাশের পাহাড়ে!" },
  { tag: "LAST ZONE", title: "Zone-এর সাথে বন্ধুত্ব 🔥", text: "Enemy-র গুলির চেয়ে Zone-এর Damage-ই আজ বেশি ভয়ংকর!" },
];

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

  function spin() {
    if (spinning) return;
    setSelected(null);
    setSpinning(true);
    const next = jokes[Math.floor(Math.random() * jokes.length)];
    setRotation((current) => current + 360 * 7 + Math.floor(Math.random() * 360) + 90);
    timerRef.current = window.setTimeout(() => {
      setSelected(next);
      setSpinning(false);
    }, 5100);
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={dialogId}>
            <button type="button" className={styles.closeButton} onClick={close} disabled={spinning} aria-label="Close Spin and Laugh">×</button>
            <div className={styles.eyebrow}>OVER POWER ESPORTS PRESENTS</div>
            <h2 id={dialogId}>SPIN <span>&amp;</span> LAUGH</h2>
            <p className={styles.subtitle}>ঘোরাও চাকা, হাসির Jackpot জিতে নাও!</p>

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
                <p className={styles.hint}>{spinning ? "চাকা ঘুরছে… Joke আসছে! 🤣" : "প্রস্তুত? একবার Spin করো!"}</p>
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

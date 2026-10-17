"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./FloatingContact.module.css";

const links = [
  {
    name: "WhatsApp",
    icon: "fa-brands fa-whatsapp",
    url: "https://chat.whatsapp.com/KyKkUE0g17X5w7PJXtfM3E",
    className: "whatsapp",
  },
  {
    name: "Discord",
    icon: "fa-brands fa-discord",
    url: "https://discord.gg/4HrJ5zRCh",
    className: "discord",
  },
];

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const widgetRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    function closeOutside(event) {
      if (!widgetRef.current?.contains(event.target)) setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, []);

  return (
    <div
      ref={widgetRef}
      className={[styles.widget, open ? styles.expanded : ""].join(" ")}
      onMouseEnter={(event) => {
        if (event.pointerType !== "touch") setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      aria-label="Contact Over Power Esports"
    >
      <div className={styles.links} id={menuId} aria-hidden={!open}>
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={"Contact on " + link.name}
            title={link.name}
            tabIndex={open ? 0 : -1}
            className={[styles.link, styles[link.className]].join(" ")}
          >
            <i className={link.icon} aria-hidden="true" />
          </a>
        ))}
      </div>

      <button
        type="button"
        className={styles.mainButton}
        aria-label={open ? "Close contact menu" : "Open contact menu"}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.orbit} aria-hidden="true" />
        <img
          src="/contact-mascot.webp"
          alt=""
          width="160"
          height="160"
          className={styles.mascot}
          draggable="false"
        />
        <span className={styles.onlineDot} aria-hidden="true" />
      </button>
      <span className={styles.tooltip} aria-hidden="true">CONTACT US</span>
    </div>
  );
}

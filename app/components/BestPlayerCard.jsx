"use client";

import styles from "./Champions.module.css";

const metrics = [
  { key: "kills", label: "KILLS", icon: "⚔" },
  { key: "damage", label: "DAMAGE", icon: "✦" },
  { key: "assists", label: "ASSISTS", icon: "◎" },
  { key: "mvp", label: "MVP", icon: "★" },
];

export default function BestPlayerCard({ data, index = 0 }) {
  const { team, bestPlayer } = data;
  const { player, stats, score } = bestPlayer;
  const variant = index % 2 === 0 ? styles.champion : [styles.champion, styles.ice].join(" ");

  return (
    <article className={variant} aria-label={team.name + " champion: " + player.ign}>
      <span className={styles.cornerTop} aria-hidden="true" />
      <span className={styles.cornerBottom} aria-hidden="true" />

      <div className={styles.cardHeader}>
        <span className={styles.badge}>
          <span className={styles.badgeStar} aria-hidden="true">✦</span>
          CHAMPION SPOTLIGHT
        </span>
        <span className={styles.cardIndex}>TOP 01</span>
      </div>

      <div className={styles.profile}>
        <div className={styles.portraitFrame}>
          <img src={player.image} alt={player.ign} className={styles.portrait} />
        </div>
        <div className={styles.identity}>
          <p className={styles.identityKicker}>{team.name}</p>
          <h3 className={styles.playerName}>{player.ign}</h3>
          <p className={styles.teamName}>{team.name}</p>
          <p className={styles.role}>{player.role}</p>
        </div>
      </div>

      <div className={styles.score}>
        <div>
          <span className={styles.scoreLabel}>PERFORMANCE SCORE</span>
          <span className={styles.scoreSub}>Top ranked in the team</span>
        </div>
        <strong className={styles.scoreNumber}>{score}</strong>
      </div>

      <div className={styles.metrics}>
        {metrics.map(({ key, label, icon }) => (
          <div className={styles.metric} key={key}>
            <span className={styles.metricIcon} aria-hidden="true">{icon}</span>
            <span className={styles.metricLabel}>{label}</span>
            <strong className={styles.metricNumber}>
              {Number(stats[key] || 0).toLocaleString("en-US")}
            </strong>
          </div>
        ))}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.footerMark}>★ #1 TEAM PLAYER</span>
        <span className={styles.footerLine} aria-hidden="true" />
      </div>
    </article>
  );
}

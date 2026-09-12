"use client";

const socialLinks = [
  { name: "Facebook Page", icon: "f", href: "#" },
  { name: "Instagram", icon: "◎", href: "#" },
  { name: "TikTok", icon: "♪", href: "#" },
  { name: "YouTube", icon: "▶", href: "#" },
];

const whatsappContacts = [
  {
    role: "TEAM MANAGER",
    name: "Manager Name",
    number: "Add WhatsApp Number",
    href: "#",
  },
  {
    role: "MAIN TEAM IGL",
    name: "IGL Name",
    number: "Add WhatsApp Number",
    href: "#",
  },
  {
    role: "ELITE TEAM IGL",
    name: "IGL Name",
    number: "Add WhatsApp Number",
    href: "#",
  },
];

const rules = [
  "Players must provide correct personal and gaming information.",
  "Every player must behave respectfully with teammates, opponents and staff.",
  "Cheating, hacking, account sharing, toxicity and harassment are strictly prohibited.",
  "Players must follow the instructions of the manager, coach and IGL.",
  "Players must attend official practice, scrims and tournaments regularly.",
  "A player must inform the team staff before missing any official activity.",
  "Internal team information, discussions and strategies must remain private.",
  "The management may conduct trials before confirming a player.",
  "The management may suspend or remove any player for serious violations.",
];

export default function JoinTeamPage() {
  return (
    <main className="join-page">
      <div className="join-container">
        <a href="/" className="back-link">
          ← Back to Home
        </a>

        <section className="join-hero">
          <p className="eyebrow">OVER POWER ESPORTS</p>

          <h1>JOIN THE TEAM</h1>

          <p className="hero-text">
            Read our rules, connect with our official communities and start
            your journey with Over Power Esports.
          </p>

          <a href="/register" className="primary-button">
            JOIN TEAM <span>→</span>
          </a>
        </section>

        <section className="important-box">
          <div className="important-icon">!</div>

          <div>
            <h2>Important Notice</h2>

            <p>
              Please read all rules carefully before continuing. By joining the
              team, you agree to follow our rules and respect the team members.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="section-title">
            <span>01</span>

            <div>
              <p>TEAM POLICY</p>
              <h2>Rules & Regulations</h2>
            </div>
          </div>

          <div className="rules-grid">
            {rules.map((rule, index) => (
              <div className="rule-card" key={rule}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="page-section">
          <div className="section-title">
            <span>02</span>

            <div>
              <p>OFFICIAL LINKS</p>
              <h2>Stay Connected</h2>
            </div>
          </div>

          <div className="connection-grid">
            <div className="connection-card">
              <p className="card-label">SOCIAL MEDIA</p>

              <h3>Follow Over Power</h3>

              <p className="card-description">
                Follow our official social media pages for team updates,
                announcements and content.
              </p>

              <div className="button-grid">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="social-button"
                  >
                    <span>{link.icon}</span>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="connection-card">
              <p className="card-label">COMMUNITY</p>

              <h3>Join Our Community</h3>

              <p className="card-description">
                Connect with players, managers and team members through our
                official communities.
              </p>

              <div className="button-grid">
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="community-button whatsapp"
                >
                  <span>◉</span>
                  WhatsApp Community
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="community-button discord"
                >
                  <span>◈</span>
                  Discord Server
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="section-title">
            <span>03</span>

            <div>
              <p>DIRECT CONTACT</p>
              <h2>Contact Team Staff</h2>
            </div>
          </div>

          <div className="contact-grid">
            {whatsappContacts.map((contact) => (
              <a
                key={contact.role}
                href={contact.href}
                target="_blank"
                rel="noreferrer"
                className="contact-card"
              >
                <div className="whatsapp-icon">◉</div>

                <div>
                  <p>{contact.role}</p>
                  <h3>{contact.name}</h3>
                  <small>{contact.number}</small>
                </div>

                <strong>↗</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="final-box">
          <p>READY FOR THE NEXT LEVEL?</p>

          <h2>Start Your Registration</h2>

          <span>
            Complete the verification process to access the registration form.
          </span>

          <a href="/register" className="primary-button">
            CONTINUE TO VERIFICATION <span>→</span>
          </a>
        </section>
      </div>

      <style jsx>{`
        .join-page {
          min-height: 100vh;
          padding: 35px 16px 90px;
          color: #ffffff;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255, 0, 58, 0.25),
              transparent 420px
            ),
            linear-gradient(135deg, #050507, #210007, #030305);
        }

        .join-container {
          width: min(1080px, 100%);
          margin: auto;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 35px;
          color: #a9a9af;
          font-size: 13px;
          text-decoration: none;
        }

        .back-link:hover {
          color: #ff2348;
        }

        .join-hero {
          padding: 60px 25px;
          text-align: center;
          border: 1px solid rgba(255, 30, 65, 0.5);
          border-radius: 22px;
          background: linear-gradient(
            145deg,
            rgba(255, 0, 50, 0.15),
            rgba(10, 10, 16, 0.9)
          );
          box-shadow: 0 0 50px rgba(255, 0, 50, 0.12);
        }

        .eyebrow,
        .card-label,
        .section-title p,
        .final-box > p {
          margin: 0;
          color: #ff2448;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .join-hero h1 {
          margin: 15px 0;
          font-family: var(--font-orbitron), sans-serif;
          font-size: clamp(30px, 7vw, 68px);
          letter-spacing: 3px;
        }

        .hero-text {
          max-width: 620px;
          margin: 0 auto 30px;
          color: #c4c4ca;
          font-size: 15px;
          line-height: 1.7;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 45px;
          padding: 0 21px;
          color: #ffffff;
          border-radius: 8px;
          background: linear-gradient(90deg, #ed0d36, #ff3455);
          box-shadow: 0 8px 25px rgba(255, 25, 60, 0.25);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.15);
        }

        .important-box {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-top: 22px;
          padding: 22px;
          border: 1px solid rgba(255, 40, 70, 0.3);
          border-radius: 16px;
          background: rgba(15, 15, 20, 0.8);
        }

        .important-icon {
          display: grid;
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 50%;
          background: #ef173e;
          font-weight: 900;
        }

        .important-box h2 {
          margin: 0 0 7px;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 17px;
        }

        .important-box p {
          margin: 0;
          color: #aaaaaf;
          font-size: 13px;
          line-height: 1.7;
        }

        .page-section {
          margin-top: 65px;
        }

        .section-title {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 23px;
        }

        .section-title > span {
          color: #ff2348;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 21px;
          font-weight: 900;
        }

        .section-title h2 {
          margin: 5px 0 0;
          font-family: var(--font-orbitron), sans-serif;
          font-size: clamp(21px, 4vw, 32px);
        }

        .rules-grid,
        .connection-grid,
        .contact-grid {
          display: grid;
          gap: 14px;
        }

        .rules-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .rule-card {
          display: flex;
          gap: 14px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.035);
        }

        .rule-card strong {
          color: #ff2348;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 12px;
        }

        .rule-card span {
          color: #d0d0d5;
          font-size: 13px;
          line-height: 1.65;
        }

        .connection-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .connection-card {
          padding: 25px;
          border: 1px solid rgba(255, 40, 70, 0.28);
          border-radius: 16px;
          background: rgba(12, 12, 18, 0.8);
        }

        .connection-card h3 {
          margin: 11px 0 8px;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 17px;
        }

        .card-description {
          margin: 0 0 20px;
          color: #aaaab0;
          font-size: 13px;
          line-height: 1.7;
        }

        .button-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 9px;
        }

        .social-button,
        .community-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 10px;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .social-button:hover,
        .community-button:hover {
          border-color: #ff2348;
          background: rgba(255, 25, 60, 0.13);
        }

        .whatsapp {
          border-color: rgba(37, 211, 102, 0.4);
        }

        .discord {
          border-color: rgba(88, 101, 242, 0.55);
        }

        .contact-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px;
          color: #ffffff;
          border: 1px solid rgba(255, 40, 70, 0.28);
          border-radius: 14px;
          background: rgba(12, 12, 18, 0.8);
          text-decoration: none;
          transition: 0.2s ease;
        }

        .contact-card:hover {
          transform: translateY(-2px);
          border-color: #ff2348;
        }

        .whatsapp-icon {
          color: #22d66b;
          font-size: 21px;
        }

        .contact-card p {
          margin: 0 0 5px;
          color: #ff2348;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .contact-card h3 {
          margin: 0 0 4px;
          font-size: 13px;
        }

        .contact-card small {
          color: #aaaaaf;
          font-size: 11px;
        }

        .contact-card > strong {
          margin-left: auto;
          color: #ff2348;
        }

        .final-box {
          margin-top: 65px;
          padding: 45px 20px;
          text-align: center;
          border: 1px solid rgba(255, 40, 70, 0.35);
          border-radius: 17px;
          background: linear-gradient(
            140deg,
            rgba(255, 0, 48, 0.16),
            rgba(15, 15, 22, 0.9)
          );
        }

        .final-box h2 {
          margin: 10px 0;
          font-family: var(--font-orbitron), sans-serif;
          font-size: clamp(22px, 5vw, 36px);
        }

        .final-box > span {
          display: block;
          margin-bottom: 24px;
          color: #aaaaaf;
          font-size: 13px;
        }

        @media (max-width: 700px) {
          .rules-grid,
          .connection-grid,
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 430px) {
          .button-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

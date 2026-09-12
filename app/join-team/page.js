"use client";


const socialLinks = [
  { name: "Facebook", icon: "f", href: "#" },
  { name: "Instagram", icon: "◎", href: "#" },
  { name: "TikTok", icon: "♪", href: "#" },
  { name: "YouTube", icon: "▶", href: "#" },
];

const rules = [
  "সকল খেলোয়াড়কে সঠিক ব্যক্তিগত, যোগাযোগ ও গেমিং তথ্য প্রদান করতে হবে।",

  "টিমের সকল সদস্য, প্রতিপক্ষ, ম্যানেজার, কোচ ও স্টাফের সঙ্গে সম্মানজনক আচরণ করতে হবে।",

  "চিটিং, হ্যাকিং, স্ক্রিপ্ট, থার্ড-পার্টি সফটওয়্যার ও যেকোনো ধরনের unfair advantage সম্পূর্ণ নিষিদ্ধ।",

  "অ্যাকাউন্ট শেয়ারিং, boosting, smurfing এবং অন্যের অ্যাকাউন্ট ব্যবহার করা যাবে না।",

  "অফিশিয়াল ম্যাচ, স্ক্রিম ও প্র্যাকটিসে সময়মতো উপস্থিত থাকতে হবে {বাধ্যতামূলক}।",

  "অনুপস্থিত থাকতে হলে নির্ধারিত সময়ের আগে ম্যানেজার বা IGL-কে জানাতে হবে।",

  "প্র্যাকটিস চলাকালে IGL, কোচ ও ম্যানেজারের নির্দেশনা অনুসরণ করতে হবে {বাধ্যতামূলক}।",

  "টিমের ভেতরের কৌশল, কমিউনিকেশন, স্ক্রিম তথ্য ও অভ্যন্তরীণ বিষয় বাইরে প্রকাশ করা যাবে না।",

  "ম্যাচ বা প্র্যাকটিস চলাকালে toxic behaviour, rage, trolling ও unnecessary arguments করা যাবে না।",

  "টিমের voice communication পরিষ্কার, সংক্ষিপ্ত ও ম্যাচ-কেন্দ্রিক রাখতে হবে।",

  "কোনো খেলোয়াড় নিজের প্রতিপক্ষ বা স্টাফকে অপমান, হুমকি বা হয়রানি করতে পারবে না।",

  "টিমের নাম, লোগো, জার্সি ও ব্র্যান্ডের সুনাম ক্ষুণ্ণ হয়—এমন কোনো কাজ করা যাবে না।",

  "অফিশিয়াল সোশ্যাল মিডিয়া পোস্ট, ছবি বা ভিডিও প্রকাশের আগে ম্যানেজমেন্টের অনুমতি নিতে হবে।",

  "টিমের হয়ে কোনো public statement, interview বা sponsorship deal দেওয়ার আগে ম্যানেজমেন্টকে জানাতে হবে।",

  "নির্ধারিত tournament rules, registration deadline এবং match schedule মেনে চলতে হবে {বাধ্যতামূলক}।",

  "খেলোয়াড়দের নিজস্ব device, stable internet connection এবং প্রয়োজনীয় gaming setup প্রস্তুত রাখতে হবে।",

  "ট্রায়াল, performance review ও roster পরিবর্তনের সিদ্ধান্ত ম্যানেজমেন্ট নিতে পারবে।",

  "দলগত পারফরম্যান্স, teamwork, discipline ও consistency-এর ভিত্তিতে খেলোয়াড়ের position নির্ধারণ করা হবে।",

  "যেকোনো সমস্যা ম্যানেজার এর মাধ্যমে শান্তিপূর্ণভাবে সমাধান করতে হবে।",

  "গুরুতর নিয়মভঙ্গের ক্ষেত্রে ম্যানেজার warning, suspension, roster removal বা permanent termination করতে পারবেন।",

  "টিম ত্যাগ করতে হলে নির্দিষ্ট notice period এক মাস আগে ম্যানেজমেন্টকে জানাতে হবে।",

  "টিমের কোনো confidential তথ্য, password বা private document অন্য কারও সঙ্গে শেয়ার করা যাবে না।",

  "প্রত্যেক খেলোয়াড়কে টিমের উন্নতি, discipline এবং positive competitive environment বজায় রাখতে সহযোগিতা করতে হবে।",
];

const contacts = [
  {
    role: "TEAM MANAGER",
    name: "MD SHABUDDIN",
    number: "+880 1715 393876",
    href: "https://wa.me/8801715393876",
    image: "/team/md-shabuddin.jpg",
  },
  {
    role: "MAIN TEAM IGL",
    name: "REJWAN AHAMMED",
    number: "+880 1756 622595",
    href: "https://wa.me/8801756622595",
    image: "/team/rejwan-ahammed.jpg",
  },
  {
    role: "ELITE TEAM IGL",
    name: "SAWON AHMED",
    number: "+880 1614 998044",
    href: "https://wa.me/8801614998044",
    image: "/team/sawon-ahmed.jpg",
  },
];

export default function JoinTeamPage() {
  return (
    <main className="join-page">
      <div className="light-orb orb-one" />
      <div className="light-orb orb-two" />

      <div className="join-container">
        <a href="/" className="back-link">
          ← Back to Home
        </a>

        <section className="hero-card">
          <div className="live-badge">
            <span />
            RECRUITMENT OPEN
          </div>

          <p className="eyebrow">OVER POWER ESPORTS</p>

          <h1>
            JOIN THE <span>TEAM</span>
          </h1>

          <p className="hero-text">
            Step into the arena, represent the power and become part of our
            competitive esports family.
          </p>

          <a href="#team-information" className="main-button">
            VIEW REQUIREMENTS <span>↓</span>
          </a>
        </section>

        <section className="notice-card">
          <div className="notice-icon">!</div>

          <div>
            <h3>Before You Continue</h3>

            <p>
              Read all rules carefully and join our official communities for
              updates, trials and announcements.
          </p>
          </div>
        </section>

        <section id="team-information" className="content-section">
          <div className="section-heading">
            <span>01</span>

            <div>
              <small>THE OVER POWER STANDARD</small>

              <h2>PLAY WITH DISCIPLINE. COMPETE WITH HONOUR.</h2>

              <p className="rules-tagline">
                Every member represents the name, values and future of Over
                Power Esports.
              </p>
            </div>
          </div>

          <div className="rules-grid">
            {rules.map((rule, index) => (
              <div className="rule-card" key={rule}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <p>{rule}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span>02</span>

              
            <div>
              <small>OFFICIAL NETWORK</small>
              <h2>Stay Connected</h2>
            </div>
          </div>

          <div className="network-grid">
            <div className="info-card">
              <small>SOCIAL MEDIA</small>

              <h3>Follow Over Power</h3>

              <p>
                Get official news, match updates, player announcements and
                exclusive content.
              </p>

              <div className="link-grid">
                {socialLinks.map((link) => (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    key={link.name}
                  >
                    <span>{link.icon}</span>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="info-card">
              <small>COMMUNITY HUB</small>

              <h3>Join Our Community</h3>

              <p>
                Connect with players, staff and other members of the Over Power
                community.
              </p>

              <div className="link-grid">
                <a href="#" target="_blank" rel="noreferrer" className="wa">
                  <span>◉</span>
                  WhatsApp Community
                </a>

                <a href="#" target="_blank" rel="noreferrer" className="dc">
                  <span>◈</span>
                  Discord Server
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span>03</span>

            <div>
              <small>DIRECT SUPPORT</small>
              <h2>Contact Team Staff</h2>
            </div>
          </div>

         <div className="contact-grid">
  {contacts.map((contact) => (
    <article className="staff-card" key={contact.role}>
      <div className="staff-top">
        <div className="staff-avatar">
          <img src={contact.image} alt={contact.name} />
        </div>

        <span className="availability">
          <i />
          AVAILABLE
        </span>
      </div>

      <small>{contact.role}</small>

      <h3>{contact.name}</h3>

      <p>{contact.number}</p>

      <a
        href={contact.href}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-cta"
      >
        <span>◉</span>
        CHAT ON WHATSAPP
        <b>↗</b>
      </a>
    </article>
  ))}
</div>
        </section>

        <section className="final-card">
          <div className="pulse-line" />

          <small>OFFICIAL PLAYER APPLICATION</small>

          <h2>REGISTER FOR OVER POWER ESPORTS</h2>

         <p>
  Enter your official verification code to unlock the Over Power Esports
  player registration form.
</p>

          <a href="/register" className="main-button">
            CONTINUE TO VERIFICATION <span>→</span>
          </a>
        </section>
      </div>

      <style jsx>{`
        .join-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding: 30px 18px 90px;
          color: #fff;
          background:
            radial-gradient(circle at 50% 0%, #43000d 0%, transparent 38%),
            linear-gradient(135deg, #050506, #160006 55%, #030304);
        }

        .join-page :global(.navbar) {
          position: relative;
          z-index: 5;
          margin-bottom: 35px;
        }

        .light-orb {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.22;
          animation: floatLight 6s ease-in-out infinite alternate;
        }

        .orb-one {
          top: 150px;
          left: -120px;
          background: #ff003c;
        }

        .orb-two {
          top: 700px;
          right: -130px;
          background: #8b001e;
          animation-delay: 2s;
        }

        .join-container {
          position: relative;
          z-index: 2;
          width: min(1080px, 100%);
          margin: auto;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 25px;
          color: #aaa;
          font-size: 13px;
          text-decoration: none;
          transition: 0.3s;
        }

        .back-link:hover {
          color: #ff2149;
        }

        .hero-card,
        .final-card {
          position: relative;
          overflow: hidden;
          text-align: center;
          border: 1px solid rgba(255, 28, 70, 0.55);
          border-radius: 24px;
          background: linear-gradient(145deg, #250008, #09090c 75%);
          box-shadow:
            0 0 35px rgba(255, 0, 50, 0.13),
            inset 0 0 35px rgba(255, 0, 50, 0.04);
        }

        .hero-card {
          padding: 70px 25px;
        }

        .hero-card::before,
        .final-card::before {
          position: absolute;
          top: 0;
          left: -100%;
          width: 70%;
          height: 1px;
          content: "";
          background: #ff1744;
          box-shadow: 0 0 18px #ff1744;
          animation: scanLine 4s linear infinite;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          padding: 8px 14px;
          color: #ff5270;
          border: 1px solid rgba(255, 35, 75, 0.45);
          border-radius: 30px;
          background: rgba(255, 20, 60, 0.08);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .live-badge span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ff1744;
          box-shadow: 0 0 12px #ff1744;
          animation: blink 1.2s infinite;
        }

        .eyebrow,
        .section-heading small,
        .info-card > small,
        .staff-card > small,
        .final-card > small {
          color: #ff3157;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .eyebrow {
          margin: 0 0 12px;
        }

        h1,
        h2,
        h3,
        .main-button,
        .live-badge,
        .staff-avatar {
          font-family: var(--font-orbitron), sans-serif;
        }

        h1 {
          margin: 0;
          font-size: clamp(36px, 8vw, 78px);
          letter-spacing: 3px;
        }

        h1 span {
          color: #ff244b;
          text-shadow: 0 0 24px rgba(255, 25, 65, 0.75);
        }

        .hero-text {
          max-width: 590px;
          margin: 22px auto 30px;
          color: #b9b9c0;
          font-size: 14px;
          line-height: 1.8;
        }

        .main-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-height: 48px;
          padding: 0 24px;
          color: #fff;
          border-radius: 8px;
          background: linear-gradient(100deg, #d90732, #ff3155);
          box-shadow: 0 0 24px rgba(255, 20, 55, 0.4);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
          text-decoration: none;
          transition: 0.3s;
        }

        .main-button:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 0 38px rgba(255, 20, 55, 0.75);
        }

        .notice-card {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-top: 20px;
          padding: 20px;
          border-left: 3px solid #ff2149;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.045);
        }

        .notice-icon {
          display: grid;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 50%;
          background: #f01640;
          box-shadow: 0 0 18px rgba(255, 20, 60, 0.65);
          font-weight: 900;
        }

        .notice-card h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .notice-card p,
        .info-card p,
        .final-card p {
          margin: 0;
          color: #aaaab2;
          font-size: 13px;
          line-height: 1.7;
        }

        .content-section {
          margin-top: 65px;
        }

        .section-heading {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 22px;
        }

        .section-heading > span {
          color: #ff244b;
          font-family: var(--font-orbitron), sans-serif;
          font-size: 22px;
          font-weight: 900;
        }

       @font-face {
  font-family: "Kalpurush";
  src: url("/kalpurush.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

.rules-tagline,
.rule-card p {
  font-family: "Kalpurush", sans-serif;
  font-weight: normal;
  letter-spacing: 0;
  line-height: 1.8;
}

        .rules-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}

.rule-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-height: 92px;
  padding: 22px 24px;
  border: 1px solid rgba(255, 20, 70, 0.45);
  border-radius: 14px;
  background: rgba(10, 10, 15, 0.82);
  box-shadow:
    inset 0 0 20px rgba(255, 0, 55, 0.04),
    0 0 18px rgba(255, 0, 55, 0.06);
}

.rule-card b {
  flex: 0 0 28px;
  color: #ff164b;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 1px;
}

.rules-tagline,
.rule-card p {
  font-family: "Kalpurush", sans-serif;
  font-weight: normal;
  letter-spacing: 0;
  line-height: 1.8;
}

.rule-card p {
  margin: 0;
  color: #eeeeee;
  font-size: 16px;
  text-align: left;
}

@media (max-width: 700px) {
  .rules-grid {
    grid-template-columns: 1fr;
  }

  .rule-card {
    min-height: auto;
    padding: 18px;
  }

  .rule-card p {
    font-size: 15px;
  }
}

        .network-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .info-card {
          padding: 25px;
          border-radius: 16px;
        }

        .info-card h3 {
          margin: 12px 0 8px;
          font-size: 17px;
        }

        .link-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
          margin-top: 20px;
        }

        .link-grid a {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 8px;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.3s;
        }

        .link-grid a:hover {
          border-color: #ff244b;
          background: rgba(255, 20, 60, 0.12);
        }

        .link-grid .wa {
          border-color: rgba(37, 211, 102, 0.45);
        }

        .link-grid .dc {
          border-color: rgba(88, 101, 242, 0.6);
        }

        .contact-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .staff-card {
          position: relative;
          overflow: hidden;
          padding: 22px;
          border-radius: 16px;
        }

        .staff-card::after {
          position: absolute;
          right: -35px;
          bottom: -35px;
          width: 100px;
          height: 100px;
          content: "";
          border-radius: 50%;
          background: #ff1744;
          filter: blur(55px);
          opacity: 0.16;
        }

        .staff-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

       .staff-avatar {
  width: 58px;
  height: 58px;
  padding: 3px;
  overflow: hidden;
  border: 2px solid #ff244b;
  border-radius: 50%;
  background: #600014;
  box-shadow:
    0 0 18px rgba(255, 20, 60, 0.75),
    0 0 35px rgba(255, 20, 60, 0.3);
}

.staff-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

        .availability {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #35e878;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .availability i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #35e878;
          box-shadow: 0 0 12px #35e878;
          animation: staffBlink 1.5s infinite;
        }

        .staff-card h3 {
          margin: 10px 0 8px;
          color: #fff;
          font-size: 16px;
        }

        .staff-card > p {
          margin: 0 0 20px;
          color: #aaa;
          font-size: 12px;
        }

        .whatsapp-cta {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 42px;
          padding: 0 12px;
          color: #35e878;
          border: 1px solid rgba(53, 232, 120, 0.45);
          border-radius: 8px;
          background: rgba(53, 232, 120, 0.07);
          box-shadow: 0 0 12px rgba(53, 232, 120, 0.12);
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
          transition: 0.3s ease;
        }

        .whatsapp-cta:hover {
          color: #fff;
          background: #159447;
          box-shadow: 0 0 22px rgba(53, 232, 120, 0.55);
        }

        .whatsapp-cta b {
          color: #fff;
          font-size: 17px;
        }

        .final-card {
          margin-top: 70px;
          padding: 50px 20px;
        }

        .final-card h2 {
          margin: 12px 0;
          font-size: clamp(24px, 5vw, 38px);
        }

        .final-card p {
          margin-bottom: 25px;
        }

        .pulse-line {
          width: 90px;
          height: 2px;
          margin: 0 auto 25px;
          background: #ff244b;
          box-shadow: 0 0 18px #ff244b;
          animation: pulse 1.5s infinite;
        }

        @keyframes blink {
          50% {
            opacity: 0.25;
          }
        }

        @keyframes staffBlink {
          50% {
            opacity: 0.3;
          }
        }

        @keyframes pulse {
          50% {
            opacity: 0.35;
            transform: scaleX(0.55);
          }
        }

        @keyframes scanLine {
          to {
            left: 130%;
          }
        }

        @keyframes floatLight {
          to {
            transform: translateY(35px) scale(1.15);
          }
        }

        @media (max-width: 720px) {
          .rules-grid,
          .network-grid,
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .hero-card {
            padding: 55px 18px;
          }
        }

        @media (max-width: 430px) {
          .link-grid {
            grid-template-columns: 1fr;
          }

          .join-page {
            padding-inline: 12px;
          }
        }
      `}</style>
    </main>
  );
}

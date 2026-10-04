import Link from "next/link";

const leadershipMembers = [
  {
    id: 1,
    name: "REJWAN AHMED",
    role: "Founder",
    image: "/leadership/founder.png",
    facebook: "https://www.facebook.com/rejwan.ahammed11?mibextid=wwXIfr&mibextid=wwXIfr",
    badge: "OWNER",
    subtitle: "The visionary Sponsor behind Over Power Esports",
  },
  {
    id: 2,
    name: "SHABUDDIN",
    role: "Team Manager",
    image: "/leadership/manager.png",
    facebook: "https://www.facebook.com/share/1HSgUVNcro/",
    badge: "LEADER",
    subtitle: "Managing operations Web developer and Team Leader",
  },
];

export default function Leadership() {
  return (
    <section className="leadership-section">
      <div className="leadership-header">
        <span className="leadership-kicker">♛ PREMIUM LEADERSHIP</span>
        <h2>♛ TEAM LEADERSHIP ♛</h2>
        <p>
          The core authority behind Over Power Esports — strategy, leadership,
          discipline and direction.
        </p>
      </div>

      <div className="leadership-grid">
        {leadershipMembers.map((member) => (
          <div className="leadership-card" key={member.id}>
            <div className="leadership-frame">
              <div className="leadership-image-wrap">
                <img src={member.image} alt={member.name} className="leadership-image" />
              </div>

              <div className="leadership-content">
                <span className="leadership-badge">{member.badge}</span>
                <h3>{member.name}</h3>
                <h4>{member.role}</h4>
                <p>{member.subtitle}</p>

                {member.facebook && (
                  <Link
                    href={member.facebook}
                    target="_blank"
                    className="leadership-social"
                  >
                    Facebook
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";
import logo from "../../assets/logo.png";

export default function PlayerRegister() {
  const [form, setForm] = useState({
    full_name: "",
    ign: "",
    freefire_uid: "",
    email: "",
    phone: "",
    age: "",
    birth_date: "",
    primary_role: "",
    secondary_role: "",
    device: "",
    internet_connection: [],
    practice_time: "",
    game_experience: "",
    tournament_experience: "",
    joining_date: "",
    average_br_kd_rate: "",
    expert_weapon: [],
    previous_team: "",
    full_address: "",
    social_media_link: "",
    team_name: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [gameScreenshot, setGameScreenshot] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleCheckbox(name, value) {
    setForm((prev) => {
      const current = prev[name];
      if (current.includes(value)) {
        return {
          ...prev,
          [name]: current.filter((item) => item !== value),
        };
      }
      return {
        ...prev,
        [name]: [...current, value],
      };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        const value = form[key];
        if (Array.isArray(value)) {
          formData.append(key, value.join(", "));
        } else {
          formData.append(key, value);
        }
      });

      if (profileImage) {
        formData.append("profile_image", profileImage);
      }
      if (gameScreenshot) {
        formData.append("game_id_screenshot", gameScreenshot);
      }

      const res = await fetch("/api/register-player", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Registration Successful ✅");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  const roles = [
    "1st Rusher",
    "2nd Rusher",
    "Supporter",
    "Supporter + Boomber",
    "All Rounder",
    "Sniper",
    "Coach",
  ];

  const secondaryRoles = [
    "1st Rusher",
    "2nd Rusher",
    "Supporter",
    "Boomber",
    "Sniper",
  ];

  const weapons = [
    "M590",
    "Woodpecker",
    "MAG7",
    "AC80",
    "UMP",
    "Trogon",
    "AWM",
    "Machine Gun",
  ];

  return (
    <main className="op-registration-page">
      <div className="op-registration-container">
        {/* HEADER */}
        <div className="op-header">
          <div className="op-logo">
            <img src={logo.src} alt="Over Power Esports Logo" />
          </div>
          <h1>OVER POWER</h1>
    
        </div>

        {/* MESSAGE */}
        {message && <div className="op-message">{message}</div>}

        <form onSubmit={submit}>
          {/* BASIC INFORMATION */}
          <section className="op-section">
            <h2>PLAYER REGISTRATION</h2>

            <Field
              label="Player Name"
              required
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            <Field
              label="In-Game Name (IGN)"
              required
              name="ign"
              value={form.ign}
              onChange={handleChange}
              placeholder="Enter your in-game name"
            />
            <Field
              label="Free Fire UID"
              required
              name="freefire_uid"
              value={form.freefire_uid}
              onChange={handleChange}
              placeholder="Enter your Free Fire UID"
            />
            <Field
              label="Age"
              required
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter your age"
            />
            <Field
              label="Birth Date"
              required
              name="birth_date"
              type="date"
              value={form.birth_date}
              onChange={handleChange}
            />
          </section>

          {/* PRIMARY ROLE */}
          <section className="op-section">
            <h3>
              Primary Role <span>*</span>
            </h3>
            <p className="help-text">Select your primary role in the squad.</p>
            <div className="radio-list">
              {roles.map((role) => (
                <label key={role} className="choice">
                  <input
                    type="radio"
                    name="primary_role"
                    value={role}
                    checked={form.primary_role === role}
                    onChange={handleChange}
                    required
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </section>

          {/* SECONDARY ROLE */}
          <section className="op-section">
            <h3>
              Secondary Role <span>*</span>
            </h3>
            <div className="radio-list">
              {secondaryRoles.map((role) => (
                <label key={role} className="choice">
                  <input
                    type="radio"
                    name="secondary_role"
                    value={role}
                    checked={form.secondary_role === role}
                    onChange={handleChange}
                    required
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section className="op-section">
            <h3>
              Phone Number <span>*</span>
            </h3>
            <Field
              label=""
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
            <Field
              label="Email Address"
              required
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
            <Field
              label="Full Address"
              name="full_address"
              value={form.full_address}
              onChange={handleChange}
              placeholder="Enter your full address"
              textarea
            />
          </section>

          {/* DEVICE */}
          <section className="op-section">
            <h3>
              Device <span>*</span>
            </h3>
            <Field
              label=""
              name="device"
              value={form.device}
              onChange={handleChange}
              placeholder="Enter your mobile/device name"
              required
            />
          </section>

          {/* INTERNET */}
          <section className="op-section">
            <h3>
              Internet Connection Select <span>*</span>
            </h3>
            <p className="help-text">
              Select your available internet connection.
            </p>
            <div className="check-list">
              {["Wi-Fi", "Mobile Data", "IPS+UPS"].map((item) => (
                <label key={item} className="choice">
                  <input
                    type="checkbox"
                    checked={form.internet_connection.includes(item)}
                    onChange={() => handleCheckbox("internet_connection", item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
              <label className="choice">
                <input
                  type="checkbox"
                  checked={form.internet_connection.includes("Other")}
                  onChange={() => handleCheckbox("internet_connection", "Other")}
                />
                <span>Other</span>
              </label>
            </div>
          </section>

          {/* EXPERIENCE */}
          <section className="op-section">
            <h3>
              Practice Time <span>*</span>
            </h3>
            <Field
              label=""
              name="practice_time"
              value={form.practice_time}
              onChange={handleChange}
              placeholder="Example: 6:00 PM - 8:00 PM"
              required
            />
            <h3>
              Game Experience <span>*</span>
            </h3>
            <Field
              label=""
              name="game_experience"
              value={form.game_experience}
              onChange={handleChange}
              placeholder="Example: 3 Years"
              required
            />
            <h3>
              Tournament Experience <span>*</span>
            </h3>
            <Field
              label=""
              name="tournament_experience"
              value={form.tournament_experience}
              onChange={handleChange}
              placeholder="Describe your tournament experience"
              required
            />
          </section>

          {/* JOINING DATE */}
          <section className="op-section">
            <h3>
              Joining Date <span>*</span>
            </h3>
            <p className="help-text">
              Over Power Esports-এ যোগদানের তারিখ নির্বাচন করুন।
            </p>
            <input
              className="op-input"
              type="date"
              name="joining_date"
              value={form.joining_date}
              onChange={handleChange}
              required
            />
          </section>

          {/* K/D */}
          <section className="op-section">
            <h3>
              Average BR K/D Rate <span>*</span>
            </h3>
            <div className="radio-list">
              {["1", "2", "3", "4", "5", "6", "7", "8"].map((kd) => (
                <label key={kd} className="choice">
                  <input
                    type="radio"
                    name="average_br_kd_rate"
                    value={kd}
                    checked={form.average_br_kd_rate === kd}
                    onChange={handleChange}
                    required
                  />
                  <span>{kd}</span>
                </label>
              ))}
            </div>
          </section>

          {/* WEAPONS */}
          <section className="op-section">
            <h3>Expert Weapon ⚔️</h3>
            <p className="help-text">
              যেসব weapon-এ আপনি expert সেগুলো নির্বাচন করুন।
            </p>
            <div className="check-list">
              {weapons.map((weapon) => (
                <label key={weapon} className="choice">
                  <input
                    type="checkbox"
                    checked={form.expert_weapon.includes(weapon)}
                    onChange={() => handleCheckbox("expert_weapon", weapon)}
                  />
                  <span>{weapon}</span>
                </label>
              ))}
            </div>
          </section>

        {/* TEAM */}
<section className="op-section">
  <h3>
    Previous Team <span>*</span>
  </h3>
  <Field
    label=""
    name="previous_team"
    value={form.previous_team}
    onChange={handleChange}
    placeholder="Enter previous team name or None"
    required
  />

  <h3 style={{ marginTop: "28px" }}>
    Team Name <span>*</span>
  </h3>
  <p className="help-text">
    আপনি কোন টিমে যোগ দিতে চান সিলেক্ট করুন।
  </p>
  <div className="radio-list">
    <label className="choice">
      <input
        type="radio"
        name="team_name"
        value="Over Power"
        checked={form.team_name === "Over Power"}
        onChange={handleChange}
        required
      />
      <span>Over Power</span>
    </label>

    <label className="choice">
      <input
        type="radio"
        name="team_name"
        value="Over Power Elite"
        checked={form.team_name === "Over Power Elite"}
        onChange={handleChange}
        required
      />
      <span>Over Power Elite</span>
    </label>
  </div>
</section>

          {/* SOCIAL */}
          <section className="op-section">
            <h3>
              Social Media Link <span>*</span>
            </h3>
            <p className="help-text">
              Facebook / TikTok / YouTube / Instagram profile link
            </p>
            <Field
              label=""
              name="social_media_link"
              value={form.social_media_link}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
          </section>

          {/* IMAGE */}
          <section className="op-section">
            <h3>
              Profile Image <span>*</span>
            </h3>
            <p className="help-text">
              আপনার একটি পরিষ্কার profile image upload করুন।
            </p>
            <input
              className="op-file"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
            />
          </section>

          {/* SCREENSHOT */}
          <section className="op-section">
            <h3>Game ID Screenshot</h3>
            <p className="help-text">
              আপনার Free Fire Game ID-এর screenshot upload করুন।
            </p>
            <input
              className="op-file"
              type="file"
              accept="image/*"
              onChange={(e) => setGameScreenshot(e.target.files?.[0] || null)}
            />
          </section>

          {/* SUBMIT */}
          <section className="op-submit-section">
            <button type="submit" className="op-submit" disabled={loading}>
              {loading ? "Submitting..." : "SUBMIT REGISTRATION"}
            </button>
          </section>
        </form>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

       /* ========== PREMIUM SECTION ========== */
.op-section {
  background: linear-gradient(165deg, #111111 0%, #0a0a0a 100%);
  border: 1px solid rgba(255, 30, 50, 0.22);
  border-left: 4px solid #e90018;
  border-radius: 18px;
  padding: 40px 30px 36px;
  margin-bottom: 30px;
  box-shadow: 
    0 18px 45px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(233, 0, 24, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
  transition: all 0.35s ease;
}

.op-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 40, 60, 0.55),
    transparent
  );
}

.op-section:hover {
  border-color: rgba(255, 30, 50, 0.45);
  box-shadow: 
    0 22px 55px rgba(0, 0, 0, 0.7),
    0 0 50px rgba(233, 0, 24, 0.15);
  transform: translateY(-2px);
}

.op-section h2 {
  margin: 0 0 36px;
  text-align: center;
  color: #ff2032;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  text-shadow: 0 0 22px rgba(255, 32, 50, 0.45);
  position: relative;
}

.op-section h2::after {
  content: "";
  display: block;
  width: 70px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e90018, transparent);
  margin: 14px auto 0;
  box-shadow: 0 0 12px rgba(233, 0, 24, 0.5);
}
/* ========== FIELD SPACING (সবচেয়ে গুরুত্বপূর্ণ) ========== */
.field {
  margin-bottom: 28px !important;
}

.field:last-child {
  margin-bottom: 0 !important;
}

.field label {
  display: block;
  margin-bottom: 10px !important;
  color: #e5e5e5;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.op-input,
.op-textarea {
  width: 100%;
  padding: 16px 18px !important;
  border-radius: 12px;
  border: 1px solid #2c2c2c;
  background: #0b0b0b;
  color: white;
  outline: none;
  font-size: 15px;
  transition: all 0.25s ease;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45);
}

.op-input:focus,
.op-textarea:focus {
  border-color: #e90018;
  background: #111;
  box-shadow: 
    0 0 0 3px rgba(233, 0, 24, 0.2),
    0 0 24px rgba(233, 0, 24, 0.15),
    inset 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* ========== FIELD SPACING ========== */
.field {
  margin-bottom: 26px;              /* আগে 20px ছিল → এখন বেশি */
}

.field:last-child {
  margin-bottom: 0;
}

.field label {
  display: block;
  margin-bottom: 9px;               /* label আর input এর মধ্যে বেশি জায়গা */
  color: #e0e0e0;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.7px;
}

.op-input,
.op-textarea {
  width: 100%;
  padding: 15px 18px;               /* একটু বড় padding */
  border-radius: 12px;
  border: 1px solid #2c2c2c;
  background: #0b0b0b;
  color: white;
  outline: none;
  font-size: 15px;
  transition: all 0.25s ease;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45);
}

.op-input:focus,
.op-textarea:focus {
  border-color: #e90018;
  background: #111;
  box-shadow: 0 0 0 3px rgba(233, 0, 24, 0.2),
              0 0 24px rgba(233, 0, 24, 0.15),
              inset 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* Radio / Checkbox list spacing */
.radio-list,
.check-list {
  display: flex;
  flex-direction: column;
  gap: 8px;                         /* আইটেমগুলোর মধ্যে সুন্দর gap */
  margin-top: 6px;
}

.choice {
  display: flex !important;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;               /* বেশি padding */
  border-radius: 11px;
  cursor: pointer;
  color: #ddd;
  font-size: 14.5px;
  transition: all 0.2s ease;
  width: 100%;
}

.choice:hover {
  background: rgba(255, 30, 50, 0.09);
  color: #fff;
}

        /* ========== PREMIUM SECTION ========== */
        .op-section {
          background: linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%);
          border: 1px solid rgba(255, 30, 50, 0.18);
          border-left: 4px solid #e90018;
          border-radius: 18px;
          padding: 28px 24px;
          margin-bottom: 24px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.55),
            0 0 30px rgba(233, 0, 24, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .op-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 30, 50, 0.45),
            transparent
          );
        }

        .op-section:hover {
          border-color: rgba(255, 30, 50, 0.4);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.65),
            0 0 40px rgba(233, 0, 24, 0.12);
        }

        .op-section h2 {
          margin: 0 0 24px;
          text-align: center;
          color: #ff2032;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(255, 32, 50, 0.4);
        }

        .op-section h2::after {
          content: "";
          display: block;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #e90018, transparent);
          margin: 10px auto 0;
        }

        .op-section h3 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }

        .op-section h3 span {
          color: #ff2638;
        }

        .help-text {
          color: #4ade80 !important;
          font-size: 13px;
          margin: 0 0 16px !important;
          line-height: 1.4;
        }

        /* ========== FIELD & INPUT ========== */
        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #ddd;
          font-size: 13.5px;
          font-weight: 600;
        }

        .required {
          color: #ff2537;
        }

        .op-input,
        .op-textarea {
          width: 100%;
          padding: 14px 16px;
          border-radius: 11px;
          border: 1px solid #2c2c2c;
          background: #0b0b0b;
          color: white;
          outline: none;
          font-size: 14.5px;
          transition: all 0.25s ease;
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.4);
        }

        .op-input::placeholder,
        .op-textarea::placeholder {
          color: #666;
        }

        .op-input:hover,
        .op-textarea:hover {
          border-color: #3f3f3f;
        }

        .op-input:focus,
        .op-textarea:focus {
          border-color: #e90018;
          background: #111;
          box-shadow: 0 0 0 3px rgba(233, 0, 24, 0.18),
            0 0 22px rgba(233, 0, 24, 0.12),
            inset 0 2px 5px rgba(0, 0, 0, 0.3);
        }

        .op-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .op-input[type="date"] {
          color-scheme: dark;
        }

        /* ========== RADIO + CHECKBOX ========== */
        .radio-list,
        .check-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .choice {
          display: flex !important;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          cursor: pointer;
          color: #ddd;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
        }

        .choice:hover {
          background: rgba(255, 30, 50, 0.08);
          color: #fff;
        }

        .choice input[type="radio"],
        .choice input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #555;
          margin: 0;
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .choice input[type="radio"] {
          border-radius: 50%;
        }

        .choice input[type="checkbox"] {
          border-radius: 4px;
        }

        .choice input[type="radio"]:checked,
        .choice input[type="checkbox"]:checked {
          border-color: #e90018;
          background: #e90018;
          box-shadow: 0 0 14px rgba(233, 0, 24, 0.55);
        }

        .choice input[type="radio"]:checked::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
        }

        .choice input[type="checkbox"]:checked::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        /* ========== FILE INPUT ========== */
        .op-file {
          width: 100%;
          padding: 14px;
          border-radius: 11px;
          border: 1px dashed #555;
          background: #0b0b0b;
          color: #bbb;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .op-file:hover {
          border-color: #e90018;
          background: #111;
        }

        /* ========== SUBMIT ========== */
        .op-submit-section {
          padding: 10px 0 20px;
        }

        .op-submit {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 17px;
          background: linear-gradient(90deg, #ff0018, #c90016);
          color: white;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(255, 0, 20, 0.3);
          transition: all 0.25s ease;
        }

        .op-submit:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 12px 35px rgba(255, 0, 20, 0.4);
        }

        .op-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 600px) {
         /* পুরনোটা মুছে দিবে */
.op-registration-page {
  ...
}

/* নতুনটা বসাবে */
.op-registration-page {
  min-height: 100vh;
  background: 
    radial-gradient(
      ellipse 80% 50% at 50% -20%,
      rgba(180, 0, 20, 0.55) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 60% 40% at 0% 30%,
      rgba(120, 0, 15, 0.35) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 60% 40% at 100% 40%,
      rgba(120, 0, 15, 0.3) 0%,
      transparent 60%
    ),
    radial-gradient(
      circle at 50% 50%,
      #2a0008 0%,
      #120005 45%,
      #050505 100%
    );
  padding: 40px 15px 80px;
  color: white;
  font-family: Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.op-registration-page::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(
      circle at 20% 20%,
      rgba(255, 20, 40, 0.06) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(255, 20, 40, 0.05) 0%,
      transparent 40%
    );
  pointer-events: none;
  z-index: 0;
}

.op-registration-container {
  position: relative;
  z-index: 1;
}
      `}</style>
    </main>
  );
}

/* INPUT COMPONENT */
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  textarea = false,
}) {
  return (
    <div className="field">
      {label && (
        <label>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      {textarea ? (
        <textarea
          className="op-textarea"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          className="op-input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}

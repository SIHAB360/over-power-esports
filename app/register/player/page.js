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

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
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
          <p>PLAYER REGISTRATION</p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="op-message">
            {message}
          </div>
        )}

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

            <p className="help-text">
              Select your primary role in the squad.
            </p>

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
                    onChange={() =>
                      handleCheckbox("internet_connection", item)
                    }
                  />
                  <span>{item}</span>
                </label>
              ))}

              <label className="choice">
                <input
                  type="checkbox"
                  checked={form.internet_connection.includes("Other")}
                  onChange={() =>
                    handleCheckbox("internet_connection", "Other")
                  }
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
            <h3>
              Expert Weapon ⚔️
            </h3>

            <p className="help-text">
              যেসব weapon-এ আপনি expert সেগুলো নির্বাচন করুন।
            </p>

            <div className="check-list">
              {weapons.map((weapon) => (
                <label key={weapon} className="choice">
                  <input
                    type="checkbox"
                    checked={form.expert_weapon.includes(weapon)}
                    onChange={() =>
                      handleCheckbox("expert_weapon", weapon)
                    }
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

            <Field
              label="Team Name"
              name="team_name"
              value={form.team_name}
              onChange={handleChange}
              placeholder="Enter current/team name"
            />
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
              onChange={(e) =>
                setProfileImage(e.target.files?.[0] || null)
              }
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
              onChange={(e) =>
                setGameScreenshot(e.target.files?.[0] || null)
              }
            />
          </section>

          {/* SUBMIT */}
          <section className="op-submit-section">
            <button
              type="submit"
              className="op-submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "SUBMIT REGISTRATION"}
            </button>
          </section>

        </form>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .op-registration-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top,
              #3b0000 0%,
              #110000 35%,
              #050505 75%
            );
          padding: 30px 15px 60px;
          color: white;
          font-family: Arial, sans-serif;
        }

        .op-registration-container {
          width: 100%;
          max-width: 720px;
          margin: auto;
        }

        .op-header {
          text-align: center;
          padding: 30px 20px;
          margin-bottom: 20px;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #080808,
            #250000
          );
          border: 1px solid #4a0000;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.6);
        }

        .op-logo {
          width: 75px;
          height: 75px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #ff0018,
            #720000
          );
          font-size: 25px;
          font-weight: 900;
          box-shadow: 0 0 25px rgba(255, 0, 0, 0.35);
        }

        .op-header h1 {
          margin: 15px 0 5px;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .op-header p {
          margin: 0;
          color: #ff3945;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .op-message {
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 10px;
          background: #101010;
          border: 1px solid #ff1728;
          text-align: center;
          font-weight: bold;
        }

        .op-section {
          background: #101010;
          border: 1px solid #292929;
          border-left: 3px solid #e90018;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 16px;
          box-shadow: 0 7px 25px rgba(0, 0, 0, 0.35);
        }

        .op-section h2 {
          margin: 0 0 22px;
          text-align: center;
          color: #ff2032;
          font-size: 22px;
        }

        .op-section h3 {
          margin: 5px 0 10px;
          font-size: 16px;
          color: #ffffff;
        }

        .op-section h3 span {
          color: #ff2638;
        }

        .help-text {
          color: #999;
          font-size: 12px;
          line-height: 1.5;
          margin: 0 0 15px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #ddd;
          font-size: 13px;
          font-weight: bold;
        }

        .required {
          color: #ff2537;
        }

        .op-input,
        .op-textarea {
          width: 100%;
          padding: 13px 14px;
          border-radius: 8px;
          border: 1px solid #3b3b3b;
          background: #181818;
          color: white;
          outline: none;
          font-size: 14px;
          transition: 0.2s;
        }

        .op-input:focus,
        .op-textarea:focus {
          border-color: #ff1d31;
          box-shadow: 0 0 0 2px rgba(255, 0, 30, 0.12);
        }

        .op-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .radio-list,
        .check-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .choice {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #ddd;
          font-size: 14px;
        }

        .choice input {
          width: 17px;
          height: 17px;
          accent-color: #ff1629;
        }

        .op-file {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          border: 1px dashed #555;
          background: #181818;
          color: #bbb;
        }

        .op-submit-section {
          padding: 5px 0;
        }

        .op-submit {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 16px;
          background: linear-gradient(
            90deg,
            #ff0018,
            #c90016
          );
          color: white;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(255, 0, 20, 0.25);
        }

        .op-submit:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        .op-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .op-registration-page {
            padding: 15px 10px 40px;
          }

          .op-header h1 {
            font-size: 25px;
          }

          .op-section {
            padding: 17px;
          }
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
          {label}{" "}
          {required && <span className="required">*</span>}
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

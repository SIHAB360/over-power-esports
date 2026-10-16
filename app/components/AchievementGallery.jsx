"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";
import {
  FiAward, FiArrowDown, FiArrowLeft, FiArrowRight,
  FiMaximize2, FiRefreshCw, FiX,
} from "react-icons/fi";

const BUCKET = "achievement-gallery";
const PAGE_SIZE = 12;

const filters = [
  { value: "all", label: "ALL MOMENTS" },
  { value: "result", label: "TOURNAMENT RESULTS" },
  { value: "ingame", label: "IN-GAME" },
];

function getImageUrl(path) {
  if (!path) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function loadGalleryPage(offset, category, teamId) {
  let query = supabase
    .from("achievement_gallery")
    .select("id, file_path, category, title, team_id")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(offset, offset + PAGE_SIZE);

  if (category !== "all") query = query.eq("category", category);
  if (teamId !== "all") query = query.eq("team_id", teamId);

  const { data, error } = await query;
  if (error) throw error;
  const rows = data || [];
  return { rows: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE };
}

export default function AchievementGallery() {
  const [category, setCategory] = useState("all");
  const [teamId, setTeamId] = useState("all");
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);

  const activeCategory = useRef(category);
  const activeTeam = useRef(teamId);
  activeCategory.current = category;
  activeTeam.current = teamId;

  useEffect(() => {
    let active = true;

    async function loadTeams() {
      setTeamsLoading(true);

      try {
        const { data, error } = await supabase
          .from("public_teams")
          .select("id, team_name, logo")
          .eq("status", "active")
          .order("team_name", { ascending: true });

        if (error) throw error;

        if (active) {
          setTeams(data || []);
        }
      } catch (err) {
        // Keep the gallery usable even if the optional team list fails.
        if (active) setTeams([]);
      } finally {
        if (active) setTeamsLoading(false);
      }
    }

    loadTeams();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setItems([]);
    setHasMore(false);
    setError("");

    loadGalleryPage(0, category, teamId)
      .then(({ rows, hasMore: more }) => {
        if (!active) return;
        setItems(rows);
        setHasMore(more);
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Could not load achievements.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, teamId, reload]);

  async function showMore() {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);

    const currentCategory = category;
    const currentTeam = teamId;

    try {
      const page = await loadGalleryPage(
        items.length,
        currentCategory,
        currentTeam
      );

      // Do not append stale results after a category/team change.
      if (
        currentCategory !== activeCategory.current ||
        currentTeam !== activeTeam.current
      ) {
        return;
      }

      setItems((previous) => [...previous, ...page.rows]);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err?.message || "Could not load more screenshots.");
    } finally {
      setLoadingMore(false);
    }
  }

  const activeItem = selected === null ? null : items[selected] || null;

  useEffect(() => {
    if (!activeItem) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") {
        setSelected(null);
      }

      if (event.key === "ArrowRight") {
        setSelected((index) => (index + 1) % items.length);
      }

      if (event.key === "ArrowLeft") {
        setSelected(
          (index) => (index - 1 + items.length) % items.length
        );
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [activeItem, items.length]);

  return (
    <section
      id="achievements"
      className="op-achieve"
      aria-labelledby="op-achieve-title"
    >
      <div
        className="op-achieve__aura op-achieve__aura--mint"
        aria-hidden="true"
      />
      <div
        className="op-achieve__aura op-achieve__aura--violet"
        aria-hidden="true"
      />
      <div className="op-achieve__beam" aria-hidden="true" />

      <div className="op-achieve__container">
        <header className="op-achieve__header">
          <div className="op-achieve__eyebrow">
            <span className="op-achieve__dot" />
            THE OFFICIAL VICTORY ARCHIVEMENT
            <FiAward />
          </div>

          <h2 id="op-achieve-title">
            OUR GLORY <span>ACHIVEMENT.</span>
          </h2>

          <p>
            Every result. Every clutch. Every unforgettable moment.
          </p>

          <div className="op-achieve__ornament" aria-hidden="true">
            <i />
            <span>✦</span>
            <i />
          </div>
        </header>

        <div className="op-achieve__toolbar">
          <div
            className="op-achieve__filters"
            role="group"
            aria-label="Filter gallery categories"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`op-achieve__filter ${
                  category === filter.value
                    ? "op-achieve__filter--active"
                    : ""
                }`}
                onClick={() => {
                  setSelected(null);
                  setCategory(filter.value);
                }}
                aria-pressed={category === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="op-achieve__team-filter">
            <span className="op-achieve__team-label">TEAM</span>

            <div className="op-achieve__team-select-wrap">
              <select
                className="op-achieve__team-select"
                value={teamId}
                onChange={(event) => {
                  setSelected(null);
                  setTeamId(event.target.value);
                }}
                disabled={teamsLoading}
                aria-label="Filter achievement gallery by team"
              >
                <option value="all">ALL TEAMS</option>

                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="op-achieve__live">
            <span /> LIVE GALLERY
          </span>
        </div>

        {loading ? (
          <div className="op-achieve__loading" role="status">
            <div className="op-achieve__loader" />
            LOADING THE HALL OF GLORY...
          </div>
        ) : error && items.length === 0 ? (
          <div className="op-achieve__empty" role="alert">
            <FiRefreshCw size={28} />

            <strong>GALLERY UNAVAILABLE</strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => setReload((n) => n + 1)}
            >
              TRY AGAIN
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="op-achieve__empty">
            <FiAward size={34} />

            <strong>
              THE NEXT LEGENDARY MOMENT IS COMING
            </strong>

            <p>
              Our published tournament results and in-game
              screenshots will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="op-achieve__gallery">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`op-achieve__photo ${
                    index === 0 || index === 1
                      ? "op-achieve__photo--featured"
                      : ""
                  }`}
                  onClick={() => setSelected(index)}
                  aria-label={`View ${
                    item.category === "ingame"
                      ? "in-game screenshot"
                      : "tournament result"
                  } ${index + 1} fullscreen`}
                >
                  <img
                    src={getImageUrl(item.file_path)}
                    alt={
                      item.category === "ingame"
                        ? "Over Power Esports in-game screenshot"
                        : "Over Power Esports tournament result screenshot"
                    }
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />

                  <span
                    className="op-achieve__photo-shine"
                    aria-hidden="true"
                  />

                  <span className="op-achieve__photo-tag">
                    {item.category === "ingame" ? "IN-GAME" : "RESULT"}
                  </span>

                  {item.team_id && (
                    <span className="op-achieve__photo-team">
                      {teams.find(
                        (team) => team.id === item.team_id
                      )?.team_name || "TEAM"}
                    </span>
                  )}

                  <span className="op-achieve__photo-open">
                    <FiMaximize2 aria-hidden="true" /> VIEW
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <p className="op-achieve__more-error" role="alert">
                {error}
              </p>
            )}

            {hasMore && (
              <div className="op-achieve__more-wrap">
                <button
                  className="op-achieve__more"
                  type="button"
                  onClick={showMore}
                  disabled={loadingMore}
                >
                  {loadingMore
                    ? "LOADING..."
                    : "EXPLORE MORE MOMENTS"}

                  <FiArrowDown aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}

        <div className="op-achieve__footerline">
          <span>POWER</span>
          <b>✦</b>
          <span>UNITY</span>
          <b>✦</b>
          <span>DOMINATION</span>
        </div>
      </div>

      {activeItem &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="op-achieve__viewer"
            role="dialog"
            aria-modal="true"
            aria-label="Achievement screenshot viewer"
            onClick={() => setSelected(null)}
          >
            <button
              type="button"
              className="op-achieve__viewer-close"
              onClick={() => setSelected(null)}
              aria-label="Close image"
            >
              <FiX />
            </button>

            <div
              className="op-achieve__viewer-inner"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={getImageUrl(activeItem.file_path)}
                alt={
                  activeItem.category === "ingame"
                    ? "Fullsize in-game screenshot"
                    : "Fullsize tournament result screenshot"
                }
              />

              <div className="op-achieve__viewer-toolbar">
                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      (selected - 1 + items.length) % items.length
                    )
                  }
                  aria-label="Previous image"
                >
                  <FiArrowLeft />
                </button>

                <span>
                  {activeItem.category === "ingame"
                    ? "IN-GAME MOMENT"
                    : "TOURNAMENT RESULT"}{" "}
                  · {selected + 1} / {items.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      (selected + 1) % items.length
                    )
                  }
                  aria-label="Next image"
                >
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <style jsx global>{`
        .op-achieve,
        .op-achieve *,
        .op-achieve *::before,
        .op-achieve *::after,
        .op-achieve__viewer,
        .op-achieve__viewer * {
          box-sizing: border-box;
        }

        .op-achieve {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          width: 100%;
          max-width: 100%;
          margin: 40px auto 55px;
          padding: clamp(54px, 7vw, 96px) 22px 65px;
          scroll-margin-top: 110px;
          color: #f5fcff;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(
              ellipse at 10% 5%,
              rgba(36, 211, 187, 0.12),
              transparent 36%
            ),
            radial-gradient(
              ellipse at 95% 65%,
              rgba(124, 87, 240, 0.12),
              transparent 40%
            ),
            linear-gradient(
              155deg,
              #07151d,
              #060917 58%,
              #0a0817
            );
          border: 1px solid rgba(130, 240, 229, 0.18);
          border-radius: 32px;
          box-shadow:
            0 20px 90px rgba(0, 0, 0, 0.28),
            inset 0 0 60px rgba(50, 210, 198, 0.025);
          text-align: left;
        }

        .op-achieve::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image:
            linear-gradient(
              rgba(177, 239, 240, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(177, 239, 240, 0.035) 1px,
              transparent 1px
            );
          background-size: 64px 64px;
        }

        .op-achieve__aura {
          position: absolute;
          z-index: -1;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(90px);
          animation: opAchieveBreathe 8s ease-in-out infinite
            alternate;
        }

        .op-achieve__aura--mint {
          width: 420px;
          height: 420px;
          top: -210px;
          left: -175px;
          background: rgba(33, 220, 187, 0.23);
        }

        .op-achieve__aura--violet {
          width: 480px;
          height: 430px;
          right: -230px;
          bottom: -155px;
          background: rgba(117, 68, 247, 0.22);
          animation-delay: -3s;
        }

        .op-achieve__beam {
          position: absolute;
          left: -40%;
          top: 0;
          width: 35%;
          height: 2px;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            #5dffde,
            #ecc691,
            transparent
          );
          box-shadow: 0 0 18px #6dfde1;
          animation: opAchieveBeam 10s linear infinite;
        }

        .op-achieve__container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1370px;
          margin: 0 auto;
        }

        .op-achieve__header {
          text-align: center;
          margin: 0 0 37px;
        }

        .op-achieve__eyebrow {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 11px;
          color: #86efdf;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2.7px;
        }

        .op-achieve__dot,
        .op-achieve__live span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #65f8ce;
          box-shadow: 0 0 14px rgba(81, 252, 208, 0.8);
        }

        .op-achieve__header h2 {
          margin: 19px 0 12px !important;
          font-size: clamp(37px, 6.9vw, 82px);
          line-height: 1.06;
          font-weight: 950;
          letter-spacing: -2px;
          color: #fff;
          text-shadow: 0 0 28px rgba(213, 241, 255, 0.18);
        }

        .op-achieve__header h2 span {
          background: linear-gradient(
            100deg,
            #84f6e5,
            #c6b4ff,
            #ffdda2
          );
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          filter: drop-shadow(
            0 0 13px rgba(130, 227, 225, 0.2)
          );
        }

        .op-achieve__header p {
          margin: 0 auto !important;
          max-width: 560px;
          color: #cbd9e2;
          font-size: 15px;
          line-height: 1.6;
        }

        .op-achieve__ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 23px;
          color: #efcd95;
        }

        .op-achieve__ornament i {
          display: block;
          width: 83px;
          max-width: 19vw;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #78e9da
          );
        }

        .op-achieve__ornament i:last-child {
          transform: rotate(180deg);
        }

        .op-achieve__toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 23px;
          flex-wrap: wrap;
        }

        .op-achieve__filters {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .op-achieve__team-filter {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 8px 6px 12px;
          border: 1px solid rgba(198, 180, 255, 0.28);
          border-radius: 999px;
          background:
            linear-gradient(
              135deg,
              rgba(122, 83, 224, 0.13),
              rgba(42, 215, 194, 0.08)
            );
          box-shadow:
            inset 0 0 18px rgba(141, 111, 255, 0.05),
            0 0 18px rgba(123, 91, 231, 0.08);
        }

        .op-achieve__team-label {
          color: #d9c9ff;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 1.8px;
        }

        .op-achieve__team-select-wrap {
          position: relative;
        }

        .op-achieve__team-select {
          appearance: none;
          -webkit-appearance: none;
          min-width: 175px;
          min-height: 38px;
          padding: 0 34px 0 13px;
          border: 1px solid rgba(255, 221, 162, 0.34);
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.8px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.09),
              rgba(255, 255, 255, 0.025)
            ),
            #0b1020;
          box-shadow: 0 0 16px rgba(198, 180, 255, 0.08);
        }

        .op-achieve__team-select-wrap::after {
          content: "⌄";
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-55%);
          pointer-events: none;
          color: #aef8e7;
          font-size: 14px;
          font-weight: 900;
          text-shadow: 0 0 10px rgba(111, 247, 222, 0.55);
        }

        .op-achieve__team-select:hover,
        .op-achieve__team-select:focus {
          border-color: #9ef5e6;
          box-shadow: 0 0 20px rgba(90, 231, 208, 0.17);
        }

        .op-achieve__team-select:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .op-achieve__team-select option {
          background: #0b1020;
          color: #fff;
        }

        .op-achieve__filter {
          border: 1px solid rgba(151, 224, 233, 0.22);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.038);
          color: #bfcbd9;
          padding: 11px 15px;
          min-height: 42px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.05px;
          transition: 0.24s ease;
        }

        .op-achieve__filter:hover,
        .op-achieve__filter--active {
          border-color: rgba(101, 245, 222, 0.78);
          background: rgba(55, 209, 191, 0.14);
          color: #effffb;
          box-shadow: 0 0 18px rgba(69, 223, 206, 0.16);
        }

        .op-achieve__live {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #a6e8dd;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .op-achieve__gallery {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 15px;
        }

        .op-achieve__photo {
          position: relative;
          display: block;
          grid-column: span 4;
          min-width: 0;
          aspect-ratio: 1.35;
          overflow: hidden;
          padding: 0;
          cursor: zoom-in;
          border-radius: 18px;
          border: 1px solid rgba(166, 222, 238, 0.26);
          background: linear-gradient(135deg, #162638, #17102c);
          color: #fff;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
          transition:
            transform 0.32s,
            box-shadow 0.32s,
            border-color 0.32s;
        }

        .op-achieve__photo--featured {
          grid-column: span 6;
          aspect-ratio: 1.7;
        }

        .op-achieve__photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform 0.6s ease,
            filter 0.5s ease;
        }

        .op-achieve__photo::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 35%,
            rgba(1, 5, 13, 0.72)
          );
        }

        .op-achieve__photo::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          z-index: 2;
          pointer-events: none;
          border: 1px solid rgba(105, 241, 231, 0.09);
          box-shadow: inset 0 0 25px rgba(90, 242, 227, 0.04);
          transition: box-shadow 0.3s;
        }

        .op-achieve__photo-shine {
          position: absolute;
          z-index: 2;
          top: -60%;
          left: -80%;
          width: 55%;
          height: 220%;
          pointer-events: none;
          transform: rotate(23deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(203, 255, 250, 0.19),
            transparent
          );
          animation: opAchieveShine 11s ease-in-out infinite;
        }

        .op-achieve__photo:nth-child(3n)
          .op-achieve__photo-shine {
          animation-delay: -5s;
        }

        .op-achieve__photo:hover,
        .op-achieve__photo:focus-visible {
          transform: translateY(-5px);
          border-color: #9df3e7;
          box-shadow:
            0 0 33px rgba(51, 231, 204, 0.25),
            0 13px 38px rgba(0, 0, 0, 0.36);
        }

        .op-achieve__photo:hover img {
          transform: scale(1.065);
          filter: saturate(1.1);
        }

        .op-achieve__photo-tag,
        .op-achieve__photo-team,
        .op-achieve__photo-open {
          position: absolute;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .op-achieve__photo-tag {
          left: 14px;
          bottom: 14px;
          padding: 9px 11px;
          border: 1px solid rgba(204, 241, 235, 0.3);
          border-radius: 999px;
          backdrop-filter: blur(12px);
          background: rgba(6, 15, 24, 0.58);
          color: #f6f8ff;
        }

        .op-achieve__photo-team {
          left: 50%;
          bottom: 17px;
          transform: translateX(-50%);
          max-width: 42%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 7px 10px;
          border: 1px solid rgba(198, 180, 255, 0.34);
          border-radius: 999px;
          background: rgba(24, 16, 43, 0.68);
          backdrop-filter: blur(12px);
          color: #e6dcff;
          box-shadow: 0 0 15px rgba(157, 122, 255, 0.12);
        }

        .op-achieve__photo-open {
          right: 14px;
          bottom: 17px;
          color: #b9f9e8;
        }

        .op-achieve__more-wrap {
          text-align: center;
          margin-top: 33px;
        }

        .op-achieve__more,
        .op-achieve__empty button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          min-height: 51px;
          padding: 12px 24px;
          border: 1px solid rgba(116, 252, 226, 0.65);
          border-radius: 999px;
          background:
            linear-gradient(
              100deg,
              rgba(40, 211, 179, 0.18),
              rgba(119, 82, 221, 0.18)
            );
          box-shadow: 0 0 25px rgba(74, 213, 201, 0.14);
          color: #f3fffd;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.6px;
          cursor: pointer;
          transition: 0.25s;
        }

        .op-achieve__more:hover,
        .op-achieve__empty button:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 27px rgba(103, 243, 223, 0.29);
        }

        .op-achieve__more:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .op-achieve__empty,
        .op-achieve__loading {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 17px;
          padding: 30px 15px;
          color: #bdece9;
          border: 1px dashed rgba(133, 239, 228, 0.3);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.025);
        }

        .op-achieve__empty strong {
          color: #fff;
          letter-spacing: 1.2px;
          font-size: 16px;
        }

        .op-achieve__empty p {
          color: #bdcddb;
          max-width: 500px;
          font-size: 13px;
          line-height: 1.7;
          margin: 0 !important;
        }

        .op-achieve__loader {
          width: 38px;
          height: 38px;
          border: 3px solid rgba(106, 239, 223, 0.18);
          border-top-color: #8cffe7;
          border-radius: 50%;
          animation: opAchieveRotate 0.9s linear infinite;
        }

        .op-achieve__more-error {
          margin: 15px 0 0 !important;
          color: #ffaca7;
          font-size: 13px;
          text-align: center;
        }

        .op-achieve__footerline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 37px;
          padding-top: 25px;
          border-top: 1px solid rgba(173, 229, 243, 0.14);
          color: #c8d1e3;
          font-size: 10px;
          letter-spacing: 2.8px;
          font-weight: 900;
        }

        .op-achieve__footerline b {
          color: #e9cf99;
        }

        .op-achieve__viewer {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 65px 16px 25px;
          background: rgba(2, 5, 13, 0.96);
          backdrop-filter: blur(18px);
          color: #fff;
        }

        .op-achieve__viewer-close {
          position: absolute;
          top: 18px;
          right: 20px;
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          color: #fff;
          cursor: pointer;
          border: 1px solid rgba(166, 233, 234, 0.45);
          border-radius: 50%;
          background: rgba(17, 34, 45, 0.83);
          font-size: 22px;
        }

        .op-achieve__viewer-inner {
          width: min(100%, 1280px);
          max-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .op-achieve__viewer-inner > img {
          max-width: 100%;
          max-height: calc(100dvh - 155px);
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 0 35px rgba(95, 238, 222, 0.17);
        }

        .op-achieve__viewer-toolbar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 18px;
          color: #d5ecee;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.2px;
          text-align: center;
        }

        .op-achieve__viewer-toolbar button {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          border: 1px solid rgba(132, 236, 220, 0.38);
          border-radius: 50%;
          background: rgba(92, 212, 194, 0.1);
          color: white;
          cursor: pointer;
        }

        .op-achieve__viewer-toolbar button:hover {
          background: rgba(92, 212, 194, 0.28);
        }

        .op-achieve button:focus-visible,
        .op-achieve__viewer button:focus-visible {
          outline: 2px solid #93ffe5;
          outline-offset: 3px;
        }

        @media (max-width: 1050px) {
          .op-achieve__gallery {
            gap: 12px;
          }

          .op-achieve__photo {
            grid-column: span 6;
          }

          .op-achieve__photo--featured {
            grid-column: span 6;
          }
        }

        @media (max-width: 600px) {
          .op-achieve {
            padding: 47px 13px 40px;
            margin: 25px auto 35px;
            border-radius: 22px;
          }

          .op-achieve__header {
            margin-bottom: 28px;
          }

          .op-achieve__eyebrow {
            font-size: 9px;
            letter-spacing: 1.2px;
            gap: 7px;
          }

          .op-achieve__header h2 {
            font-size: clamp(35px, 9.5vw, 50px);
            letter-spacing: -1px;
          }

          .op-achieve__header p {
            font-size: 12px;
            padding: 0 7px;
          }

          .op-achieve__toolbar {
            justify-content: center;
            flex-direction: column;
            gap: 12px;
          }

          .op-achieve__filters {
            justify-content: center;
            gap: 7px;
          }

          .op-achieve__team-filter {
            width: 100%;
            justify-content: space-between;
            padding: 6px 8px 6px 11px;
          }

          .op-achieve__team-select-wrap {
            flex: 1;
          }

          .op-achieve__team-select {
            width: 100%;
            min-width: 0;
          }

          .op-achieve__filter {
            padding: 9px 10px;
            min-height: 39px;
            font-size: 9px;
            letter-spacing: 0.4px;
          }

          .op-achieve__gallery {
            gap: 10px;
          }

          .op-achieve__photo {
            grid-column: span 6;
            aspect-ratio: 1.05;
            border-radius: 12px;
          }

          .op-achieve__photo--featured {
            grid-column: span 12;
            aspect-ratio: 1.7;
          }

          .op-achieve__photo-tag {
            left: 8px;
            bottom: 8px;
            padding: 7px 8px;
            font-size: 8px;
            letter-spacing: 0.4px;
          }

          .op-achieve__photo-team {
            bottom: 10px;
            font-size: 7px;
            padding: 6px 7px;
            max-width: 39%;
          }

          .op-achieve__photo-open {
            right: 8px;
            bottom: 10px;
            font-size: 8px;
            letter-spacing: 0.6px;
          }

          .op-achieve__footerline {
            gap: 9px;
            letter-spacing: 1px;
            font-size: 9px;
          }

          .op-achieve__viewer {
            padding: 70px 10px 20px;
          }

          .op-achieve__viewer-toolbar {
            gap: 9px;
            font-size: 10px;
          }
        }

        @keyframes opAchieveBeam {
          to {
            left: 115%;
          }
        }

        @keyframes opAchieveBreathe {
          to {
            opacity: 0.55;
            transform: scale(1.12);
          }
        }

        @keyframes opAchieveShine {
          0%,
          35% {
            left: -90%;
          }

          65%,
          100% {
            left: 175%;
          }
        }

        @keyframes opAchieveRotate {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .op-achieve *,
          .op-achieve *::before,
          .op-achieve *::after,
          .op-achieve__viewer * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}

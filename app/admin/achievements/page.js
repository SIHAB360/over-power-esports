"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  FiUploadCloud, FiImage, FiTrash2, FiEdit3, FiEye,
  FiEyeOff, FiArrowLeft, FiRefreshCw, FiX, FiCheck,
  FiPlus, FiShield, FiLayers, FiExternalLink,
} from "react-icons/fi";

const BUCKET = "achievement-gallery";
const PAGE_SIZE = 24;
const MAX_BYTES = 5 * 1024 * 1024;
const MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function imageUrl(path) {
  if (!path) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export default function AdminAchievementsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState("checking");
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [category, setCategory] = useState("result");
  const [publishNow, setPublishNow] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ title: "", category: "result", sort_order: 0 });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !user) {
        router.replace("/login");
        return;
      }
      const { data: profile, error: roleError } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      if (!active) return;
      if (roleError || profile?.role?.toLowerCase() !== "admin") {
        setPhase("forbidden");
        return;
      }
      setUserId(user.id);
      setPhase("ready");
    })();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (phase === "ready") fetchGallery(false);
    // Initial fetch only after admin authorization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  async function fetchGallery(append = false) {
    setLoadingItems(true);
    setError("");
    const offset = append ? items.length : 0;
    const { data, error: queryError } = await supabase
      .from("achievement_gallery")
      .select("id,file_path,title,category,sort_order,is_published,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (queryError) setError(`Gallery loading failed: ${queryError.message}`);
    else {
      setItems((previous) => append ? [...previous, ...(data || [])] : (data || []));
      setHasMore((data || []).length === PAGE_SIZE);
    }
    setLoadingItems(false);
  }

  function pickFiles(event) {
    setError("");
    const incoming = Array.from(event.target.files || []);
    const accepted = [];
    const invalid = [];
    for (const file of incoming) {
      if (!MIME.has(file.type)) invalid.push(`${file.name}: JPG/PNG/WebP only`);
      else if (file.size > MAX_BYTES) invalid.push(`${file.name}: maximum 5 MB`);
      else accepted.push(file);
    }
    if (invalid.length) setError(invalid.join(" · "));
    setSelectedFiles(accepted);
    event.target.value = "";
  }

  async function uploadFiles() {
    if (!userId || uploading || !selectedFiles.length) return;
    setUploading(true);
    setError("");
    setMessage("");
    let completed = 0;
    const errors = [];
    for (let index = 0; index < selectedFiles.length; index++) {
      const file = selectedFiles[index];
      setProgress(`Uploading ${index + 1} of ${selectedFiles.length}: ${file.name}`);
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const uploaded = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600", contentType: file.type, upsert: false,
      });
      if (uploaded.error) {
        errors.push(`${file.name}: ${uploaded.error.message}`);
        continue;
      }
      const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 130);
      const inserted = await supabase.from("achievement_gallery").insert({
        file_path: path,
        title,
        category,
        sort_order: 0,
        is_published: publishNow,
        created_by: userId,
      });
      if (inserted.error) {
        await supabase.storage.from(BUCKET).remove([path]);
        errors.push(`${file.name}: ${inserted.error.message}`);
      } else completed++;
    }
    setUploading(false);
    setProgress("");
    setSelectedFiles([]);
    if (completed) {
      setMessage(`${completed} screenshot${completed === 1 ? "" : "s"} uploaded successfully.`);
      await fetchGallery(false);
    }
    if (errors.length) setError(errors.join(" | "));
  }

  async function changeVisibility(item) {
    if (busyId) return;
    setBusyId(item.id);
    setError("");
    const { error: updateError } = await supabase
      .from("achievement_gallery")
      .update({ is_published: !item.is_published }).eq("id", item.id);
    if (updateError) setError(updateError.message);
    else setItems((prev) => prev.map((x) => x.id === item.id
      ? { ...x, is_published: !x.is_published } : x));
    setBusyId(null);
  }

  function beginEdit(item) {
    setEditing(item.id);
    setDraft({ title: item.title || "", category: item.category,
      sort_order: Number(item.sort_order) || 0 });
  }

  async function saveEdit(item) {
    if (busyId) return;
    setBusyId(item.id);
    setError("");
    const updates = {
      title: draft.title.trim().slice(0, 130),
      category: draft.category,
      sort_order: Math.trunc(Number(draft.sort_order) || 0),
    };
    const { error: saveError } = await supabase
      .from("achievement_gallery").update(updates).eq("id", item.id);
    if (saveError) setError(saveError.message);
    else {
      setEditing(null);
      setMessage("Screenshot details updated.");
      await fetchGallery(false);
    }
    setBusyId(null);
  }

  async function deleteItem(item) {
    if (busyId || !window.confirm("Delete this screenshot permanently?")) return;
    setBusyId(item.id);
    setError("");
    // Remove the public gallery record before its associated storage file.
    const deleted = await supabase.from("achievement_gallery")
      .delete().eq("id", item.id);
    if (deleted.error) {
      setError(deleted.error.message);
    } else {
      const removed = await supabase.storage.from(BUCKET).remove([item.file_path]);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      if (removed.error) {
        setError(`Record deleted but image cleanup failed: ${removed.error.message}. Remove it from Supabase Storage manually.`);
      } else setMessage("Screenshot deleted.");
    }
    setBusyId(null);
  }

  if (phase === "checking") return (
    <div className="achievement-admin-gate">VERIFYING ADMIN ACCESS...</div>
  );
  if (phase === "forbidden") return (
    <div className="achievement-admin-gate">
      Access denied. This page is for administrators only.
      <Link href="/">Return home</Link>
    </div>
  );

  return (
    <main className="achievement-admin">
      <div className="aa-aura aa-aura-one" aria-hidden="true" />
      <div className="aa-aura aa-aura-two" aria-hidden="true" />
      <div className="aa-container">
        <header className="aa-header">
          <Link href="/admin/dashboard" className="aa-back"><FiArrowLeft /> ADMIN DASHBOARD</Link>
          <div className="aa-label"><FiShield /> PRIVATE COMMAND CENTER / MEDIA VAULT</div>
          <h1>ACHIEVEMENT <span>CONTROL</span></h1>
          <p>Upload and manage tournament results and in-game screenshots. Published images will appear in the public gallery once the gallery page is connected.</p>
        </header>

        {(message || error) && <div role="status" className={`aa-notice ${error ? "aa-error" : ""}`}>
          {error || message}
          <button type="button" onClick={() => { setMessage(""); setError(""); }} aria-label="Dismiss"><FiX /></button>
        </div>}

        <section className="aa-upload-panel" aria-label="Upload achievements">
          <div className="aa-panel-heading">
            <div><span className="aa-eyebrow">01 / NEW UPLOAD</span><h2>ADD SCREENSHOTS</h2></div>
            <span className="aa-restrict"><FiShield /> ADMIN ONLY</span>
          </div>
          <label className="aa-dropzone">
            <FiUploadCloud size={34} aria-hidden="true" />
            <strong>CHOOSE SCREENSHOTS</strong>
            <span>Tap to select multiple images · JPG, PNG, WebP · Max 5 MB each</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickFiles} disabled={uploading} />
          </label>

          {selectedFiles.length > 0 && <div className="aa-previews" aria-label="Selected image previews">
            {selectedFiles.map((file, i) => (
              <div className="aa-preview" key={`${file.name}-${i}`}>
                {/* Local preview; image URLs are released after selection changes. */}
                <img src={previews[i]} alt={`Preview ${file.name}`} />
                <small title={file.name}>{file.name}</small>
              </div>
            ))}
          </div>}
          <div className="aa-controls">
            <label>IMAGE CATEGORY
              <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={uploading}>
                <option value="result">Tournament Result</option>
                <option value="ingame">In-Game Screenshot</option>
              </select>
            </label>
            <label className="aa-publish">
              <input type="checkbox" checked={publishNow} onChange={(event) => setPublishNow(event.target.checked)} disabled={uploading} />
              <span>Publish immediately</span>
            </label>
            <button type="button" className="aa-primary" disabled={uploading || !selectedFiles.length} onClick={uploadFiles}>
              {uploading ? <><FiRefreshCw className="aa-spin" /> {progress || "Uploading..."}</>
                : <><FiPlus /> UPLOAD {selectedFiles.length || ""} SCREENSHOT{selectedFiles.length === 1 ? "" : "S"}</>}
            </button>
          </div>
        </section>

        <section className="aa-gallery-panel" aria-label="Manage achievement screenshots">
          <div className="aa-panel-heading">
            <div><span className="aa-eyebrow">02 / CONTENT LIBRARY</span><h2>GALLERY MANAGER</h2></div>
            <button type="button" className="aa-refresh" onClick={() => fetchGallery(false)} disabled={loadingItems}>
              <FiRefreshCw className={loadingItems ? "aa-spin" : ""} /> REFRESH
            </button>
          </div>
          {loadingItems && !items.length && <div className="aa-empty">Loading gallery...</div>}
          {!loadingItems && !items.length && <div className="aa-empty">
            <FiImage size={36} />
            <strong>THE VAULT IS WAITING</strong>
            <span>Upload your first tournament result or in-game screenshot.</span>
          </div>}
          <div className="aa-grid">
            {items.map((item) => (
              <article key={item.id} className="aa-card">
                <button type="button" className="aa-card-image" onClick={() => setLightbox(item)} aria-label={`View ${item.title || "achievement"}`}>
                  <img src={imageUrl(item.file_path)} alt={item.title || "Achievement screenshot"} loading="lazy" />
                  <span className="aa-image-zoom"><FiEye /> VIEW</span>
                </button>
                <div className="aa-card-body">
                  <div className="aa-card-meta">
                    <span className={item.is_published ? "aa-live" : "aa-draft"}>{item.is_published ? "PUBLISHED" : "HIDDEN"}</span>
                    <span>{item.category === "ingame" ? "IN-GAME" : "RESULT"}</span>
                  </div>
                  {editing === item.id ? <div className="aa-edit-form">
                    <input aria-label="Title" value={draft.title} maxLength={130} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                    <div className="aa-edit-row">
                      <select aria-label="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                        <option value="result">Result</option><option value="ingame">In-Game</option>
                      </select>
                      <input aria-label="Sort order" type="number" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: event.target.value })} />
                    </div>
                    <div className="aa-actions">
                      <button type="button" onClick={() => saveEdit(item)} disabled={busyId === item.id}><FiCheck /> SAVE</button>
                      <button type="button" onClick={() => setEditing(null)}><FiX /> CANCEL</button>
                    </div>
                  </div> : <>
                    <h3 title={item.title || "Untitled screenshot"}>{item.title || "Untitled screenshot"}</h3>
                    <div className="aa-actions">
                      <button type="button" onClick={() => beginEdit(item)} disabled={!!busyId}><FiEdit3 /> EDIT</button>
                      <button type="button" onClick={() => changeVisibility(item)} disabled={!!busyId}>
                        {item.is_published ? <FiEyeOff /> : <FiEye />} {item.is_published ? "HIDE" : "PUBLISH"}
                      </button>
                      <button type="button" className="aa-danger" onClick={() => deleteItem(item)} disabled={!!busyId}><FiTrash2 /> DELETE</button>
                    </div>
                  </>}
                </div>
              </article>
            ))}
          </div>
          {hasMore && <button type="button" className="aa-loadmore" disabled={loadingItems} onClick={() => fetchGallery(true)}>
            <FiLayers /> {loadingItems ? "LOADING..." : "LOAD MORE SCREENSHOTS"}
          </button>}
        </section>
        <footer className="aa-page-foot">OVER POWER ESPORTS <span>✦</span> ACHIEVEMENT MEDIA VAULT</footer>
      </div>

      {lightbox && <div className="aa-lightbox" role="dialog" aria-modal="true" aria-label="Screenshot viewer" onClick={() => setLightbox(null)}>
        <button type="button" className="aa-lightbox-close" aria-label="Close viewer" onClick={() => setLightbox(null)}><FiX /></button>
        <img src={imageUrl(lightbox.file_path)} alt={lightbox.title || "Achievement screenshot"} onClick={(event) => event.stopPropagation()} />
        <span>{lightbox.title || "Achievement"}</span>
      </div>}
      <style jsx global>{`
        .achievement-admin,.achievement-admin *{box-sizing:border-box}
        .achievement-admin{padding:0!important;position:relative;min-height:100vh;overflow:hidden;color:#f3f7ff;background:#050812;font-family:Arial,Helvetica,sans-serif}
        .achievement-admin::before{content:"";position:absolute;inset:0;opacity:.2;pointer-events:none;background-image:linear-gradient(rgba(107,235,246,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(107,235,246,.13) 1px,transparent 1px);background-size:68px 68px}
        .aa-aura{position:absolute;pointer-events:none;width:480px;height:480px;border-radius:50%;filter:blur(110px);opacity:.45}
        .aa-aura-one{background:#157979;top:-240px;left:-210px}.aa-aura-two{background:#6335a3;top:270px;right:-230px}
        .aa-container{position:relative;z-index:1;max-width:1300px;margin:0 auto;padding:45px 28px 75px}
        .aa-header{padding-bottom:32px}.aa-back{display:inline-flex;align-items:center;gap:9px;margin-bottom:35px;color:#89f1ff!important;text-decoration:none!important;font-size:12px;font-weight:800;letter-spacing:1.2px}
        .aa-label,.aa-eyebrow{color:#85eeeb;font-size:11px;font-weight:900;letter-spacing:2px}.aa-label{display:flex;align-items:center;gap:9px}
        .aa-header h1{margin:14px 0!important;text-align:left;font-size:clamp(34px,6vw,66px);letter-spacing:-1.6px;line-height:1.1;color:white}
        .aa-header h1 span{background:linear-gradient(95deg,#87f5e5,#b69fff,#ffd7a1);-webkit-background-clip:text;background-clip:text;color:transparent}
        .aa-header p{max-width:690px;color:#bdc3d7;font-size:14px;line-height:1.8}
        .aa-notice{display:flex;justify-content:space-between;gap:15px;margin-bottom:20px;padding:15px 18px;border-radius:14px;background:rgba(47,190,141,.1);border:1px solid rgba(88,219,173,.4);color:#b7ffe7;line-height:1.5;overflow-wrap:anywhere}
        .aa-notice.aa-error{color:#ffd4dc;border-color:rgba(255,92,124,.5);background:rgba(255,92,124,.11)}
        .aa-notice button{border:0;background:transparent;color:inherit;cursor:pointer}
        .aa-upload-panel,.aa-gallery-panel{margin:25px 0;border-radius:25px;padding:27px;background:linear-gradient(135deg,rgba(26,30,51,.9),rgba(11,16,31,.95));border:1px solid rgba(137,173,236,.23);box-shadow:0 18px 65px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.045)}
        .aa-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:23px;flex-wrap:wrap}
        .aa-panel-heading h2{margin:7px 0 0;font-size:clamp(20px,3vw,30px);letter-spacing:.3px;color:#fff}
        .aa-restrict{display:inline-flex;align-items:center;gap:8px;color:#f8d6a3;font-size:10px;letter-spacing:1.1px;font-weight:900}
        .aa-dropzone{display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;gap:11px;min-height:196px;border:1.5px dashed rgba(105,235,237,.5);border-radius:20px;background:radial-gradient(circle at 50% 0,rgba(71,200,206,.13),rgba(5,10,24,.4));color:#9af8f4;cursor:pointer;padding:26px 14px;transition:.25s}
        .aa-dropzone:hover{border-color:#bda1ff;background:rgba(73,57,114,.16)}
        .aa-dropzone strong{color:#fff;font-size:18px;letter-spacing:1px}.aa-dropzone span{font-size:12px;color:#b3bed6;line-height:1.6}
        .aa-dropzone input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
        .aa-previews{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:12px;margin-top:18px}
        .aa-preview{min-width:0;overflow:hidden;border:1px solid rgba(136,184,218,.21);padding:5px;background:#111729;border-radius:12px}
        .aa-preview img{width:100%;height:90px;object-fit:cover;border-radius:8px}.aa-preview small{display:block;padding:8px 4px 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#b8c5d9;font-size:11px}
        .aa-controls{display:flex;align-items:end;gap:18px;flex-wrap:wrap;margin-top:25px}.aa-controls>label:first-child{display:flex;flex-direction:column;gap:9px;font-size:11px;letter-spacing:1px;color:#c2d4e3;font-weight:800}
        .aa-controls select,.aa-edit-form select,.aa-edit-form input{min-height:46px;padding:10px 14px;border-radius:12px;border:1px solid rgba(132,211,229,.33);background:#10182a;color:#fff;outline:none}
        .aa-publish{display:flex;align-items:center;gap:9px;min-height:45px;color:#d8e4ef;font-size:13px;cursor:pointer}.aa-publish input{width:17px;height:17px;accent-color:#57e5d2}
        .aa-primary{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:47px;padding:13px 22px;border:0;border-radius:13px;cursor:pointer;font-size:12px;font-weight:950;letter-spacing:.7px;background:linear-gradient(100deg,#7af5e3,#bca4ff);color:#08101b;box-shadow:0 0 27px rgba(103,225,216,.25)}
        .aa-primary:disabled{opacity:.45;cursor:not-allowed}.aa-spin{animation:aa-spin 1s linear infinite}@keyframes aa-spin{to{transform:rotate(360deg)}}
        .aa-refresh,.aa-loadmore{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;min-height:42px;border:1px solid rgba(140,230,235,.4);border-radius:10px;background:rgba(87,227,219,.075);color:#a2f9eb;cursor:pointer;font-weight:800;font-size:12px}
        .aa-empty{padding:55px 15px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;text-align:center;color:#adbbd0}.aa-empty strong{color:white;letter-spacing:1.4px}.aa-empty svg{color:#91e7eb}
        .aa-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.aa-card{min-width:0;overflow:hidden;border-radius:18px;border:1px solid rgba(159,170,232,.25);background:rgba(9,15,31,.9);transition:.25s}.aa-card:hover{border-color:rgba(117,233,218,.56);box-shadow:0 12px 40px rgba(55,217,226,.09)}
        .aa-card-image{position:relative;display:block;width:100%;height:210px;overflow:hidden;border:0;padding:0;background:#111527;cursor:zoom-in}.aa-card-image img{width:100%;height:100%;object-fit:cover;transition:transform .4s}.aa-card-image:hover img{transform:scale(1.05)}.aa-image-zoom{position:absolute;bottom:12px;right:12px;display:flex;align-items:center;gap:5px;padding:6px 9px;border-radius:9px;background:rgba(4,9,19,.82);font-size:11px;color:#fff}
        .aa-card-body{padding:16px}.aa-card-meta{display:flex;gap:10px;justify-content:space-between;font-size:10px;font-weight:900;color:#d5a9ff;letter-spacing:.5px}.aa-live{color:#6bf2ce}.aa-draft{color:#ffcf92}
        .aa-card h3{margin:14px 0;color:#f9f7ff;font-size:15px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aa-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:15px}
        .aa-actions button{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:7px 10px;border:1px solid rgba(123,221,231,.28);border-radius:9px;background:rgba(57,142,165,.09);color:#ddf2f9;cursor:pointer;font-size:10px;font-weight:900}.aa-actions button:hover{border-color:#84eedf}.aa-actions button:disabled{opacity:.45;cursor:not-allowed}.aa-actions .aa-danger{border-color:rgba(255,105,138,.3);color:#ffc0d2}
        .aa-edit-form{display:flex;flex-direction:column;gap:9px;margin-top:14px}.aa-edit-form input,.aa-edit-form select{min-width:0;width:100%}.aa-edit-row{display:grid;grid-template-columns:1fr 90px;gap:10px}
        .aa-loadmore{display:flex;margin:25px auto 0}.aa-page-foot{text-align:center;color:#849db5;font-size:10px;font-weight:800;letter-spacing:1.8px;padding:35px 0}.aa-page-foot span{color:#fbd4a9}
        .aa-lightbox{position:fixed;z-index:99999;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:15px;padding:55px 15px 30px;background:rgba(1,3,9,.96);backdrop-filter:blur(18px);color:#fff}.aa-lightbox>img{max-width:100%;max-height:85vh;object-fit:contain;border-radius:10px;box-shadow:0 10px 55px rgba(91,142,195,.25)}.aa-lightbox-close{position:absolute;top:20px;right:20px;display:grid;place-items:center;width:42px;height:42px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);border-radius:50%;color:#fff;cursor:pointer}.aa-lightbox>span{font-size:13px;color:#d3def0;text-align:center}
        .achievement-admin-gate{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:20px;flex-direction:column;background:#070913;color:#c4ffff;font-weight:800;text-align:center;padding:20px}
        .achievement-admin-gate a{color:#ffdca0!important}
        @media(max-width:1000px){.aa-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.aa-container{padding:36px 20px 55px}}
        @media(max-width:640px){.aa-container{padding:25px 13px 40px}.aa-upload-panel,.aa-gallery-panel{padding:17px 13px;border-radius:18px}.aa-header h1{font-size:clamp(31px,8vw,46px)}.aa-header p{font-size:13px}.aa-grid{grid-template-columns:1fr;gap:14px}.aa-card-image{height:210px}.aa-controls{align-items:stretch;flex-direction:column;gap:12px}.aa-controls>label:first-child,.aa-primary{width:100%}.aa-controls select{width:100%}.aa-previews{grid-template-columns:repeat(3,minmax(0,1fr))}.aa-dropzone{min-height:170px}.aa-panel-heading h2{font-size:21px}}
        @media(prefers-reduced-motion:reduce){.achievement-admin *{animation:none!important;transition:none!important}}
      `}</style>
    </main>
  );
}

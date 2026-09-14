
"use client";

export default function SideMenu({ open, close }) {
  if (!open) return null;

  return (
    <div>
      <h1>Side Menu</h1>

      <button onClick={close}>
        Close
      </button>
    </div>
  );
}

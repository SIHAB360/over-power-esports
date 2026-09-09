"use client";

import { useState } from "react";

export default function CopyUID({ uid }) {

  const [copied, setCopied] = useState(false);

  function copyUID() {

    navigator.clipboard.writeText(uid);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);

  }

  return (

    <button
      className="copy-btn"
      onClick={copyUID}
    >

      <i className="fa-solid fa-copy"></i>

      {copied ? "Copied" : "Copy"}

    </button>

  );

}

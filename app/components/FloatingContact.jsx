"use client";

import { useState } from "react";

export default function FloatingContact() {

  const [open, setOpen] = useState(false);

  const links = [
    {
      name: "WhatsApp",
      icon: "fa-brands fa-whatsapp",
      url: "https://chat.whatsapp.com/KyKkUE0g17X5w7PJXtfM3E",
      className: "whatsapp",
    },
    {
      name: "Discord",
      icon: "fa-brands fa-discord",
      url: "https://discord.gg/4HrJ5zRCh",
      className: "discord",
    },
  ];


  return (
  <div
    style={{
      position: "fixed",
      right: "30px",
      bottom: "30px",
      width: "70px",
      height: "70px",
      background: "red",
      borderRadius: "50%",
      zIndex: 999999
    }}
  >

  </div>
);


      <div className="floating-links">

        {links.map((link,index)=>(

          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`floating-link ${link.className}`}
            style={{
              "--delay": `${index * 0.08}s`
            }}
            title={link.name}
          >

            <i className={link.icon}></i>

          </a>

        ))}

      </div>



      <button

        className="floating-main-button"

        onClick={() => setOpen(!open)}

        type="button"

      >

        <i
          className={
            open
            ? "fa-solid fa-xmark"
            : "fa-solid fa-headset"
          }
        ></i>


      </button>


    </div>

  );
}

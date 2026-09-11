"use client";

import { useState } from "react";

export default function RegisterPage() {

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  async function verifyCode(e) {

    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {

      const res = await fetch("/api/verify-code", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          code
        })

      });


      const data = await res.json();


      if (data.success) {

        window.location.href = "/register/player";

      } else {

        setMessage(data.message || "Invalid or expired registration code");

      }


    } catch (error) {

      setMessage("Something went wrong");

    }


    setLoading(false);

  }


  return (

    <main className="register-page">

      <div className="register-card">

        <h1>
          JOIN OVER POWER ESPORTS
        </h1>


        <p>
          Enter the official registration code to continue.
        </p>


        <form onSubmit={verifyCode}>

          <input
            type="text"
            placeholder="Enter Registration Code"
            value={code}
            onChange={(e)=>setCode(e.target.value.toUpperCase())}
          />


          <button disabled={loading}>

            {loading ? "Checking..." : "Continue"}

          </button>


        </form>


        {
          message &&
          <p className="error-message">
            {message}
          </p>
        }


      </div>

    </main>

  );

}

"use client";

import { useState } from "react";

export default function RegisterPage() {

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  async function verifyCode(e) {

    e.preventDefault();

    if (!code.trim()) {
      setMessage("Please enter registration code");
      return;
    }


    setLoading(true);
    setMessage("");


    try {

      const res = await fetch("/api/verify-code", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          code: code.trim().toUpperCase()
        })

      });


      const data = await res.json();


      if (data.success) {

        window.location.href = "/register/player";

      } 
      else {

        setMessage(
          data.message || "Invalid or expired registration code"
        );

      }


    } 
    catch (error) {

      console.error(error);

      setMessage("Server error. Please try again.");

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

            {
              loading
              ?
              "Checking..."
              :
              "Continue"
            }

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

"use client";

export default function FloatingContact() {

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
        zIndex: 9999999
      }}
    >

    </div>
  );

}

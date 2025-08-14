import React from "react";
import "../assets/css/LoadingScreen.css";

function LoadingScreen() {
  return React.createElement(
    "div",
    { id: "loading-screen" },
    React.createElement(
      "div",
      { className: "logo-container" },
      React.createElement("img", { src: "/logo.png", alt: "Afrikuizine Logo" })
    )
  );
}

export default LoadingScreen;
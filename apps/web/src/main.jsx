import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return <h1>Hello, Ignite is working!</h1>;
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}


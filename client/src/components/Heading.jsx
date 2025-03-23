import React from "react";
import "./Heading.css";

export default function Heading({ text = "Heading" }) {
  return <div className="heading">{text}</div>;
}

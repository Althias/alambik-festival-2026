import React, { useState } from "react";
import "./FAQ.css";
import { faqData } from "../data/faqData";

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-page">
      <nav className="faq-nav">
        <h1>FAQ</h1>
      </nav>
      <div className="faq-list">
        {faqData.map((item, idx) => (
          <div className="faq-item" key={idx}>
            <button className="faq-question" onClick={() => setOpen(open === idx ? null : idx)}>
              {item.q}
              <span className={open === idx ? "faq-arrow open" : "faq-arrow"}>▼</span>
            </button>
            {open === idx && (
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

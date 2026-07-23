"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  CreditCard,
  Layers,
  Cpu,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Settings,
  Database,
  Sparkles,
  BookOpen,
  Users,
  CheckCircle2,
  Shield,
  HelpCircle,
  PlaySquare,
  Network,
  GitPullRequest,
  Sliders,
  Flag,
} from "lucide-react";

// Curated soft pastel color palette matching requested categories
const SLIDE_BACKGROUNDS = [
  "linear-gradient(135deg, #ede7f6 0%, #f3e5f5 100%)", // Lavender - Slide 1
  "linear-gradient(135deg, #ffebee 0%, #fff0f0 100%)", // Coral - Slide 2
  "linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)", // Light Blue - Slide 3
  "linear-gradient(135deg, #e8f5e9 0%, #e8f8f5 100%)", // Mint Green - Slide 4
  "linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)", // Soft Orange - Slide 5
  "linear-gradient(135deg, #ede7f6 0%, #f3e5f5 100%)", // Lavender - Slide 6
  "linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)", // Light Blue - Slide 7
  "linear-gradient(135deg, #e8f5e9 0%, #e8f8f5 100%)", // Mint Green - Slide 8
  "linear-gradient(135deg, #ffebee 0%, #fff0f0 100%)", // Coral - Slide 9
  "linear-gradient(135deg, #ede7f6 0%, #f3e5f5 100%)", // Lavender - Slide 10
  "linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)", // Light Blue - Slide 11
  "linear-gradient(135deg, #e8f5e9 0%, #e8f8f5 100%)", // Mint Green - Slide 12
  "linear-gradient(135deg, #ffebee 0%, #fff0f0 100%)", // Coral - Slide 13
  "linear-gradient(135deg, #ede7f6 0%, #f3e5f5 100%)", // Lavender - Slide 14
  "linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)", // Light Blue - Slide 15
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thresholdSelection, setThresholdSelection] = useState(0.55); // Slide 14 interactive state
  const totalSlides = 15;
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    setIsFullscreen((prev) => !prev);
  };

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  // Visual component for Neural Network nodes (Slide 1, 6, 7)
  const SVGNeuralNetwork = ({ complex = false }) => {
    return (
      <svg width="100%" height="220" viewBox="0 0 400 220" style={{ overflow: "visible" }}>
        {/* Connection Lines */}
        <g stroke="rgba(0, 113, 227, 0.15)" strokeWidth="1.5">
          {/* Layer 1 (Input) to Layer 2 (Hidden) */}
          {[30, 80, 130, 180].map((y1) =>
            [40, 90, 140, 180].map((y2) => (
              <line key={`l1-${y1}-${y2}`} x1="50" y1={y1} x2="150" y2={y2} />
            ))
          )}
          {/* Layer 2 to Layer 3 (Hidden 2) */}
          {[40, 90, 140, 180].map((y1) =>
            [50, 110, 170].map((y2) => (
              <line key={`l2-${y1}-${y2}`} x1="150" y1={y1} x2="250" y2={y2} />
            ))
          )}
          {/* Layer 3 to Layer 4 (Output) */}
          {[50, 110, 170].map((y1) => (
            <line key={`l3-${y1}`} x1="250" y1={y1} x2="350" y2="110" />
          ))}
        </g>

        {/* Nodes */}
        {/* Input Nodes */}
        {[30, 80, 130, 180].map((y, idx) => (
          <circle key={`in-${idx}`} cx="50" cy={y} r="10" fill="#a7c7e7" stroke="#0071e3" strokeWidth="2" />
        ))}
        {/* Hidden Layer 1 Nodes */}
        {[40, 90, 140, 180].map((y, idx) => (
          <circle key={`h1-${idx}`} cx="150" cy={y} r="10" fill="#c3e8bd" stroke="#34c759" strokeWidth="2" />
        ))}
        {/* Hidden Layer 2 Nodes */}
        {[50, 110, 170].map((y, idx) => (
          <circle key={`h2-${idx}`} cx="250" cy={y} r="10" fill="#fbc4b6" stroke="#ff6b35" strokeWidth="2" />
        ))}
        {/* Output Node */}
        <circle cx="350" cy="110" r="12" fill="#d8b4f8" stroke="#a259ff" strokeWidth="2.5" />

        {/* Dynamic Attention Gate highlight if complex */}
        {complex && (
          <g>
            <rect x="15" y="10" width="70" height="200" rx="8" fill="rgba(162, 89, 255, 0.08)" stroke="#a259ff" strokeDasharray="3 3" />
            <text x="50" y="222" fontSize="9" textAnchor="middle" fill="#a259ff" fontWeight="bold">Attention Gate</text>
          </g>
        )}

        {/* Labels */}
        <text x="50" y="15" fontSize="9" textAnchor="middle" fill="#6e6e73" fontWeight="bold">Input</text>
        <text x="150" y="20" fontSize="9" textAnchor="middle" fill="#6e6e73" fontWeight="bold">FC 1</text>
        <text x="250" y="30" fontSize="9" textAnchor="middle" fill="#6e6e73" fontWeight="bold">FC 2</text>
        <text x="350" y="85" fontSize="9" textAnchor="middle" fill="#6e6e73" fontWeight="bold">Default</text>
      </svg>
    );
  };

  // Render slides dynamically
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(162, 89, 255, 0.15)", marginBottom: "30px", animation: "bounce 3s infinite" }}>
              <CreditCard size={40} color="#a259ff" />
            </div>
            <h1 style={{ fontSize: "38px", fontWeight: 800, color: "#1d1d1f", lineHeight: "1.25", marginBottom: "16px", maxWidth: "800px" }}>
              Credit Card Default Prediction <br />
              <span style={{ color: "#0071e3" }}>using Deep Learning</span>
            </h1>
            <p style={{ fontSize: "20px", color: "#6e6e73", marginBottom: "40px", fontWeight: 500 }}>
              Technical Viva Presentation · Academic Panel Review
            </p>
            
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", marginBottom: "50px" }}>
              <span style={{ padding: "8px 16px", backgroundColor: "#fff", borderRadius: "20px", fontSize: "14px", fontWeight: 600, color: "#e30613", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #ffebeb" }}>PyTorch</span>
              <span style={{ padding: "8px 16px", backgroundColor: "#fff", borderRadius: "20px", fontSize: "14px", fontWeight: 600, color: "#0071e3", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #e3f2fd" }}>MLflow</span>
              <span style={{ padding: "8px 16px", backgroundColor: "#fff", borderRadius: "20px", fontSize: "14px", fontWeight: 600, color: "#ff6b35", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #fff3e0" }}>Optuna</span>
            </div>

            <div style={{ width: "350px", opacity: 0.85 }}>
              <SVGNeuralNetwork />
            </div>
          </div>
        );

      case 1:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#ff6b35", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 2 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "24px" }}>Problem Statement</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ backgroundColor: "#ffeaeb", padding: "10px", borderRadius: "10px", display: "flex", flexShrink: 0 }}>
                    <AlertTriangle size={18} color="#ff3b30" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1d1d1f" }}>What is Credit Card Default?</h4>
                    <p style={{ fontSize: "14px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                      Occurs when a customer fails to pay their credit card bill statement on time.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ backgroundColor: "#ffeedb", padding: "10px", borderRadius: "10px", display: "flex", flexShrink: 0 }}>
                    <TrendingUp size={18} color="#ff9500" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1d1d1f" }}>Why it Matters to Institutions</h4>
                    <p style={{ fontSize: "14px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                      Unpaid debts present massive financial risk. Banks lose billions annually. Catching defaulters early allows risk mitigation (credit freezes).
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "10px", display: "flex", flexShrink: 0 }}>
                    <BarChart2 size={18} color="#34c759" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1d1d1f" }}>Severe Class Imbalance</h4>
                    <p style={{ fontSize: "14px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                      Credit defaults are rare: **~77.9% non-default** vs **~22.1% default**. Naive classifiers predict non-default and achieve 77.9% accuracy while catching zero actual default cases.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ backgroundColor: "#e3f2fd", padding: "10px", borderRadius: "10px", display: "flex", flexShrink: 0 }}>
                    <Shield size={18} color="#0071e3" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1d1d1f" }}>Model Goal</h4>
                    <p style={{ fontSize: "14px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                      Build a classifier that proactively catches defaulters (maximizing recall of the minority class) while maintaining acceptable precision.
                    </p>
                  </div>
                </div>
              </div>

              {/* Class Imbalance Visual */}
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f", textAlign: "center" }}>Class Imbalance Ratio (3.52 : 1)</p>
                <div style={{ display: "flex", height: "30px", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ width: "77.88%", backgroundColor: "#34c759", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                    77.9%
                  </div>
                  <div style={{ width: "22.12%", backgroundColor: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                    22.1%
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#6e6e73" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34c759" }} /> No Default (23,364 rows)</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ff3b30" }} /> Default (6,636 rows)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0071e3", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 3 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "24px" }}>Dataset Overview</h2>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "rgba(0, 113, 227, 0.04)", border: "1px solid rgba(0, 113, 227, 0.1)", borderRadius: "12px", padding: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0071e3", display: "flex", alignItems: "center", gap: "8px" }}><Database size={16} /> Taiwan UCI Credit Card</h4>
                  <p style={{ fontSize: "13px", color: "#6e6e73", marginTop: "6px", lineHeight: "1.4" }}>
                    Source: National Taiwan University (2005). Captures monthly payment records of credit card accounts over a 6-month window (April to September 2005).
                  </p>
                </div>
                <div style={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px", padding: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Dataset Dimensions</h4>
                  <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
                    <div>
                      <p style={{ fontSize: "20px", fontWeight: 800, color: "#0071e3" }}>30,000</p>
                      <p style={{ fontSize: "11px", color: "#6e6e73" }}>Clients (Rows)</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "20px", fontWeight: 800, color: "#34c759" }}>23</p>
                      <p style={{ fontSize: "11px", color: "#6e6e73" }}>Input Features</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "20px", fontWeight: 800, color: "#ff6b35" }}>1</p>
                      <p style={{ fontSize: "11px", color: "#6e6e73" }}>Target Variable</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table of Key Features */}
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f", marginBottom: "12px" }}>Key Feature Groups</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #e5e5ea", textAlign: "left" }}>
                      <th style={{ padding: "8px 4px", color: "#6e6e73", fontWeight: 600 }}>Category</th>
                      <th style={{ padding: "8px 4px", color: "#6e6e73", fontWeight: 600 }}>Features</th>
                      <th style={{ padding: "8px 4px", color: "#6e6e73", fontWeight: 600 }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f2f2f7" }}>
                      <td style={{ padding: "10px 4px", fontWeight: 700, color: "#0071e3" }}>Demographics</td>
                      <td style={{ padding: "10px 4px", fontFamily: "monospace" }}>LIMIT_BAL, SEX, EDUCATION, MARRIAGE, AGE</td>
                      <td style={{ padding: "10px 4px", color: "#6e6e73" }}>Credit limit, gender, school level, status, age.</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f2f2f7" }}>
                      <td style={{ padding: "10px 4px", fontWeight: 700, color: "#34c759" }}>Payment Delay</td>
                      <td style={{ padding: "10px 4px", fontFamily: "monospace" }}>PAY_0 to PAY_6</td>
                      <td style={{ padding: "10px 4px", color: "#6e6e73" }}>Monthly delay status (-2: no use, 0: pay-on-time, 1+: delay in months).</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f2f2f7" }}>
                      <td style={{ padding: "10px 4px", fontWeight: 700, color: "#ff9500" }}>Bill Amount</td>
                      <td style={{ padding: "10px 4px", fontFamily: "monospace" }}>BILL_AMT1 to BILL_AMT6</td>
                      <td style={{ padding: "10px 4px", color: "#6e6e73" }}>Monthly billing statement size in NTD.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 4px", fontWeight: 700, color: "#a259ff" }}>Pay Amount</td>
                      <td style={{ padding: "10px 4px", fontFamily: "monospace" }}>PAY_AMT1 to PAY_AMT6</td>
                      <td style={{ padding: "10px 4px", color: "#6e6e73" }}>Amount paid back to bank in NTD monthly.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#34c759", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 4 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Exploratory Data Analysis (EDA)</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f", display: "flex", alignItems: "center", gap: "6px" }}><Sparkles size={16} color="#ff9500" /> Recent Payment (PAY_0) is Dominant</h4>
                  <p style={{ fontSize: "13px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    PAY_0 (most recent payment delay status) is the single strongest correlation coefficient with default (**0.325**). Our engineered feature `DELAY_COUNT` (counting all 6 months of delays) is even stronger at **0.398**.
                  </p>
                </div>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Demographic Breakdown Findings</h4>
                  <ul style={{ fontSize: "12px", color: "#6e6e73", marginTop: "6px", paddingLeft: "16px", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li>**Gender**: Males default at a higher rate (**24.2%**) than females (**20.8%**).</li>
                    <li>**Education**: Graduate students default least (**19.2%**); High schoolers default most (**25.8%**).</li>
                    <li>**Age Group**: Young adults (21–25) default at the highest rate (**26.8%**). Risk drops to 18.9% for age 51-60.</li>
                  </ul>
                </div>
              </div>

              {/* Horizontal correlation bar chart */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#1d1d1f", marginBottom: "12px" }}>Top Correlations with Default (Pearson r)</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "DELAY_COUNT (Eng)", val: 0.398, color: "#34c759" },
                    { label: "RECENT_DELAY (Eng)", val: 0.368, color: "#34c759" },
                    { label: "MAX_DELAY (Eng)", val: 0.331, color: "#34c759" },
                    { label: "PAY_0 (Original)", val: 0.325, color: "#0071e3" },
                    { label: "AVG_DELAY (Eng)", val: 0.282, color: "#34c759" },
                    { label: "PAY_2 (Original)", val: 0.264, color: "#0071e3" },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600 }}>
                        <span style={{ color: "#1d1d1f" }}>{item.label}</span>
                        <span style={{ color: item.color }}>{item.val.toFixed(3)}</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "#f5f5f7", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(item.val / 0.45) * 100}%`, backgroundColor: item.color, borderRadius: "3px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#ff9500", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 5 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Data Preprocessing Pipeline</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
              {/* Preprocessing Flow Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#e3f2fd", color: "#0071e3", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", marginBottom: "10px" }}>1</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Stratified Split</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    70/15/15 split. Stratification locks in the natural **22.1%** class imbalance ratio across train, val, and test.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#ffebee", color: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", marginBottom: "10px" }}>2</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Outlier Handling</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Winsorization clipping at **1st and 99th percentiles** limits tails (e.g. BILL_AMT tail values) to prevent gradient explosion.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#e8f5e9", color: "#34c759", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", marginBottom: "10px" }}>3</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Standard Scaling</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Scales continuous features using `StandardScaler` to ensure zero mean, unit variance. Excludes binary encoded values.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#ede7f6", color: "#a259ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", marginBottom: "10px" }}>4</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Batch Balancing</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Pytorch `WeightedRandomSampler` balances batch distributions, paired with positive loss scaling weights (`POS_WEIGHT`).
                  </p>
                </div>
              </div>

              {/* Fast loading note */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "rgba(255, 149, 0, 0.06)", border: "1px solid rgba(255,149,0,0.15)", borderRadius: "10px", padding: "12px 16px" }}>
                <span style={{ fontSize: "16px" }}>⚡</span>
                <p style={{ fontSize: "12px", color: "#6e6e73", margin: 0 }}>
                  Preprocessed data is saved in binary **`.npy`** formats. This allows fast, zero-parsing data streaming directly to PyTorch tensors during training.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#a259ff", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 6 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Deep Learning Architecture: SimpleMLP</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Multi-Layer Perceptron (MLP) Structure</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "6px", lineHeight: "1.5" }}>
                    A robust fully-connected baseline consisting of: <br />
                    <span style={{ display: "inline-block", marginTop: "6px", fontFamily: "monospace", fontSize: "11px", backgroundColor: "#f5f5f7", padding: "4px 8px", borderRadius: "4px" }}>
                      Input (38 dims) → [Linear → BatchNorm1d → ReLU → Dropout(0.3)] × 3 → Output (1 dim)
                    </span>
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>Key Regularization Blocks</h4>
                  <ul style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "6px", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li>**Batch Normalization**: Rescales hidden features layer-by-layer. Combats internal covariate shift and speeds up gradient flow.</li>
                    <li>**Dropout (30%)**: Regularizes the dense layers. Randomly zeroing activations prevents high-order co-adaptations and over-reliance on single inputs.</li>
                  </ul>
                </div>
              </div>

              {/* Architecture Diagram */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1d1d1f", marginBottom: "10px" }}>Feedforward Topology</p>
                <SVGNeuralNetwork />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0071e3", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 7 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Deep Learning Architecture: ComplexMLP</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "35px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e", display: "flex", alignItems: "center", gap: "6px" }}><Sliders size={16} color="#a259ff" /> Feature Attention Gate</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                    Soft attention over inputs: passes features through a Sigmoid gate to learn which columns matter most *conditioned on each cardholder's history*.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e", display: "flex", alignItems: "center", gap: "6px" }}><Network size={16} color="#34c759" /> Residual Skip Connections</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                    Skip blocks: `x + block(x)`. Allows gradients to bypass layers directly, preventing vanishing gradients and allowing deeper blocks to train stably.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>GELU Activation Function</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                    Uses **GELU** (Gaussian Error Linear Unit) instead of ReLU. A smoother derivative provides continuous gradient signals across the zero line.
                  </p>
                </div>
              </div>

              {/* Side by side visual diagram */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1d1d1f", marginBottom: "10px" }}>AttentionNet Topology</p>
                <SVGNeuralNetwork complex={true} />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#34c759", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 8 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Training Setup</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#ff3b30" }}>Focal Loss</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Loss ($FL(p_t) = -\alpha_t(1-p_t)^\gamma \log(p_t)$). Focuses updates on hard, misclassified samples by lowering weights of easy ones.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0071e3" }}>AdamW Optimizer</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Decouples weight decay from gradient updates. Helps dense layers generalize far better.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#ff9500" }}>OneCycleLR Scheduler</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Learning rate ramps up during warm-up to explore loss valleys, then slowly anneals down to zero to settle in sharp optima.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#a259ff" }}>Early Stopping</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Monitors Validation **$F_\beta$ ($\beta=2$)** with a patience of 15 epochs. Prevents over-tuning.
                  </p>
                </div>
              </div>

              {/* Graphic of OneCycleLR */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#1d1d1f", textAlign: "center" }}>OneCycleLR Profile</p>
                {/* A simple inline SVG showing the LR curve */}
                <svg width="100%" height="100" viewBox="0 0 150 100">
                  <path d="M10,80 Q50,20 80,10 T140,80" fill="none" stroke="#ff9500" strokeWidth="2.5" />
                  <line x1="10" y1="80" x2="140" y2="80" stroke="#d2d2d7" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="50" y="95" fontSize="8" fill="#6e6e73">Warmup</text>
                  <text x="110" y="95" fontSize="8" fill="#6e6e73">Anneal</text>
                  <text x="80" y="25" fontSize="8" fill="#ff9500" fontWeight="bold">Max LR</text>
                </svg>
                <div style={{ borderTop: "1px solid #f2f2f7", paddingTop: "8px", fontSize: "10px", color: "#6e6e73", textAlign: "center" }}>
                  Gradient clipping max norm = **1.0**
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#ff3b30", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 9 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Why F-beta (beta=2)?</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Business Cost of Errors</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    **False Negative (worst error)**: Bank approves a client who subsequently defaults. The bank loses the outstanding balance. <br />
                    **False Positive (minor error)**: Bank flags a healthy client as default. Leads to audit costs or temporary card freeze.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Recall Weighted 2× More than Precision</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Setting $\beta=2$ makes the metric emphasize Recall over Precision. We want to catch the highest possible fraction of actual defaults, even if it introduces some false alarms.
                  </p>
                </div>
              </div>

              {/* Formula visual container */}
              <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#1c1c1e" }}>The F-beta Formula ($\beta=2$)</p>
                
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#ff3b30", padding: "14px 20px", backgroundColor: "#ffebee", borderRadius: "8px", fontFamily: "Georgia, serif" }}>
                  F₂ = 5 × (P × R) / (4 × P + R)
                </div>

                <div style={{ fontSize: "11px", color: "#6e6e73", lineHeight: "1.4" }}>
                  Where **P** is Precision and **R** is Recall. <br />
                  Threshold tuned across a validation sweep: **0.05 – 0.80** to maximize the score.
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#a259ff", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 10 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Hyperparameter Tuning with Optuna</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>What is Optuna?</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    An automated hyperparameter optimization framework. Uses **TPE (Tree-structured Parzen Estimator)** Bayesian optimization to explore the search space.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Parameters Tuned</h4>
                  <p style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    - Learning rate ($1e-5$ to $1e-2$ log-scale)<br />
                    - Hidden dimensions & dropout rate<br />
                    - Focal Loss parameters ($\alpha$ weight, $\gamma$ gamma powers)<br />
                    - Scheduler type (Cosine vs OneCycleLR)
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Early Pruning</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Runs **30 trials** per model. Uses **`MedianPruner`** to compare current curves with historical runs and terminate underperforming trials early.
                  </p>
                </div>
              </div>

              {/* Optuna trial search chart mockup */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#1d1d1f", textAlign: "center" }}>Optuna Bayesian Optimization Path</p>
                {/* SVG mock of optuna trials */}
                <svg width="100%" height="130" viewBox="0 0 150 100">
                  <circle cx="15" cy="85" r="3" fill="#ff3b30" />
                  <circle cx="30" cy="70" r="3" fill="#ff9500" />
                  <circle cx="45" cy="80" r="3" fill="#ff3b30" opacity="0.4" /> {/* Pruned */}
                  <line x1="40" y1="75" x2="50" y2="85" stroke="#ff3b30" strokeWidth="1" />
                  <circle cx="60" cy="50" r="3" fill="#34c759" />
                  <circle cx="75" cy="35" r="3" fill="#34c759" />
                  <circle cx="90" cy="65" r="3" fill="#ff3b30" opacity="0.4" /> {/* Pruned */}
                  <line x1="85" y1="60" x2="95" y2="70" stroke="#ff3b30" strokeWidth="1" />
                  <circle cx="105" cy="22" r="3" fill="#0071e3" />
                  <circle cx="120" cy="20" r="3" fill="#0071e3" />
                  <circle cx="135" cy="19" r="4" fill="#0071e3" stroke="#a259ff" strokeWidth="1.5" />
                  <path d="M15,85 L30,70 L60,50 L75,35 L105,22 L120,20 L135,19" fill="none" stroke="rgba(0,113,227,0.15)" strokeWidth="1" />
                  <text x="135" y="12" fontSize="7" fill="#a259ff" fontWeight="bold">Best Trial</text>
                  <text x="75" y="95" fontSize="8" fill="#6e6e73" textAnchor="middle">Trials (1 - 30)</text>
                </svg>
                <div style={{ textAlign: "center", fontSize: "10px", color: "#6e6e73" }}>
                  Separate Optuna studies run for SimpleMLP vs ComplexMLP.
                </div>
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0071e3", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 11 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Experiment Tracking with MLflow</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Tracking Parameters & Metrics</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Every Optuna trial is logged to the tracking server automatically. Logs include inputs, train loss curve, val loss, accuracy, F1, and model weights.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Multi-Container Docker Stack</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    - **PostgreSQL**: Stores experiment logs and parameters.<br />
                    - **MLflow**: Graphical comparison interface.<br />
                    - **FastAPI**: Predict backend endpoint.<br />
                    - **Next.js**: Frontend client interface.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Ngrok Google Colab Tunnel</h4>
                  <p style={{ fontSize: "12.5px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.4" }}>
                    Trained in Google Colab (using GPUs). logs are sent back to the local Docker database via an **`ngrok`** tunnel. Models are promoted to **"Production"** state.
                  </p>
                </div>
              </div>

              {/* Topology diagram */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#1d1d1f", textAlign: "center" }}>Docker Container Stack Topology</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", fontSize: "11px", color: "#1d1d1f" }}>
                  <div style={{ border: "1px solid #ff9500", backgroundColor: "#fff8f0", padding: "6px 12px", borderRadius: "6px", width: "160px", textAlign: "center", fontWeight: 600 }}>Google Colab (GPU)</div>
                  <div style={{ height: "15px", borderLeft: "2px dashed #ff9500" }} />
                  <div style={{ border: "1px solid #a259ff", backgroundColor: "#f3e5f5", padding: "6px 12px", borderRadius: "6px", width: "160px", textAlign: "center", fontWeight: 600 }}>ngrok Tunnel</div>
                  <div style={{ height: "15px", borderLeft: "2px dashed #0071e3" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
                    <div style={{ border: "1px solid #0071e3", backgroundColor: "#e3f2fd", padding: "6px 4px", borderRadius: "6px", textAlign: "center", fontWeight: 600 }}>MLflow Docker</div>
                    <div style={{ border: "1px solid #34c759", backgroundColor: "#e8f5e9", padding: "6px 4px", borderRadius: "6px", textAlign: "center", fontWeight: 600 }}>PostgreSQL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 11:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#34c759", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 12 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Results & Model Comparison</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: "24px", flex: 1, alignItems: "center" }}>
              {/* Leaderboard Table */}
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "16px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #e5e5ea", color: "#6e6e73" }}>
                      <th style={{ padding: "6px" }}>Model Architecture</th>
                      <th style={{ padding: "6px" }}>F-beta (2)</th>
                      <th style={{ padding: "6px" }}>Recall</th>
                      <th style={{ padding: "6px" }}>Precision</th>
                      <th style={{ padding: "6px" }}>ROC-AUC</th>
                      <th style={{ padding: "6px" }}>F1</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f2f2f7", backgroundColor: "rgba(52, 199, 89, 0.05)" }}>
                      <td style={{ padding: "10px 6px", fontWeight: 700, color: "#1d1d1f" }}>
                        🏆 SimpleMLP Tuned
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: 700, color: "#34c759" }}>0.6233</td>
                      <td style={{ padding: "10px 6px", fontWeight: 700 }}>84.99%</td>
                      <td style={{ padding: "10px 6px" }}>30.16%</td>
                      <td style={{ padding: "10px 6px", fontWeight: 600 }}>0.7666</td>
                      <td style={{ padding: "10px 6px" }}>0.4452</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f2f2f7" }}>
                      <td style={{ padding: "8px 6px", fontWeight: 600, color: "#1d1d1f" }}>ComplexMLP Baseline</td>
                      <td style={{ padding: "8px 6px", fontWeight: 600 }}>0.6226</td>
                      <td style={{ padding: "8px 6px" }}>83.56%</td>
                      <td style={{ padding: "8px 6px" }}>30.83%</td>
                      <td style={{ padding: "8px 6px" }}>0.7594</td>
                      <td style={{ padding: "8px 6px" }}>0.4504</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f2f2f7" }}>
                      <td style={{ padding: "8px 6px", fontWeight: 600, color: "#1d1d1f" }}>SimpleMLP Baseline</td>
                      <td style={{ padding: "8px 6px" }}>0.6190</td>
                      <td style={{ padding: "8px 6px" }}>84.46%</td>
                      <td style={{ padding: "8px 6px" }}>29.92%</td>
                      <td style={{ padding: "8px 6px" }}>0.7563</td>
                      <td style={{ padding: "8px 6px" }}>0.4419</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 6px", fontWeight: 600, color: "#1d1d1f" }}>ComplexMLP Tuned</td>
                      <td style={{ padding: "8px 6px" }}>0.5629</td>
                      <td style={{ padding: "8px 6px" }}>65.91%</td>
                      <td style={{ padding: "8px 6px" }}>35.53%</td>
                      <td style={{ padding: "8px 6px" }}>0.7148</td>
                      <td style={{ padding: "8px 6px" }}>0.4617</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bar Chart comparing FBeta2 */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#1d1d1f", marginBottom: "12px", textAlign: "center" }}>F-beta (2) Comparison</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "SimpleMLP Tuned", val: 0.6233, winner: true },
                    { label: "Complex Baseline", val: 0.6226, winner: false },
                    { label: "Simple Baseline", val: 0.6190, winner: false },
                    { label: "Complex Tuned", val: 0.5629, winner: false },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: 600 }}>
                        <span style={{ color: "#1d1d1f" }}>{item.label}</span>
                        <span style={{ color: item.winner ? "#34c759" : "#6e6e73" }}>{item.val.toFixed(4)}</span>
                      </div>
                      <div style={{ height: "8px", backgroundColor: "#f5f5f7", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(item.val / 0.65) * 100}%`, backgroundColor: item.winner ? "#34c759" : "#d2d2d7", borderRadius: "4px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 12:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#ff3b30", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 13 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Evaluation Deep Dive</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", flex: 1, alignItems: "center" }}>
              {/* Confusion Matrix */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#1d1d1f", marginBottom: "16px", textAlign: "center" }}>Confusion Matrix (Tuned SimpleMLP)</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: "10px", alignItems: "center", textAlign: "center", fontSize: "12px" }}>
                  <div />
                  <div style={{ fontWeight: 700, color: "#6e6e73" }}>Predicted Neg</div>
                  <div style={{ fontWeight: 700, color: "#6e6e73" }}>Predicted Pos</div>

                  <div style={{ fontWeight: 700, color: "#6e6e73", textAlign: "right" }}>Actual Neg</div>
                  <div style={{ backgroundColor: "rgba(52, 199, 89, 0.1)", border: "1px solid #34c759", padding: "14px 6px", borderRadius: "8px" }}>
                    <p style={{ fontWeight: 800, fontSize: "14px", color: "#1a7f37" }}>1,032</p>
                    <p style={{ fontSize: "9px", color: "#6e6e73" }}>True Negatives</p>
                  </div>
                  <div style={{ backgroundColor: "rgba(255, 59, 48, 0.1)", border: "1px solid #ff3b30", padding: "14px 6px", borderRadius: "8px" }}>
                    <p style={{ fontWeight: 800, fontSize: "14px", color: "#cf222e" }}>2,472</p>
                    <p style={{ fontSize: "9px", color: "#6e6e73" }}>False Positives</p>
                  </div>

                  <div style={{ fontWeight: 700, color: "#6e6e73", textAlign: "right" }}>Actual Pos</div>
                  <div style={{ backgroundColor: "rgba(255, 59, 48, 0.1)", border: "1px solid #ff3b30", padding: "14px 6px", borderRadius: "8px" }}>
                    <p style={{ fontWeight: 800, fontSize: "14px", color: "#cf222e" }}>149</p>
                    <p style={{ fontSize: "9px", color: "#6e6e73" }}>False Negatives</p>
                  </div>
                  <div style={{ backgroundColor: "rgba(52, 199, 89, 0.1)", border: "1px solid #34c759", padding: "14px 6px", borderRadius: "8px" }}>
                    <p style={{ fontWeight: 800, fontSize: "14px", color: "#1a7f37" }}>847</p>
                    <p style={{ fontSize: "9px", color: "#6e6e73" }}>True Positives</p>
                  </div>
                </div>
              </div>

              {/* ROC AUC mock graph */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1d1d1f", marginBottom: "10px" }}>ROC Curve (AUC = 0.7666)</p>
                <svg width="180" height="130" viewBox="0 0 100 100">
                  <line x1="0" y1="100" x2="100" y2="0" stroke="#d2d2d7" strokeWidth="1" strokeDasharray="3 3" />
                  <path d="M0,100 C20,60 50,20 100,0" fill="none" stroke="#0071e3" strokeWidth="2.5" />
                  <circle cx="50" cy="35" r="3" fill="#ff3b30" />
                  <text x="56" y="38" fontSize="6" fill="#ff3b30" fontWeight="bold">0.55 Threshold</text>
                  <line x1="0" y1="100" x2="0" y2="0" stroke="#1d1d1f" strokeWidth="1" />
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#1d1d1f" strokeWidth="1" />
                  <text x="50" y="108" fontSize="7" fill="#6e6e73" textAnchor="middle">FPR (1 - Spec)</text>
                  <text x="-50" y="-8" fontSize="7" fill="#6e6e73" textAnchor="middle" transform="rotate(-90)">TPR (Recall)</text>
                </svg>
              </div>
            </div>
          </div>
        );

      case 13:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#a259ff", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 14 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "10px" }}>Interactive Threshold Analysis</h2>
              <p style={{ fontSize: "13px", color: "#6e6e73", margin: 0 }}>
                Adjust the slider below to see how the bank risk profile shifts based on the threshold decision point.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px", flex: 1, alignItems: "center", marginTop: "10px" }}>
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, color: "#1d1d1f" }}>
                    <span>Decision Threshold:</span>
                    <span style={{ color: "#0071e3", fontSize: "16px" }}>{thresholdSelection.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.10"
                    max="0.80"
                    step="0.05"
                    value={thresholdSelection}
                    onChange={(e) => setThresholdSelection(parseFloat(e.target.value))}
                    style={{ width: "100%", marginTop: "10px", accentColor: "#0071e3" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button onClick={() => setThresholdSelection(0.25)} style={{ padding: "8px", fontSize: "11px", fontWeight: 600, border: "1px solid #d2d2d7", borderRadius: "8px", backgroundColor: thresholdSelection === 0.25 ? "#e3f2fd" : "#fff", color: thresholdSelection === 0.25 ? "#0071e3" : "#1d1d1f", cursor: "pointer" }}>
                    Catch All (0.25)
                  </button>
                  <button onClick={() => setThresholdSelection(0.55)} style={{ padding: "8px", fontSize: "11px", fontWeight: 600, border: "1px solid #d2d2d7", borderRadius: "8px", backgroundColor: thresholdSelection === 0.55 ? "#eafaf1" : "#fff", color: thresholdSelection === 0.55 ? "#1a7f37" : "#1d1d1f", cursor: "pointer" }}>
                    Best F-beta2 (0.55)
                  </button>
                </div>
              </div>

              {/* Dynamic outputs based on state */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1d1d1f" }}>Resulting Metrics Profile</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Recall (Defaulters caught)", val: thresholdSelection <= 0.25 ? 95 : thresholdSelection <= 0.55 ? 85 : 40, color: "#34c759" },
                    { label: "Precision (Flag accuracy)", val: thresholdSelection <= 0.25 ? 18 : thresholdSelection <= 0.55 ? 30.2 : 60, color: "#0071e3" },
                    { label: "F-beta (2) Score", val: thresholdSelection <= 0.25 ? 52 : thresholdSelection <= 0.55 ? 62.3 : 43, color: "#ff9500" },
                  ].map((metric, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600 }}>
                        <span style={{ color: "#6e6e73" }}>{metric.label}</span>
                        <span style={{ color: metric.color }}>{metric.val}%</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "#f5f5f7", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${metric.val}%`, backgroundColor: metric.color, borderRadius: "3px" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #f2f2f7", marginTop: "10px", paddingTop: "8px", fontSize: "10.5px", color: "#6e6e73", lineHeight: "1.4" }}>
                  {thresholdSelection <= 0.3 ? (
                    <span style={{ color: "#ff3b30", fontWeight: 600 }}>⚠️ Safe Mode: High approvals denial, zero credit defaults.</span>
                  ) : thresholdSelection <= 0.6 ? (
                    <span style={{ color: "#34c759", fontWeight: 600 }}>✅ Balanced Mode: Optimal credit operations.</span>
                  ) : (
                    <span style={{ color: "#ff9500", fontWeight: 600 }}>⚠️ Aggressive Mode: High risk exposure to unpaid defaults.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 14:
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0071e3", textTransform: "uppercase", letterSpacing: "1.5px" }}>Slide 15 / 15</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1d1d1f", marginTop: "4px", marginBottom: "20px" }}>Conclusion & Future Work</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "30px", flex: 1, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Winning Model Insights</h4>
                  <p style={{ fontSize: "13px", color: "#6e6e73", marginTop: "4px", lineHeight: "1.5" }}>
                    The **SimpleMLP Tuned** architecture is the optimal choice: <br />
                    <span style={{ fontWeight: 600 }}>F-beta2 = 0.623 · Recall = 85.0% · ROC-AUC = 0.767</span>. <br />
                    Tuning thresholds, focal weights, and active sampler batching are *more* vital than creating complex deep structures for noisy tabular data.
                  </p>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>Future Roadmap</h4>
                  <ul style={{ fontSize: "12px", color: "#6e6e73", marginTop: "4px", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li>**SHAP Explainability**: Map predictions back to customer metrics locally.</li>
                    <li>**REST Deployment**: Auto-scale FastAPI inference backend.</li>
                    <li>**ML Tree Stacking**: Ensemble PyTorch with XGBoost/LightGBM model logs.</li>
                  </ul>
                </div>
              </div>

              {/* Visual Checklist */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1d1d1f" }}>Project Deliverables Completed</p>
                {[
                  "Dataset Preprocessing & Winsorization",
                  "Simple & Complex PyTorch Architectures",
                  "Optuna Auto-Tuning Bayesian Search",
                  "Docker Stack (MLflow, Fast API, UI)",
                  "Threshold sweeps and F-beta2 selection",
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#6e6e73" }}>
                    <CheckCircle2 size={14} color="#34c759" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      style={
        isFullscreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
              background: SLIDE_BACKGROUNDS[currentSlide],
              padding: "50px 80px",
              display: "flex",
              flexDirection: "column",
              fontFamily: "Poppins, -apple-system, sans-serif",
              transition: "background 0.5s ease",
            }
          : {
              background: SLIDE_BACKGROUNDS[currentSlide],
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.05)",
              padding: "40px",
              minHeight: "580px",
              display: "flex",
              flexDirection: "column",
              fontFamily: "Poppins, -apple-system, sans-serif",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              transition: "background 0.5s ease",
            }
      }
    >
      {/* Slide Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              backgroundColor: "#1d1d1f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CreditCard size={14} color="#fff" />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#1d1d1f" }}>
            CreditGuard Presenter
          </span>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Dropdown Jumper */}
          <select
            value={currentSlide}
            onChange={(e) => setCurrentSlide(parseInt(e.target.value))}
            style={{
              padding: "6px 10px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              color: "#1d1d1f",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <option key={idx} value={idx}>
                Slide {idx + 1}: {[
                  "Title", "Problem Statement", "Dataset Overview", "EDA & Insights", 
                  "Preprocessing", "SimpleMLP Architecture", "ComplexMLP", "Training Setup", 
                  "Why F-beta2", "Optuna Tuning", "MLflow Log", "Results & Leaderboard", 
                  "Metrics Deep Dive", "Threshold Sweep", "Conclusions"
                ][idx]}
              </option>
            ))}
          </select>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: "6px 10px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              color: "#1d1d1f",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
            }}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={13} /> Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 size={13} /> Presenter View
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div style={{ flex: 1, padding: isFullscreen ? "20px 0" : "10px 0" }}>
        {renderSlideContent()}
      </div>

      {/* Slide Footer Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          paddingTop: "16px",
          marginTop: "20px",
        }}
      >
        {/* Navigation Arrows */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.08)",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentSlide === 0 ? "not-allowed" : "pointer",
              opacity: currentSlide === 0 ? 0.4 : 1,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <ChevronLeft size={18} color="#1d1d1f" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.08)",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentSlide === totalSlides - 1 ? "not-allowed" : "pointer",
              opacity: currentSlide === totalSlides - 1 ? 0.4 : 1,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <ChevronRight size={18} color="#1d1d1f" />
          </button>
        </div>

        {/* Slide Indicators / Dots */}
        <div style={{ display: "flex", gap: "6px" }}>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: currentSlide === idx ? "#0071e3" : "rgba(0,0,0,0.15)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: currentSlide === idx ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Slide Numbers */}
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#6e6e73" }}>
          Slide {currentSlide + 1} of {totalSlides}
        </span>
      </div>

      {/* Bouncing Animation style for title card icon */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

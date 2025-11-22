"use client";

import { useEffect, useState, useRef } from "react";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [typewriterText, setTypewriterText] = useState("");
    const [activeStep, setActiveStep] = useState(2); // Start with step 3 (index 2)
    const workflowTrackRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Navbar Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Typewriter Effect
    useEffect(() => {
        const text = " with AI Agents";
        let i = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                if (i < text.length) {
                    setTypewriterText((prev) => prev + text.charAt(i));
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Workflow Carousel Logic
    const centerStep = (index: number) => {
        if (!workflowTrackRef.current || !containerRef.current || !stepRefs.current[index]) return;

        const step = stepRefs.current[index];
        if (!step) return;

        const stepLeft = step.offsetLeft;
        const stepWidth = step.offsetWidth;
        const containerWidth = containerRef.current.offsetWidth;

        const moveX = (containerWidth / 2) - (stepWidth / 2) - stepLeft;

        workflowTrackRef.current.style.transform = `translateX(${moveX}px)`;
        setActiveStep(index);
    };

    useEffect(() => {
        // Initial center only on mount
        setTimeout(() => centerStep(2), 100);
    }, []); // Empty dependency array to run only once

    useEffect(() => {
        const handleResize = () => {
            centerStep(activeStep);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [activeStep]);

    return (
        <main>
            {/* Navbar */}
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
                <div className="container nav-container">
                    <a href="https://leonleidner.github.io/LUMEN" className="logo">
                        LUMEN<span style={{ color: "var(--color-primary)" }}>.</span> <span
                            style={{ fontWeight: 400, opacity: 0.8, fontSize: "0.9em" }}>/ Data Intelligence Agent</span>
                    </a>
                    <a href="https://github.com/leonleidner/Data-Science-Agent" className="btn btn-primary">View Code</a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-subtitle fade-in-up delay-100 animate-trigger">Project Showcase</span>
                    <h1 className="fade-in-up delay-200 animate-trigger">
                        Talk to Your Data<br />
                        <span className="text-gradient-animated">
                            {typewriterText}<span className="cursor">|</span>
                        </span>
                    </h1>
                    <p className="fade-in-up delay-300 animate-trigger"
                        style={{ fontSize: "1.25rem", marginTop: "1.5rem", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
                        An advanced Text-to-SQL system built with LangChain and FastAPI.
                        Turn natural language questions into database queries and actionable business insights instantly.
                    </p>
                    <div className="hero-buttons fade-in-up delay-400 animate-trigger">
                        <a href="https://github.com/leonleidner/Data-Science-Agent" className="btn btn-glow">View Source Code</a>
                        <a href="#features" className="btn btn-primary">Explore Features</a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section" id="features">
                <div className="container">
                    <div className="section-header fade-in-up animate-trigger">
                        <h2>Core Capabilities</h2>
                        <p>Bridging the gap between business questions and database answers.</p>
                    </div>

                    <div className="grid-3">
                        {/* Card 1 */}
                        <div className="card fade-in-up delay-100 animate-trigger">
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <h3 className="card-title">Text-to-SQL</h3>
                            <p>Translates plain English questions into complex SQL queries using advanced LLM reasoning and schema awareness.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="card fade-in-up delay-200 animate-trigger">
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M2 12h20M12 12l4.24-4.24M12 12l-4.24 4.24" />
                                </svg>
                            </div>
                            <h3 className="card-title">Data Visualization</h3>
                            <p>Automatically generates interactive Plotly charts to visualize trends, distributions, and comparisons.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="card fade-in-up delay-300 animate-trigger">
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h3 className="card-title">Business Intelligence</h3>
                            <p>Provides actionable insights and explanations alongside raw data, acting as an automated data analyst.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="section" id="workflow">
                <div className="container">
                    <div className="section-header fade-in-up animate-trigger">
                        <h2>How It Works</h2>
                        <p>From question to insight in five automated steps.</p>
                    </div>

                    <div className="workflow-container" ref={containerRef}>
                        <div className="workflow-track" id="workflowTrack" ref={workflowTrackRef}>
                            {/* Step 1 */}
                            <div
                                className={`workflow-step fade-in-up delay-100 animate-trigger ${activeStep === 0 ? "active" : ""}`}
                                onClick={() => centerStep(0)}
                                ref={(el) => { stepRefs.current[0] = el; }}
                            >
                                <div className={`step-number ${activeStep === 0 ? "active" : ""}`}>01</div>
                                <div className={`step-card ${activeStep === 0 ? "active-pulse" : ""}`}>
                                    <div className="step-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <h3>Connect Data</h3>
                                    <p>The system connects to your SQL database and reads the schema.</p>
                                </div>
                            </div>

                            {/* Connector */}
                            <div className="workflow-connector fade-in-up delay-150 animate-trigger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </div>

                            {/* Step 2 */}
                            <div
                                className={`workflow-step fade-in-up delay-200 animate-trigger ${activeStep === 1 ? "active" : ""}`}
                                onClick={() => centerStep(1)}
                                ref={(el) => { stepRefs.current[1] = el; }}
                            >
                                <div className={`step-number ${activeStep === 1 ? "active" : ""}`}>02</div>
                                <div className={`step-card ${activeStep === 1 ? "active-pulse" : ""}`}>
                                    <div className="step-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                    </div>
                                    <h3>Ask Question</h3>
                                    <p>Ask a business question like "What is our monthly revenue trend?"</p>
                                </div>
                            </div>

                            {/* Connector */}
                            <div className="workflow-connector fade-in-up delay-250 animate-trigger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </div>

                            {/* Step 3 */}
                            <div
                                className={`workflow-step fade-in-up delay-300 animate-trigger ${activeStep === 2 ? "active" : ""}`}
                                onClick={() => centerStep(2)}
                                ref={(el) => { stepRefs.current[2] = el; }}
                            >
                                <div className={`step-number ${activeStep === 2 ? "active" : ""}`}>03</div>
                                <div className={`step-card ${activeStep === 2 ? "active-pulse" : ""}`}>
                                    <div className="step-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10 9 9 9 8 9" />
                                        </svg>
                                    </div>
                                    <h3>SQL Generation</h3>
                                    <p>The agent generates the correct SQL query based on your schema.</p>
                                </div>
                            </div>

                            {/* Connector */}
                            <div className="workflow-connector fade-in-up delay-350 animate-trigger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </div>

                            {/* Step 4 */}
                            <div
                                className={`workflow-step fade-in-up delay-400 animate-trigger ${activeStep === 3 ? "active" : ""}`}
                                onClick={() => centerStep(3)}
                                ref={(el) => { stepRefs.current[3] = el; }}
                            >
                                <div className={`step-number ${activeStep === 3 ? "active" : ""}`}>04</div>
                                <div className={`step-card ${activeStep === 3 ? "active-pulse" : ""}`}>
                                    <div className="step-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 18 22 12 16 6" />
                                            <polyline points="8 6 2 12 8 18" />
                                        </svg>
                                    </div>
                                    <h3>Execution</h3>
                                    <p>The query is executed securely against the database.</p>
                                </div>
                            </div>

                            {/* Connector */}
                            <div className="workflow-connector fade-in-up delay-450 animate-trigger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </div>

                            {/* Step 5 */}
                            <div
                                className={`workflow-step fade-in-up delay-500 animate-trigger ${activeStep === 4 ? "active" : ""}`}
                                onClick={() => centerStep(4)}
                                ref={(el) => { stepRefs.current[4] = el; }}
                            >
                                <div className={`step-number ${activeStep === 4 ? "active" : ""}`}>05</div>
                                <div className={`step-card ${activeStep === 4 ? "active-pulse" : ""}`}>
                                    <div className="step-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20V10" />
                                            <path d="M18 20V4" />
                                            <path d="M6 20v-4" />
                                        </svg>
                                    </div>
                                    <h3>Insight & Plot</h3>
                                    <p>Receive the answer and an interactive chart visualizing the data.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Frontend Preview Section */}
            <section className="section" id="preview">
                <div className="container">
                    <div className="section-header">
                        <h2>Interactive Preview</h2>
                        <p>Explore the interface. Hover over elements to see how they work.</p>
                    </div>

                    <div className="preview-container" style={{ height: "600px" }}>
                        <ChatInterface embedded={true} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="logo">LUMEN<span style={{ color: "var(--color-primary)" }}>.</span></div>
                            <p>Bridging Theory and Data Reality.</p>
                        </div>
                        <div className="footer-col">
                            <h4>Initiative</h4>
                            <ul className="footer-links">
                                <li><a href="https://github.com/leonleidner/LUMEN">About Us</a></li>
                                <li><a href="https://github.com/leonleidner/LUMEN">Projects</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Connect</h4>
                            <ul className="footer-links">
                                <li><a href="https://github.com/leonleidner">GitHub</a></li>
                                <li><a href="#">LinkedIn</a></li>
                            </ul>
                        </div>
                    </div>
                    <div
                        style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                        &copy; 2025 LUMEN Data Science Initiative.
                    </div>
                </div>
            </footer>
        </main>
    );
}

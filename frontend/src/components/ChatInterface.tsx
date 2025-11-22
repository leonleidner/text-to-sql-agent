"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Database, BarChart3, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import styles from "./ChatInterface.module.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Message {
    role: "user" | "assistant";
    content: string;
    plotData?: any;
}

interface ChatInterfaceProps {
    embedded?: boolean;
}

export default function ChatInterface({ embedded = false }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm your Data Intelligence Agent. Ask me anything about your business data.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [usePlotting, setUsePlotting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !apiKey) return;

        const userMessage = input;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8001/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    api_key: apiKey,
                    use_plotting: usePlotting,
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response, plotData: data.plot_data },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Connection failed. Please check your API key and try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container} style={embedded ? { height: '100%', border: 'none', borderRadius: 0, background: 'transparent', boxShadow: 'none' } : {}}>
            {/* Header - Only show if not embedded or if we want a header in embedded mode (optional) */}
            {!embedded && (
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.iconBox}>
                            <Database className="w-5 h-5" />
                        </div>
                        <h1 className={styles.title}>Data Intelligence</h1>
                    </div>
                    <button onClick={() => setShowSettings(!showSettings)} className={styles.settingsButton}>
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Settings Panel - Always available via some mechanism, or maybe hidden in embedded? Let's keep it accessible if not embedded, or maybe add a small gear icon in embedded mode somewhere else. For now, let's keep logic simple: if embedded, maybe no settings header? Or maybe we add a small absolute button? Let's stick to the plan: embedded usually implies a demo. But the user might want to try it. Let's add a small settings toggle in the input area for embedded mode if needed, or just rely on the header. 
            Actually, for the preview, we probably just want the chat. But let's keep the header logic simple. If embedded, no header. */}

            {/* If embedded, we might still need API key. Let's assume for the preview, it's a demo or the user knows what they are doing. 
               Actually, the user request shows the preview has "Real-time Agent Logs" and "Natural Language Input". 
               Let's allow settings even in embedded mode, maybe via a small floating button or just render the header but styled differently? 
               The design shows a clean interface. Let's just hide the header for embedded as per standard "preview" logic, 
               BUT we need a way to input API key. 
               Let's render a minimal header for embedded mode.
            */}
            {embedded && (
                <div className={styles.header} style={{ background: 'transparent', padding: '0.5rem 1rem', borderBottom: 'none' }}>
                    <div className={styles.headerContent}>
                        {/* Minimal header content */}
                    </div>
                    <button onClick={() => setShowSettings(!showSettings)} className={styles.settingsButton}>
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            )}


            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={styles.settingsPanel}
                    >
                        <div className={styles.settingsContent}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>OpenRouter API Key</label>
                                <input
                                    type="password"
                                    placeholder="sk-or-v1-..."
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.toggleRow}>
                                <div className={styles.toggleLabel}>
                                    <BarChart3 className="w-4 h-4 text-gray-400" />
                                    <span className={styles.toggleText}>Enable Plotting</span>
                                </div>
                                <button
                                    onClick={() => setUsePlotting(!usePlotting)}
                                    className={`${styles.toggle} ${usePlotting ? styles.toggleOn : styles.toggleOff}`}
                                >
                                    <span className={`${styles.toggleThumb} ${usePlotting ? styles.toggleThumbOn : ""}`} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className={styles.messagesArea}>
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${styles.messageRow} ${msg.role === "user" ? styles.messageRowUser : styles.messageRowAssistant}`}
                    >
                        <div className={`${styles.messageBubble} ${msg.role === "user" ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
                            <p className={`${styles.messageText} ${msg.role === "assistant" ? styles.messageTextAssistant : ""}`}>
                                {msg.role === "assistant"
                                    ? msg.content.split("**").map((part, i) =>
                                        i % 2 === 1 ? (
                                            <strong key={i}>{part}</strong>
                                        ) : (
                                            part
                                        )
                                    )
                                    : msg.content}
                            </p>
                            {msg.plotData && (() => {
                                const parsed = JSON.parse(msg.plotData);
                                return (
                                    <div className={styles.plotContainer}>
                                        <Plot
                                            data={parsed.data.map((d: any) => ({
                                                ...d,
                                                marker: { ...d.marker, color: '#2dd4bf' },
                                                line: { ...d.line, color: '#2dd4bf', width: 3 }
                                            }))}
                                            layout={{
                                                ...parsed.layout,
                                                paper_bgcolor: 'rgba(0,0,0,0)',
                                                plot_bgcolor: 'rgba(0,0,0,0)',
                                                font: { color: '#f8fafc', family: 'Inter, sans-serif' },
                                                xaxis: {
                                                    ...parsed.layout.xaxis,
                                                    gridcolor: 'rgba(148, 163, 184, 0.1)',
                                                    zerolinecolor: 'rgba(148, 163, 184, 0.1)',
                                                    color: '#94a3b8'
                                                },
                                                yaxis: {
                                                    ...parsed.layout.yaxis,
                                                    gridcolor: 'rgba(148, 163, 184, 0.1)',
                                                    zerolinecolor: 'rgba(148, 163, 184, 0.1)',
                                                    color: '#94a3b8'
                                                },
                                                title: {
                                                    text: parsed.layout.title?.text || parsed.layout.title,
                                                    font: { color: '#f8fafc', size: 16 }
                                                },
                                                legend: { font: { color: '#94a3b8' } },
                                                autosize: true,
                                                margin: { l: 40, r: 20, t: 40, b: 40 }
                                            }}
                                            config={{ responsive: true, displayModeBar: false }}
                                            style={{ width: "100%", height: "400px" }}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.loadingRow}>
                        <div className={styles.loadingBubble}>
                            <div className={styles.loadingDots}>
                                <div className={styles.dot} />
                                <div className={styles.dot} />
                                <div className={styles.dot} />
                            </div>
                            <span className={styles.loadingText}>Analyzing...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                <form onSubmit={handleSubmit} className={styles.inputForm}>
                    <input
                        type="text"
                        placeholder="Ask a question about your data..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className={styles.textInput}
                    />
                    <button type="submit" disabled={!input.trim() || isLoading || !apiKey} className={styles.sendButton}>
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

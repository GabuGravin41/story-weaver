
import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, SendIcon, StopIcon } from './icons';
import { transcribeUserAudio, consultScriptorium } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface ScriptoriumMessage {
    id: string;
    sender: 'user' | 'ai';
    content: string;
}

const TREATISE_KEY = 'story_weaver_scriptorium_treatise';
const MESSAGES_KEY = 'story_weaver_scriptorium_messages';

const Scriptorium: React.FC = () => {
    const [treatise, setTreatise] = useState(() => {
        return localStorage.getItem(TREATISE_KEY) || '';
    });
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const [isConsulting, setIsConsulting] = useState(false);
    const [chatInput, setChatInput] = useState('');
    
    const [messages, setMessages] = useState<ScriptoriumMessage[]>(() => {
        const saved = localStorage.getItem(MESSAGES_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved scriptorium messages", e);
            }
        }
        return [
            { id: '1', sender: 'ai', content: 'I am ready. We can write, debate, or refine. The direction is yours.' }
        ];
    });
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Persist treatise
    useEffect(() => {
        localStorage.setItem(TREATISE_KEY, treatise);
    }, [treatise]);

    // Persist messages
    useEffect(() => {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await handleTranscribe(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', content: 'I could not access the microphone. Please check permissions.' }]);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleTranscribe = async (audioBlob: Blob) => {
        setIsProcessingAudio(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                const transcription = await transcribeUserAudio(base64Audio, 'audio/webm');
                
                // Append transcription to treatise naturally
                setTreatise(prev => {
                    const separator = prev.trim() ? '\n\n' : '';
                    return prev + separator + transcription;
                });
                
                setIsProcessingAudio(false);
            };
        } catch (error) {
            console.error(error);
            setIsProcessingAudio(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ScriptoriumMessage = { id: Date.now().toString(), sender: 'user', content: chatInput };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsConsulting(true);

        const response = await consultScriptorium(treatise, chatInput);
        
        const aiMsg: ScriptoriumMessage = { id: (Date.now() + 2).toString(), sender: 'ai', content: response };
        setMessages(prev => [...prev, aiMsg]);
        setIsConsulting(false);
    };

    const resetScriptorium = () => {
        if (window.confirm("Are you sure you want to clear your current work and history?")) {
            setTreatise('');
            setMessages([{ id: '1', sender: 'ai', content: 'I am ready. We can write, debate, or refine. The direction is yours.' }]);
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Top Section: The Editor (The creation space) */}
            <div className="flex-grow flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    {isProcessingAudio && <div className="text-xs text-amber-500 animate-pulse bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm">Transcribing...</div>}
                    <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`p-2 rounded-full transition-all duration-300 shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/80 dark:bg-slate-700/80 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                        title={isRecording ? "Stop Recording" : "Record Voice"}
                    >
                        {isRecording ? <StopIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={resetScriptorium}
                        className="p-2 rounded-full bg-white/80 dark:bg-slate-700/80 text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                        title="Clear All"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
                <textarea
                    value={treatise}
                    onChange={(e) => setTreatise(e.target.value)}
                    placeholder="The canvas is open..."
                    className="flex-grow w-full p-8 resize-none focus:outline-none bg-transparent font-serif-display text-lg md:text-xl leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
            </div>

            {/* Bottom Section: The Intellect (The conversation) */}
            <div className="h-[35%] min-h-[200px] flex flex-col bg-transparent rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                msg.sender === 'user' 
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' 
                                : 'text-slate-600 dark:text-slate-400 italic'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isConsulting && (
                        <div className="flex justify-start">
                             <div className="text-slate-400 text-xs italic p-3">Thinking...</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-3 items-center">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Discuss, critique, or modify..."
                        className="flex-grow bg-transparent px-2 py-1 text-base focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 italic"
                        disabled={isConsulting}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isConsulting}
                        className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Scriptorium;

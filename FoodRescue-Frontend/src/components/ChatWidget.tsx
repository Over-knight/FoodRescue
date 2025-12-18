import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/aiApiService';
import { Icons } from './Icons';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Add welcome message when chat is first opened
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: '1',
                text: 'Hi! 👋 I\'m your FoodRescue AI assistant. Ask me about:\n\n• Nearby restaurants\n• Available food items\n• Bulk orders for NGOs\n• Product recommendations\n\nHow can I help you today?',
                sender: 'ai',
                timestamp: new Date()
            }]);
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Get user location if available
            let location: { lat: number; lng: number } | undefined;
            if (navigator.geolocation) {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                }).catch(() => null);

                if (position) {
                    location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                }
            }

            const response = await aiService.chat(inputValue, location);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data.message,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    aria-label="Open chat"
                >
                    <Icons.MessageCircle size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '380px',
                        maxWidth: 'calc(100vw - 2rem)',
                        height: '500px',
                        maxHeight: 'calc(100vh - 4rem)',
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '1rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTopLeftRadius: '1rem',
                            borderTopRightRadius: '1rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icons.Bot size={24} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>AI Assistant</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                    {isLoading ? 'Typing...' : 'Online'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            aria-label="Close chat"
                        >
                            <Icons.X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            backgroundColor: '#F9FAFB'
                        }}
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '75%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem',
                                        backgroundColor: message.sender === 'user' ? 'var(--primary)' : 'white',
                                        color: message.sender === 'user' ? 'white' : 'var(--text-main)',
                                        boxShadow: message.sender === 'ai' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem',
                                        backgroundColor: 'white',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--text-muted)',
                                            animation: 'bounce 1.4s infinite ease-in-out'
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--text-muted)',
                                            animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--text-muted)',
                                            animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: '1rem',
                            borderTop: '1px solid #E5E7EB',
                            backgroundColor: 'white',
                            display: 'flex',
                            gap: '0.5rem'
                        }}
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            style={{
                                padding: '0.75rem 1rem',
                                backgroundColor: inputValue.trim() && !isLoading ? 'var(--primary)' : '#E5E7EB',
                                color: inputValue.trim() && !isLoading ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            aria-label="Send message"
                        >
                            <Icons.Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};

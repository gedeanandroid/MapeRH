import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Carregando...' }) => {
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(message);

    const messages = [
        'Conectando ao servidor...',
        'Verificando sessão...',
        'Carregando dados do usuário...',
        'Preparando dashboard...',
        'Quase lá...'
    ];

    useEffect(() => {
        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 15;
            });
        }, 300);

        // Change message every 1.5 seconds
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setCurrentMessage(messages[messageIndex]);
        }, 1500);

        return () => {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary-main via-primary-light to-primary-dark flex items-center justify-center z-50">
            <div className="text-center">
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                        <span className="text-primary-main font-bold text-3xl">M</span>
                    </div>
                    <h1 className="text-white text-2xl font-bold mt-4">MapeRH</h1>
                </motion.div>

                {/* Progress bar container */}
                <div className="w-64 mx-auto mb-6">
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-secondary-main rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 95)}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Loading message */}
                <motion.p
                    key={currentMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white/80 text-sm"
                >
                    {currentMessage}
                </motion.p>

                {/* Animated dots */}
                <div className="flex justify-center gap-1 mt-4">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-white/60 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;

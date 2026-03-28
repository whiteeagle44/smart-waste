import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Trash2, AlertCircle, Loader2, Map as MapIcon, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { classifyWaste, WasteClassification, generateSpeech } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { mockCollectionPoints } from '../lib/mockData';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text?: string;
  image?: string;
  classification?: WasteClassification;
  isError?: boolean;
}

interface ChatTabProps {
  onShowOnMap: (category: string) => void;
}

export default function ChatTab({ onShowOnMap }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: 'Cześć! Jestem Twoim asystentem SmartWaste. Zrób zdjęcie śmiecia lub opisz go, a powiem Ci, gdzie go wyrzucić.',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ url: string; file: File } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const speakText = async (msgId: string, classification: WasteClassification) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }
    
    setIsAudioLoading(msgId);
    setSpeakingId(null);
    setIsPaused(false);
    
    try {
      const text = `${classification.name}. Kategoria to: ${classification.category}. ${classification.instruction}`;
      const audioUrl = await generateSpeech(text);
      
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => {
        setSpeakingId(msgId);
        setIsPaused(false);
        setIsAudioLoading(null);
      };
      
      audio.onpause = () => {
        if (audio.currentTime !== audio.duration) {
          setIsPaused(true);
        }
      };
      
      audio.onended = () => {
        setSpeakingId(null);
        setIsPaused(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setSpeakingId(null);
        setIsPaused(false);
        setIsAudioLoading(null);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsAudioLoading(null);
    }
  };

  const pauseSpeech = () => {
    if (currentAudio) currentAudio.pause();
  };

  const resumeSpeech = () => {
    if (currentAudio) currentAudio.play();
  };

  const stopSpeech = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setSpeakingId(null);
      setIsPaused(false);
      setCurrentAudio(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage({ url, file });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.url);
      setSelectedImage(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      type: 'user',
      text: inputValue.trim() || undefined,
      image: selectedImage?.url,
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    const imageToProcess = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let base64Image;
      let mimeType;
      if (imageToProcess) {
        base64Image = await fileToBase64(imageToProcess.file);
        mimeType = imageToProcess.file.type;
      }

      const classification = await classifyWaste(newUserMsg.text || '', base64Image, mimeType);
      
      const newBotMsgId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: newBotMsgId,
        type: 'bot',
        classification,
      }]);

      if (isVoiceEnabled) {
        // Small delay to ensure state is updated before speaking
        setTimeout(() => speakText(newBotMsgId, classification), 100);
      }

    } catch (error) {
      console.error("Classification error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        text: 'Przepraszam, wystąpił błąd podczas analizy. Spróbuj ponownie później.',
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('metale') || cat.includes('tworzywa') || cat.includes('plastik')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (cat.includes('papier')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (cat.includes('szkło')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (cat.includes('bio')) return 'bg-amber-700/20 text-amber-500 border-amber-700/30';
    if (cat.includes('zmieszane')) return 'bg-zinc-600/20 text-zinc-300 border-zinc-600/30';
    if (cat.includes('elektro') || cat.includes('baterie')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (cat.includes('niebezpieczne') || cat.includes('leki')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (cat.includes('gabaryty') || cat.includes('budowlane') || cat.includes('opony')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (cat.includes('tekstylia') || cat.includes('odzież')) return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
  };

  const handleClearChat = () => {
    stopSpeech();
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: 'Cześć! Jestem Twoim asystentem SmartWaste. Zrób zdjęcie śmiecia lub opisz go, a powiem Ci, gdzie go wyrzucić.',
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        <div className="sticky top-0 z-10 flex justify-end gap-2 mb-4">
          <button
            onClick={() => {
              setIsVoiceEnabled(!isVoiceEnabled);
              if (isVoiceEnabled) {
                stopSpeech();
              }
            }}
            className={`bg-[#151518]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg ${isVoiceEnabled ? 'text-blue-400 hover:text-blue-300' : 'text-zinc-400 hover:text-white'}`}
          >
            {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {isVoiceEnabled ? 'Lektor włączony' : 'Lektor wyłączony'}
          </button>
          {messages.length > 1 && (
            <button 
              onClick={handleClearChat}
              className="bg-[#151518]/90 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <Trash2 size={14} />
              Wyczyść czat
            </button>
          )}
        </div>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-1' : 'order-2'}`}>
                {msg.type === 'bot' && (
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">S</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">SmartWaste AI</span>
                  </div>
                )}
                
                <div className={`
                  rounded-2xl p-4 
                  ${msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-[#151518] border border-white/5 rounded-tl-sm shadow-xl'
                  }
                  ${msg.isError ? 'border-red-500/30 bg-red-500/10' : ''}
                `}>
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Uploaded waste" 
                      className="w-full max-w-[240px] rounded-xl mb-3 object-cover"
                    />
                  )}
                  
                  {msg.text && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {msg.classification && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{msg.classification.name}</h3>
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(msg.classification.category)}`}>
                          {msg.classification.category}
                        </div>
                      </div>
                      
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {msg.classification.instruction}
                        </p>
                      </div>

                      {msg.classification.collectionPointType && (
                        <div className="flex items-start gap-2 text-sm text-blue-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <p>
                            Wymaga specjalnego punktu: <span className="font-semibold">{msg.classification.collectionPointType}</span>. Sprawdź mapę!
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        {isAudioLoading === msg.id ? (
                          <button
                            disabled
                            className="flex-1 bg-white/5 text-white/50 text-sm font-medium py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2"
                          >
                            <Loader2 size={16} className="animate-spin" />
                            Generowanie...
                          </button>
                        ) : speakingId === msg.id ? (
                          <>
                            {isPaused ? (
                              <button
                                onClick={resumeSpeech}
                                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium py-2.5 rounded-xl border border-blue-500/30 transition-colors flex items-center justify-center gap-2"
                                title="Wznów czytanie"
                              >
                                <Play size={16} />
                                Wznów
                              </button>
                            ) : (
                              <button
                                onClick={pauseSpeech}
                                className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium py-2.5 rounded-xl border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
                                title="Wstrzymaj czytanie"
                              >
                                <Pause size={16} />
                                Pauza
                              </button>
                            )}
                            <button
                              onClick={stopSpeech}
                              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium py-2.5 rounded-xl border border-red-500/30 transition-colors flex items-center justify-center gap-2"
                              title="Zatrzymaj czytanie"
                            >
                              <Square size={16} />
                              Stop
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => speakText(msg.id, msg.classification!)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                            title="Czytaj na głos"
                          >
                            <Volume2 size={16} className="text-blue-400" />
                            Czytaj
                          </button>
                        )}
                        {mockCollectionPoints.some(point => point.accepted_categories.includes(msg.classification!.category)) && (
                          <button 
                            onClick={() => onShowOnMap(msg.classification!.category)}
                            className="flex-[2] bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <MapIcon size={16} className="text-blue-400" />
                            Pokaż na mapie
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%]">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">S</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">SmartWaste AI</span>
                </div>
                <div className="bg-[#151518] border border-white/5 rounded-2xl rounded-tl-sm p-4 shadow-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-sm text-zinc-400">Analizuję odpad...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0A0A0C] border-t border-white/5 relative z-20">
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-full left-4 mb-2 bg-[#151518] p-2 rounded-xl border border-white/10 shadow-2xl"
            >
              <div className="relative group">
                <img src={selectedImage.url} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                <button 
                  onClick={removeSelectedImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#151518] border border-white/10 rounded-3xl flex items-end p-1 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-zinc-400 hover:text-blue-400 transition-colors shrink-0"
              disabled={isLoading}
            >
              <ImageIcon size={20} />
            </button>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Opisz śmieć..."
              className="flex-1 bg-transparent text-white placeholder:text-zinc-500 text-sm resize-none max-h-32 py-3 px-2 focus:outline-none"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '44px' }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !selectedImage) || isLoading}
            className="bg-blue-600 text-white p-3.5 rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0 shadow-lg shadow-blue-900/20"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

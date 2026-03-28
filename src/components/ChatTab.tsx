import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { classifyWaste, WasteClassification } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text?: string;
  image?: string;
  classification?: WasteClassification;
  isError?: boolean;
}

export default function ChatTab() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        classification,
      }]);

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
    if (cat.includes('plastik') || cat.includes('tworzywa') || cat.includes('metal')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (cat.includes('papier')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (cat.includes('szkło')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (cat.includes('bio')) return 'bg-amber-700/20 text-amber-500 border-amber-700/30';
    if (cat.includes('zmieszane')) return 'bg-zinc-600/20 text-zinc-300 border-zinc-600/30';
    if (cat.includes('elektro') || cat.includes('niebezpieczne') || cat.includes('leki')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

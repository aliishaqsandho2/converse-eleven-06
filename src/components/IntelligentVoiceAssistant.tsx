import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Activity, Send, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WaveformVisualization } from './WaveformVisualization';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const voices = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
];

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCa4pclqzhR4PaUyr81irTxp1rPQzEK3IU');

export const IntelligentVoiceAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [isSupported, setIsSupported] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [autoListen, setAutoListen] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistory = useRef<string>('');
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          if (transcript && transcript.length > 2) {
            handleUserInput(transcript);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          // Auto-restart on no-speech if auto-listen is enabled
          if (autoListen && !isProcessing && !isSpeaking) {
            setTimeout(() => startListening(), 2000);
          }
        } else if (event.error !== 'aborted') {
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again or check your microphone permissions.`,
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Auto-restart listening if enabled and not processing
        if (autoListen && !isProcessing && !isSpeaking) {
          setTimeout(() => startListening(), 1000);
        }
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [autoListen, isProcessing, isSpeaking]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Stop speech when user starts speaking
  useEffect(() => {
    if (isListening && isSpeaking && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  }, [isListening, isSpeaking]);

  const addMessage = useCallback((type: Message['type'], text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation history for context
    if (type === 'user' || type === 'assistant') {
      conversationHistory.current += `${type === 'user' ? 'User' : 'Assistant'}: ${text}\n`;
    }
  }, []);

  const startListening = async () => {
    if (!isSupported || !recognitionRef.current || isListening) return;

    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setIsListening(true);
      recognitionRef.current.start();
      
      toast({
        title: "Listening Started",
        description: "I'm now listening for your voice...",
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please allow microphone permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const generateResponse = async (userInput: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Create context-aware prompt
      const context = conversationHistory.current;
      const prompt = `You are a helpful, intelligent voice assistant. You're having a conversation with a user through voice. Keep responses conversational, natural, and concise (1-3 sentences max). 

Previous conversation context: ${context}

Current user message: ${userInput}

Respond in a natural, helpful way:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to simple responses if Gemini fails
      const input = userInput.toLowerCase();
      
      if (input.includes('hello') || input.includes('hi')) {
        return "Hello! I'm your AI voice assistant. How can I help you?";
      } else if (input.includes('how are you')) {
        return "I'm doing great, thank you for asking! How can I help you today?";
      } else if (input.includes('time')) {
        return `The current time is ${new Date().toLocaleTimeString()}.`;
      } else if (input.includes('date')) {
        return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
      } else {
        return "I'm here to help! What would you like to know or talk about?";
      }
    }
  };

  const handleUserInput = async (input: string) => {
    if (!input.trim()) return;

    setIsProcessing(true);
    addMessage('user', input);

    try {
      // Generate AI response
      const response = await generateResponse(input);
      addMessage('assistant', response);

      // Convert response to speech
      await speakResponse(response);
    } catch (error) {
      console.error('Error processing input:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_f592f2c44060e596a964585f7c3c6e6e35170c87da00c37d',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.volume = volume;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  const sendTextMessage = () => {
    if (currentInput.trim()) {
      handleUserInput(currentInput);
      setCurrentInput('');
    }
  };

  const clearHistory = () => {
    setMessages([]);
    conversationHistory.current = '';
    toast({
      title: "History Cleared",
      description: "Conversation history has been cleared",
    });
  };

  const toggleAutoListen = () => {
    setAutoListen(!autoListen);
    if (!autoListen && !isListening) {
      startListening();
    } else if (autoListen && isListening) {
      stopListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 text-center bg-destructive/10 border-destructive/20 max-w-md">
          <MicOff className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Speech Recognition Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/20 backdrop-blur-sm">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-voice-secondary bg-clip-text text-transparent">
              Intelligent Voice Assistant
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your smart conversational AI companion with interruption handling and context awareness
          </p>
        </div>

        {/* Status and Controls */}
        <Card className="glass border-primary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant={isListening ? "default" : "secondary"} 
                     className={isListening ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                <Mic className={`w-3 h-3 mr-1 ${isListening ? 'animate-pulse' : ''}`} />
                {isListening ? 'Listening' : 'Stopped'}
              </Badge>
              {isSpeaking && (
                <Badge variant="secondary" className="bg-voice-secondary/20 text-voice-secondary border-voice-secondary/30">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Speaking
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="secondary" className="bg-voice-accent/20 text-voice-accent border-voice-accent/30">
                  <Activity className="w-3 h-3 mr-1 animate-spin" />
                  Processing
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAutoListen}
                className={`text-muted-foreground hover:text-primary ${autoListen ? 'bg-primary/10' : ''}`}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-muted-foreground hover:text-primary"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              size="lg"
              className={`w-16 h-16 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'btn-voice-primary'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
          </div>

          {/* Audio Visualization */}
          <div className="flex justify-center mb-4">
            <WaveformVisualization isPlaying={isSpeaking || isListening} />
          </div>

          {/* Settings */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
              >
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Auto-Listen:</strong> {autoListen ? 'ON' : 'OFF'} - 
              {autoListen ? ' I\'m always listening and will restart after speaking' : ' Manual control - click the mic to start/stop'}
            </p>
          </div>
        </Card>

        {/* Text Input Alternative */}
        <Card className="glass border-primary/20 p-4">
          <div className="flex gap-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your message here or use voice..."
              className="flex-1 min-h-0 bg-background/50 border-primary/20 focus:border-primary resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendTextMessage();
                }
              }}
            />
            <Button
              onClick={sendTextMessage}
              disabled={!currentInput.trim() || isProcessing}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Conversation History */}
        <Card className="glass border-primary/20 overflow-hidden">
          <div className="p-4 border-b border-primary/10">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Conversation ({messages.length} messages)
            </h3>
          </div>
          
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Start speaking or typing to begin your conversation...</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'assistant'
                          ? 'bg-voice-secondary/20 text-voice-secondary border border-voice-secondary/30'
                          : 'bg-muted/50 text-muted-foreground text-center'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>

        {/* Hidden audio element for TTS */}
        <audio
          ref={audioRef}
          onEnded={() => setIsSpeaking(false)}
          onPlay={() => setIsSpeaking(true)}
          onPause={() => setIsSpeaking(false)}
        />
      </div>
    </div>
  );
};
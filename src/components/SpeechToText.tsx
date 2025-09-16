import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Copy, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WaveformVisualization } from './WaveformVisualization';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const SpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition settings
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'An error occurred during speech recognition';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
        }

        toast({
          title: "Recognition error",
          description: errorMessage,
          variant: "destructive",
        });
      };

      // Handle end
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setIsSupported(false);
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const startRecording = async () => {
    if (!isSupported || !recognitionRef.current) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsRecording(true);
      recognitionRef.current.start();
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording stopped",
        description: "Speech recognition has been stopped",
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearText = () => {
    setTranscript('');
    toast({
      title: "Text cleared",
      description: "Transcript has been cleared",
    });
  };

  const copyText = () => {
    if (!transcript.trim()) return;
    
    navigator.clipboard.writeText(transcript);
    toast({
      title: "Text copied!",
      description: "Transcript has been copied to clipboard",
    });
  };

  const downloadText = () => {
    if (!transcript.trim()) return;
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'speech-transcript.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Transcript is being downloaded",
    });
  };

  if (!isSupported) {
    return (
      <Card className="p-8 text-center bg-destructive/10 border-destructive/20">
        <div className="space-y-4">
          <MicOff className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="text-lg font-semibold text-destructive">Speech Recognition Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support speech recognition. Please try using Chrome, Edge, or Safari.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card className="p-6 bg-muted/20 border-primary/10">
        <div className="text-center space-y-6">
          <div className="relative">
            <Button
              onClick={toggleRecording}
              size="lg"
              className={`relative w-20 h-20 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg animate-pulse' 
                  : 'btn-voice-primary'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
            
            {isRecording && (
              <>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-red-400 animate-ping" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isRecording ? 'Recording...' : 'Click to Start Recording'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRecording 
                ? 'Speak clearly into your microphone. Click to stop.' 
                : 'Click the microphone button to start speech recognition'
              }
            </p>
          </div>
          
          {isRecording && <WaveformVisualization isPlaying={true} />}
        </div>
      </Card>

      {/* Transcript */}
      <Card className="p-6 bg-muted/20 border-primary/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transcript</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyText}
                disabled={!transcript.trim()}
                className="text-muted-foreground hover:text-primary"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadText}
                disabled={!transcript.trim()}
                className="text-muted-foreground hover:text-primary"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearText}
                disabled={!transcript.trim()}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your speech will appear here as you speak..."
            className="min-h-32 bg-background/50 border-primary/20 focus:border-primary resize-none"
            readOnly={isRecording}
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Characters: {transcript.length}</span>
            <span>Words: {transcript.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Download, Volume2, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WaveformVisualization } from './WaveformVisualization';

interface Voice {
  id: string;
  name: string;
}

const voices: Voice[] = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
];

export const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call ElevenLabs API directly
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_f592f2c44060e596a964585f7c3c6e6e35170c87da00c37d',
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      toast({
        title: "Speech generated successfully!",
        description: "Your audio is ready to play",
      });
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'generated-speech.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Text copied!",
      description: "Text has been copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <Card className="p-6 bg-muted/20 border-primary/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Enter Text
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyText}
              disabled={!text.trim()}
              className="text-muted-foreground hover:text-primary"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            className="min-h-32 bg-background/50 border-primary/20 focus:border-primary resize-none"
            maxLength={5000}
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Characters: {text.length}/5000</span>
          </div>
        </div>
      </Card>

      {/* Voice Selection */}
      <Card className="p-6 bg-muted/20 border-primary/10">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Voice</h3>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="bg-background/50 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={generateSpeech}
          disabled={isGenerating || !text.trim()}
          className="btn-voice-primary min-w-48"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Generate Speech
            </>
          )}
        </Button>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-voice-secondary/10 border-primary/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Audio</h3>
            
            <WaveformVisualization isPlaying={isPlaying} />
            
            <div className="flex items-center gap-4 justify-center">
              <Button
                onClick={playPause}
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/10"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              
              <Button
                onClick={downloadAudio}
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/10"
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
            
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
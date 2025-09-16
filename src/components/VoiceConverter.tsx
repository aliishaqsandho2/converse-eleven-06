import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextToSpeech } from './TextToSpeech';
import { SpeechToText } from './SpeechToText';
import { Mic, Volume2, Activity } from 'lucide-react';

export const VoiceConverter = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/20 backdrop-blur-sm">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-voice-secondary bg-clip-text text-transparent">
              Voice Converter
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform text to speech and speech to text with AI-powered precision using ElevenLabs technology
          </p>
        </div>

        {/* Main Converter Interface */}
        <Card className="glass border-primary/20 shadow-2xl backdrop-blur-xl">
          <Tabs defaultValue="tts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger 
                value="tts" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Volume2 className="w-4 h-4" />
                Text to Speech
              </TabsTrigger>
              <TabsTrigger 
                value="stt" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Mic className="w-4 h-4" />
                Speech to Text
              </TabsTrigger>
            </TabsList>

            <div className="p-8">
              <TabsContent value="tts" className="mt-0">
                <TextToSpeech />
              </TabsContent>
              
              <TabsContent value="stt" className="mt-0">
                <SpeechToText />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="glass border-primary/20 p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">High-Quality TTS</h3>
            <p className="text-sm text-muted-foreground">
              Generate natural-sounding speech with ElevenLabs' advanced AI voices
            </p>
          </Card>

          <Card className="glass border-primary/20 p-6 text-center">
            <div className="w-12 h-12 bg-voice-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-6 h-6 text-voice-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Real-time STT</h3>
            <p className="text-sm text-muted-foreground">
              Convert speech to text instantly with browser-native recognition
            </p>
          </Card>

          <Card className="glass border-primary/20 p-6 text-center">
            <div className="w-12 h-12 bg-voice-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-voice-accent" />
            </div>
            <h3 className="font-semibold mb-2">Smart Processing</h3>
            <p className="text-sm text-muted-foreground">
              Advanced audio processing with visual feedback and controls
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
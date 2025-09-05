import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GestureResult } from '@/hooks/useGestureRecognition';

interface GestureDisplayProps {
  gesture: GestureResult;
}

const gestureToText: Record<string, string> = {
  'fist': '✊',
  'one': '1',
  'two': '2', 
  'three': '3',
  'four': '4',
  'five': '5',
  'thumbs up': '👍',
  'rock on': '🤘',
  'unknown': '?'
};

const gestureToWord: Record<string, string> = {
  'fist': 'STOP',
  'one': 'ONE',
  'two': 'TWO',
  'three': 'THREE', 
  'four': 'FOUR',
  'five': 'FIVE',
  'thumbs up': 'GOOD',
  'rock on': 'COOL',
  'unknown': ''
};

export const GestureDisplay: React.FC<GestureDisplayProps> = ({ gesture }) => {
  const [displayText, setDisplayText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  
  useEffect(() => {
    if (gesture.gesture && gesture.confidence > 0.7) {
      const word = gestureToWord[gesture.gesture];
      if (word && word !== displayText) {
        setDisplayText(word);
        setHistory(prev => {
          const newHistory = [word, ...prev.slice(0, 4)];
          return newHistory;
        });
      }
    }
  }, [gesture, displayText]);

  const currentEmoji = gesture.gesture ? gestureToText[gesture.gesture] || '?' : '';

  return (
    <div className="space-y-6">
      {/* Current Gesture Display */}
      <Card className="p-8 text-center glow-effect smooth-transition">
        <div className="space-y-4">
          <div className="text-8xl animate-pulse-glow">
            {currentEmoji}
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gradient">
              {displayText || 'Show a gesture'}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={gesture.confidence > 0.7 ? 'default' : 'secondary'}>
                {gesture.gesture || 'No gesture detected'}
              </Badge>
              {gesture.confidence > 0 && (
                <Badge variant="outline">
                  {Math.round(gesture.confidence * 100)}% confident
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Text History */}
      {history.length > 0 && (
        <Card className="p-6 tech-shadow">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Words</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((word, index) => (
              <Badge 
                key={index} 
                variant={index === 0 ? 'default' : 'secondary'}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {word}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Gesture Guide */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Supported Gestures</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(gestureToText).filter(([key]) => key !== 'unknown').map(([gesture, emoji]) => (
            <div key={gesture} className="text-center p-3 rounded-lg bg-secondary/50 smooth-transition hover:bg-secondary">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-sm capitalize text-muted-foreground">{gesture}</div>
              <div className="text-xs font-medium text-accent">{gestureToWord[gesture]}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
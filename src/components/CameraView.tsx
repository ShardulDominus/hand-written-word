import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, Camera } from 'lucide-react';
import { useGestureRecognition } from '@/hooks/useGestureRecognition';
import { GestureDisplay } from './GestureDisplay';

export const CameraView: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    isActive,
    currentGesture,
    error,
    startCamera,
    stopCamera
  } = useGestureRecognition();

  return (
    <div className="space-y-6">
      {/* Camera Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Camera Feed</h2>
          </div>
          <div className="flex gap-2">
            {!isActive ? (
              <Button onClick={startCamera} variant="default" className="glow-effect">
                <Play className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera Feed */}
        <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: 'none' }}
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            width={640}
            height={480}
          />
          {!isActive && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Click "Start Camera" to begin gesture recognition</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Gesture Display */}
      <GestureDisplay gesture={currentGesture} />
    </div>
  );
};
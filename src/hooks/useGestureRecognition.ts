import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface GestureResult {
  gesture: string;
  confidence: number;
  landmarks?: any[];
}

// Basic gesture recognition based on hand landmarks
const recognizeGesture = (landmarks: any[]): GestureResult => {
  if (!landmarks || landmarks.length === 0) {
    return { gesture: '', confidence: 0 };
  }

  const handLandmarks = landmarks[0];
  
  // Get key landmark positions
  const thumb = handLandmarks[4];
  const index = handLandmarks[8];
  const middle = handLandmarks[12];
  const ring = handLandmarks[16];
  const pinky = handLandmarks[20];
  const wrist = handLandmarks[0];
  
  // Calculate if fingers are extended
  const thumbUp = thumb.y < handLandmarks[3].y;
  const indexUp = index.y < handLandmarks[6].y;
  const middleUp = middle.y < handLandmarks[10].y;
  const ringUp = ring.y < handLandmarks[14].y;
  const pinkyUp = pinky.y < handLandmarks[18].y;
  
  const fingersUp = [thumbUp, indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;
  
  // Basic gesture recognition
  if (fingersUp === 0) {
    return { gesture: 'fist', confidence: 0.9 };
  } else if (fingersUp === 1 && indexUp) {
    return { gesture: 'one', confidence: 0.9 };
  } else if (fingersUp === 2 && indexUp && middleUp) {
    return { gesture: 'two', confidence: 0.9 };
  } else if (fingersUp === 3 && indexUp && middleUp && ringUp) {
    return { gesture: 'three', confidence: 0.9 };
  } else if (fingersUp === 4 && !thumbUp) {
    return { gesture: 'four', confidence: 0.9 };
  } else if (fingersUp === 5) {
    return { gesture: 'five', confidence: 0.9 };
  } else if (fingersUp === 1 && thumbUp && !indexUp) {
    return { gesture: 'thumbs up', confidence: 0.8 };
  } else if (fingersUp === 2 && thumbUp && pinkyUp && !indexUp && !middleUp && !ringUp) {
    return { gesture: 'rock on', confidence: 0.8 };
  }
  
  return { gesture: 'unknown', confidence: 0.5 };
};

export const useGestureRecognition = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureResult>({ gesture: '', confidence: 0 });
  const [error, setError] = useState<string>('');

  const onResults = useCallback((results: any) => {
    if (!canvasRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (videoRef.current) {
      canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const gesture = recognizeGesture(results.multiHandLandmarks);
      setCurrentGesture(gesture);
      
      // Draw hand landmarks
      for (const landmarks of results.multiHandLandmarks) {
        canvasCtx.fillStyle = 'hsl(210, 100%, 56%)';
        canvasCtx.strokeStyle = 'hsl(180, 100%, 42%)';
        canvasCtx.lineWidth = 2;
        
        // Draw connections
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // index
          [0, 9], [9, 10], [10, 11], [11, 12], // middle
          [0, 13], [13, 14], [14, 15], [15, 16], // ring
          [0, 17], [17, 18], [18, 19], [19, 20], // pinky
          [5, 9], [9, 13], [13, 17] // palm
        ];
        
        canvasCtx.beginPath();
        for (const [start, end] of connections) {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          canvasCtx.moveTo(startPoint.x * canvasRef.current.width, startPoint.y * canvasRef.current.height);
          canvasCtx.lineTo(endPoint.x * canvasRef.current.width, endPoint.y * canvasRef.current.height);
        }
        canvasCtx.stroke();
        
        // Draw landmarks
        for (const landmark of landmarks) {
          canvasCtx.beginPath();
          canvasCtx.arc(
            landmark.x * canvasRef.current.width,
            landmark.y * canvasRef.current.height,
            3,
            0,
            2 * Math.PI
          );
          canvasCtx.fill();
        }
      }
    } else {
      setCurrentGesture({ gesture: '', confidence: 0 });
    }
    
    canvasCtx.restore();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      
      if (!videoRef.current) return;
      
      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });
      
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      hands.onResults(onResults);
      handsRef.current = hands;
      
      // Initialize camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      
      cameraRef.current = camera;
      await camera.start();
      setIsActive(true);
      
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [onResults]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    setIsActive(false);
    setCurrentGesture({ gesture: '', confidence: 0 });
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    currentGesture,
    error,
    startCamera,
    stopCamera
  };
};
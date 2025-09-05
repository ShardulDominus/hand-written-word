import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface GestureResult {
  gesture: string;
  confidence: number;
  landmarks?: any[];
}

// Enhanced ASL alphabet and gesture recognition
const recognizeGesture = (landmarks: any[]): GestureResult => {
  if (!landmarks || landmarks.length === 0) {
    return { gesture: '', confidence: 0 };
  }

  const handLandmarks = landmarks[0];
  
  // Get key landmark positions
  const thumb_tip = handLandmarks[4];
  const thumb_ip = handLandmarks[3];
  const thumb_mcp = handLandmarks[2];
  const index_tip = handLandmarks[8];
  const index_pip = handLandmarks[6];
  const index_mcp = handLandmarks[5];
  const middle_tip = handLandmarks[12];
  const middle_pip = handLandmarks[10];
  const middle_mcp = handLandmarks[9];
  const ring_tip = handLandmarks[16];
  const ring_pip = handLandmarks[14];
  const ring_mcp = handLandmarks[13];
  const pinky_tip = handLandmarks[20];
  const pinky_pip = handLandmarks[18];
  const pinky_mcp = handLandmarks[17];
  const wrist = handLandmarks[0];
  
  // Helper function to check if finger is extended
  const isExtended = (tip: any, pip: any, mcp: any) => tip.y < pip.y && pip.y < mcp.y;
  const isCurled = (tip: any, pip: any, mcp: any) => tip.y > pip.y;
  
  // Check finger states
  const thumbExtended = thumb_tip.x > thumb_ip.x; // Thumb extension is horizontal
  const indexExtended = isExtended(index_tip, index_pip, index_mcp);
  const middleExtended = isExtended(middle_tip, middle_pip, middle_mcp);
  const ringExtended = isExtended(ring_tip, ring_pip, ring_mcp);
  const pinkyExtended = isExtended(pinky_tip, pinky_pip, pinky_mcp);
  
  const thumbCurled = !thumbExtended;
  const indexCurled = isCurled(index_tip, index_pip, index_mcp);
  const middleCurled = isCurled(middle_tip, middle_pip, middle_mcp);
  const ringCurled = isCurled(ring_tip, ring_pip, ring_mcp);
  const pinkyCurled = isCurled(pinky_tip, pinky_pip, pinky_mcp);
  
  const fingersUp = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;
  
  // Calculate distances for specific letter recognition
  const thumbIndexDistance = Math.sqrt(
    Math.pow(thumb_tip.x - index_tip.x, 2) + Math.pow(thumb_tip.y - index_tip.y, 2)
  );
  const thumbMiddleDistance = Math.sqrt(
    Math.pow(thumb_tip.x - middle_tip.x, 2) + Math.pow(thumb_tip.y - middle_tip.y, 2)
  );
  
  // ASL Letter Recognition
  
  // Letter A - Closed fist with thumb on side
  if (indexCurled && middleCurled && ringCurled && pinkyCurled && thumbExtended) {
    return { gesture: 'A', confidence: 0.92 };
  }
  
  // Letter B - Four fingers up, thumb across palm
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbCurled) {
    return { gesture: 'B', confidence: 0.90 };
  }
  
  // Letter C - Curved hand shape
  if (thumbExtended && indexCurled && middleCurled && ringCurled && pinkyCurled && 
      thumb_tip.y > index_tip.y && index_tip.y < middle_tip.y) {
    return { gesture: 'C', confidence: 0.85 };
  }
  
  // Letter D - Index finger up, others curled, thumb touching middle finger
  if (indexExtended && middleCurled && ringCurled && pinkyCurled && thumbExtended &&
      thumbMiddleDistance < 0.05) {
    return { gesture: 'D', confidence: 0.88 };
  }
  
  // Letter E - All fingers curled down
  if (indexCurled && middleCurled && ringCurled && pinkyCurled && thumbCurled) {
    return { gesture: 'E', confidence: 0.90 };
  }
  
  // Letter F - Index and middle curled, ring and pinky up, thumb touches index
  if (indexCurled && middleCurled && ringExtended && pinkyExtended && thumbExtended &&
      thumbIndexDistance < 0.05) {
    return { gesture: 'F', confidence: 0.87 };
  }
  
  // Letter G - Index finger pointing sideways
  if (indexExtended && middleCurled && ringCurled && pinkyCurled && thumbExtended &&
      Math.abs(index_tip.y - index_mcp.y) < 0.05) {
    return { gesture: 'G', confidence: 0.85 };
  }
  
  // Letter I - Pinky up, others down
  if (indexCurled && middleCurled && ringCurled && pinkyExtended && thumbCurled) {
    return { gesture: 'I', confidence: 0.92 };
  }
  
  // Letter L - Index and thumb up, others down
  if (indexExtended && middleCurled && ringCurled && pinkyCurled && thumbExtended &&
      Math.abs(thumb_tip.x - index_tip.x) > 0.1) {
    return { gesture: 'L', confidence: 0.90 };
  }
  
  // Letter O - Fingers forming circle
  if (thumbExtended && indexCurled && middleCurled && ringCurled && pinkyCurled &&
      thumbIndexDistance < 0.08 && thumb_tip.y > wrist.y) {
    return { gesture: 'O', confidence: 0.85 };
  }
  
  // Letter U - Index and middle up together
  if (indexExtended && middleExtended && ringCurled && pinkyCurled && thumbCurled &&
      Math.abs(index_tip.x - middle_tip.x) < 0.05) {
    return { gesture: 'U', confidence: 0.88 };
  }
  
  // Letter V - Index and middle up in V shape
  if (indexExtended && middleExtended && ringCurled && pinkyCurled && thumbCurled &&
      Math.abs(index_tip.x - middle_tip.x) > 0.05) {
    return { gesture: 'V', confidence: 0.90 };
  }
  
  // Letter W - Index, middle, ring up
  if (indexExtended && middleExtended && ringExtended && pinkyCurled && thumbCurled) {
    return { gesture: 'W', confidence: 0.88 };
  }
  
  // Letter Y - Thumb and pinky extended
  if (indexCurled && middleCurled && ringCurled && pinkyExtended && thumbExtended) {
    return { gesture: 'Y', confidence: 0.90 };
  }
  
  // Fallback to basic number recognition
  if (fingersUp === 0) {
    return { gesture: 'fist', confidence: 0.9 };
  } else if (fingersUp === 1 && indexExtended) {
    return { gesture: 'one', confidence: 0.9 };
  } else if (fingersUp === 2 && indexExtended && middleExtended) {
    return { gesture: 'two', confidence: 0.9 };
  } else if (fingersUp === 3 && indexExtended && middleExtended && ringExtended) {
    return { gesture: 'three', confidence: 0.9 };
  } else if (fingersUp === 4 && !thumbExtended) {
    return { gesture: 'four', confidence: 0.9 };
  } else if (fingersUp === 5) {
    return { gesture: 'five', confidence: 0.9 };
  } else if (fingersUp === 1 && thumbExtended && !indexExtended) {
    return { gesture: 'thumbs up', confidence: 0.8 };
  } else if (fingersUp === 2 && thumbExtended && pinkyExtended && !indexExtended && !middleExtended && !ringExtended) {
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
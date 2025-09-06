import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

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
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureResult>({ gesture: '', confidence: 0 });
  const [error, setError] = useState<string>('');

  const detectHandGestures = useCallback(async () => {
    if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    // Clear canvas and draw video frame
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    try {
      // Detect hand landmarks
      const nowInMs = performance.now();
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, nowInMs);
      
      if (results.landmarks && results.landmarks.length > 0) {
        // Convert landmarks to the format expected by recognizeGesture
        const landmarks = results.landmarks.map(handLandmarks => 
          handLandmarks.map(landmark => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z
          }))
        );
        
        const gesture = recognizeGesture(landmarks);
        setCurrentGesture(gesture);
        
        // Draw hand landmarks
        for (const handLandmarks of results.landmarks) {
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
            const startPoint = handLandmarks[start];
            const endPoint = handLandmarks[end];
            canvasCtx.moveTo(startPoint.x * canvasRef.current.width, startPoint.y * canvasRef.current.height);
            canvasCtx.lineTo(endPoint.x * canvasRef.current.width, endPoint.y * canvasRef.current.height);
          }
          canvasCtx.stroke();
          
          // Draw landmarks
          for (const landmark of handLandmarks) {
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
    } catch (error) {
      console.error('Hand detection error:', error);
    }
    
    canvasCtx.restore();
    
    // Continue detection loop
    if (isActive) {
      requestAnimationFrame(detectHandGestures);
    }
  }, [isActive]);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      
      if (!videoRef.current || !canvasRef.current) return;
      
      // Initialize MediaPipe HandLandmarker
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        numHands: 1,
        runningMode: "VIDEO",
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      handLandmarkerRef.current = handLandmarker;
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      streamRef.current = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            resolve(true);
          };
        }
      });
      
      // Start playback to avoid black screen on some browsers
      await videoRef.current?.play?.();
      
      // Set canvas dimensions to match video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      setIsActive(true);
      detectHandGestures();
      
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [detectHandGestures]);

  const stopCamera = useCallback(() => {
    setIsActive(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current.close();
      handLandmarkerRef.current = null;
    }
    
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
'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Loader2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewUrl(dataUrl);
        
        // Stop the camera once captured
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const confirmPhoto = () => {
    if (previewUrl) {
      // Convert dataUrl to File
      fetch(previewUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        });
    }
  };

  const retry = () => {
    setPreviewUrl(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-6 text-rose-400">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-6 flex justify-center items-center gap-6 bg-zinc-900/80 backdrop-blur-sm border-t border-white/5">
          {previewUrl ? (
            <>
              <button 
                onClick={retry}
                className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors"
              >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Reintentar</span>
              </button>
              <button 
                onClick={confirmPhoto}
                className="flex flex-col items-center gap-2 text-primary hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
                  <Check className="w-8 h-8" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Usar Foto</span>
              </button>
            </>
          ) : (
            <button 
              onClick={capturePhoto}
              className="flex flex-col items-center gap-2 text-white hover:scale-105 transition-all active:scale-95"
              disabled={!!error}
            >
              <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1">
                <div className="w-full h-full bg-white rounded-full" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider">Capturar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

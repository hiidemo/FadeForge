import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { GradientSettings } from '../types';

interface CanvasWorkspaceProps {
  image: HTMLImageElement | null;
  settings: GradientSettings;
}

export interface CanvasWorkspaceHandle {
  toDataURL: () => string | null;
}

export const CanvasWorkspace = forwardRef<CanvasWorkspaceHandle, CanvasWorkspaceProps>(({ image, settings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useImperativeHandle(ref, () => ({
    toDataURL: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    }
  }));

  // Handle Resize of container to fit canvas properly visually
  useEffect(() => {
    if (!image) return;

    const updateDimensions = () => {
        // We render at full resolution, but style allows it to shrink
        setDimensions({ width: image.width, height: image.height });
    };

    updateDimensions();
  }, [image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Setup Canvas Dimensions
    canvas.width = image.width;
    canvas.height = image.height;

    // 2. Draw Original Image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // 3. Prepare Gradient Mask
    // Use destination-in to keep source pixels based on the destination (gradient) alpha
    ctx.globalCompositeOperation = 'destination-in';

    let gradient: CanvasGradient;

    if (settings.type === 'linear') {
      // Calculate coordinates based on angle
      // Convert degrees to radians, subtract 90 because 0deg is usually Up in CSS
      const rad = (settings.angle - 90) * (Math.PI / 180);

      // We want to find a line that passes through the center with the given angle
      // and covers the whole diagonal.
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      
      // Calculate a sufficient length to cover corners (diagonal)
      const diagonal = Math.sqrt(w * w + h * h);
      
      // Calculate start and end points of the gradient vector relative to center
      const x1 = cx + Math.cos(rad) * (diagonal / 2);
      const y1 = cy + Math.sin(rad) * (diagonal / 2);
      const x0 = cx - Math.cos(rad) * (diagonal / 2);
      const y0 = cy - Math.sin(rad) * (diagonal / 2);

      gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    } else {
      // Simple radial implementation
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.max(canvas.width, canvas.height) / 2;
      gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    }

    // 4. Apply User Stops
    const start = settings.startPoint / 100;
    const end = settings.endPoint / 100;

    // Ensure strict ordering for gradient.addColorStop to avoid errors
    const safeStart = Math.max(0, Math.min(1, start));
    const safeEnd = Math.max(0, Math.min(1, end));
    
    // We want to fade FROM opaque TO transparent
    if (settings.invert) {
       gradient.addColorStop(0, 'rgba(0,0,0,0)'); 
       gradient.addColorStop(Math.min(safeStart, safeEnd), 'rgba(0,0,0,0)');
       gradient.addColorStop(Math.max(safeStart, safeEnd), 'rgba(0,0,0,1)');
       gradient.addColorStop(1, 'rgba(0,0,0,1)');
    } else {
       gradient.addColorStop(0, 'rgba(0,0,0,1)'); 
       gradient.addColorStop(Math.min(safeStart, safeEnd), 'rgba(0,0,0,1)');
       gradient.addColorStop(Math.max(safeStart, safeEnd), 'rgba(0,0,0,0)');
       gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset composite operation for future draws if we reused the context
    ctx.globalCompositeOperation = 'source-over';

  }, [image, settings]);

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p>No image loaded</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center overflow-auto p-8"
    >
      <div className="relative shadow-2xl bg-checkered box-border border border-slate-700">
         <canvas 
            ref={canvasRef} 
            className="max-w-full max-h-[70vh] object-contain block"
         />
      </div>
    </div>
  );
});

CanvasWorkspace.displayName = 'CanvasWorkspace';
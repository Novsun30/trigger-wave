"use client";

import { RefObject, useEffect, useRef } from "react";
import * as Tone from "tone";

interface WaveformAnalyserProps {
  analyserRef: RefObject<Tone.Analyser | null>;
  width: number;
  height: number;
  isInitialized: boolean;
}

export default function WaveformAnalyser({
  analyserRef,
  width,
  height,
  isInitialized,
}: WaveformAnalyserProps) {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    const drawWaveform = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const values = analyser.getValue();

      if (values instanceof Float32Array === false) return;

      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00d1b2";
      ctx.beginPath();
      const sliceWidth = width / values.length;
      let xAxis = 0;

      for (let i = 0; i < values.length; i++) {
        const v = values[i] as number;
        const y = (0.5 - v * 0.5) * height;
        if (i === 0) {
          ctx.moveTo(xAxis, y);
        } else {
          ctx.lineTo(xAxis, y);
        }

        xAxis += sliceWidth;
      }

      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInitialized, analyserRef, width, height]);

  return (
    <div className="mb-6 rounded-lg border-2 border-gray-700 bg-black p-2 shadow-lg">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full max-w-[600px]"
      />
    </div>
  );
}

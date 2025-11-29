"use client";

import { RefObject, useEffect, useRef } from "react";
import * as Tone from "tone";

interface FftAnalyserProps {
  analyserRef: RefObject<Tone.Analyser | null>;
  width: number;
  height: number;
  isInitialized: boolean;
}

export default function FftAnalyser({
  analyserRef,
  width,
  height,
  isInitialized,
}: FftAnalyserProps) {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    const drawFft = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const values = analyser.getValue();
      if (values instanceof Float32Array === false) return;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#00d1b2";

      const barWidth = width / values.length;

      let xAxis = 0;

      for (let i = 0; i < values.length; i++) {
        const value = values[i] as number;

        let barHeight = value + 150;

        if (barHeight < 0) barHeight = 0;
        if (barHeight > height) barHeight = height;

        ctx.fillRect(xAxis, height - barHeight, barWidth - 1, barHeight);

        xAxis += barWidth;
      }

      animationRef.current = requestAnimationFrame(drawFft);
    };
    drawFft();

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

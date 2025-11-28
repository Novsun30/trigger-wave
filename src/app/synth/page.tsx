"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const BASIC_HERTZ = 440;

export default function Synth() {
  const fftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fftAnimationRef = useRef<number | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveformAnimationRef = useRef<number | null>(null);
  const oscRef = useRef<Tone.Oscillator | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const envelopRef = useRef<Tone.AmplitudeEnvelope | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);
  const analyserFftRef = useRef<Tone.Analyser | null>(null);
  const analyserWaveformRef = useRef<Tone.Analyser | null>(null);
  const [volume, setVolume] = useState(-10);
  const [adsr, setAdsr] = useState({
    attack: 0.01,
    decay: 0.01,
    sustain: 1,
    release: 0.01,
  });
  const [lfoAmount, setLfoAmount] = useState(0.1);
  const [lfo, setLfo] = useState(5);

  useEffect(() => {
    oscRef.current = new Tone.Oscillator(BASIC_HERTZ, "sine");
    envelopRef.current = new Tone.AmplitudeEnvelope();
    lfoRef.current = new Tone.LFO().start();
    lfoRef.current.connect(oscRef.current.frequency);
    volumeRef.current = new Tone.Volume();
    analyserWaveformRef.current = new Tone.Analyser("waveform").toDestination();
    analyserFftRef.current = new Tone.Analyser("fft", 128).toDestination();
    oscRef.current.chain(
      envelopRef.current,
      volumeRef.current,
      analyserFftRef.current,
      analyserWaveformRef.current,
    );
    oscRef.current?.start();
    return () => {
      oscRef.current?.dispose();
      envelopRef.current?.dispose();
      lfoRef.current?.dispose();
      volumeRef.current?.dispose();
      analyserFftRef.current?.dispose();
      analyserWaveformRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!oscRef.current || !volumeRef.current || !envelopRef.current) {
      return;
    }
    lfoRef.current?.set({
      min: BASIC_HERTZ - (880 * lfoAmount) / 100,
      max: BASIC_HERTZ + (880 * lfoAmount) / 100,
      frequency: lfo,
    });
    volumeRef.current.volume.value = volume;
    envelopRef.current.set({
      attack: adsr.attack,
      decay: adsr.decay,
      sustain: adsr.sustain,
      release: adsr.release,
    });
  }, [volume, adsr, lfo, lfoAmount]);

  useEffect(() => {
    const drawWaveform = () => {
      const canvas = waveformCanvasRef.current;
      const analyser = analyserWaveformRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const values = analyser.getValue();

      if (values instanceof Float32Array === false) return;

      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00d1b2";
      ctx.beginPath();
      const sliceWidth = width / values.length;
      let x = 0;

      for (let i = 0; i < values.length; i++) {
        const v = values[i] as number;
        const y = (0.5 - v * 0.5) * height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      waveformAnimationRef.current = requestAnimationFrame(drawWaveform);
    };

    const drawFft = () => {
      const canvas = fftCanvasRef.current;
      const analyser = analyserFftRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const values = analyser.getValue();
      if (values instanceof Float32Array === false) return;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#00d1b2";

      const barWidth = width / values.length;

      let x = 0;

      for (let i = 0; i < values.length; i++) {
        const value = values[i] as number;

        let barHeight = value + 150;

        if (barHeight < 0) barHeight = 0;
        if (barHeight > height) barHeight = height;

        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }

      fftAnimationRef.current = requestAnimationFrame(drawFft);
    };
    drawWaveform();
    drawFft();

    return () => {
      if (fftAnimationRef.current) {
        cancelAnimationFrame(fftAnimationRef.current);
      }
    };
  }, []);

  const handleMouseDown = () => {
    envelopRef.current?.triggerAttack();
  };
  const handleMouseUp = () => {
    envelopRef.current?.triggerRelease();
  };

  const adsrArray = [
    {
      type: "attack",
      value: adsr.attack,
    },
    {
      type: "decay",
      value: adsr.decay,
    },
    {
      type: "sustain",
      value: adsr.sustain,
    },
    {
      type: "release",
      value: adsr.release,
    },
  ];
  const renderAdsr = adsrArray.map((item) => {
    return (
      <div key={item.type} className="flex flex-col">
        {item.type} {item.value === 0.01 ? 0 : item.value}
        <input
          value={item.value}
          min={item.type === "sustain" ? 0 : 0.01}
          max={item.type === "sustain" ? 1 : 2}
          step={0.01}
          onChange={(e) => {
            setAdsr({ ...adsr, [item.type]: Number(e.target.value) });
          }}
          type="range"
        />
      </div>
    );
  });

  const lfoArray = [
    { type: "hertz", value: lfo },
    {
      type: "amount",
      value: lfoAmount,
    },
  ];

  const renderLfo = lfoArray.map((item) => {
    return (
      <div key={item.type} className="flex flex-col">
        {item.type} {item.value}
        <input
          value={item.value}
          min={item.type === "amount" ? 0 : 0.1}
          max={item.type === "amount" ? 100 : 10}
          step={item.type === "amount" ? 1 : 0.1}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onChange={(e) => {
            if (item.type === "amount") {
              setLfoAmount(Number(e.target.value));
              return;
            }
            setLfo(Number(e.target.value));
          }}
          type="range"
        />
      </div>
    );
  });

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <div className="flex gap-4">
        <div
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          start
        </div>
        <input
          type="range"
          max={0}
          min={-50}
          value={volume}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onChange={(e) => {
            setVolume(Number(e.target.value));
          }}
        ></input>
        <p className="w-16">{volume} db</p>
      </div>
      <div className="flex justify-around gap-4">
        <select
          defaultValue={"sine"}
          onChange={(e) => {
            if (oscRef.current === null) {
              return;
            }
            oscRef.current.type = e.target.value as Tone.ToneOscillatorType;
          }}
        >
          <option value="sine">sine</option>
          <option value="square">square</option>
          <option value="sawtooth">sawtooth</option>
          <option value="triangle">triangle</option>
        </select>
        <div className="flex flex-col">{renderAdsr}</div>
        <div className="flex flex-col">{renderLfo}</div>
      </div>
      <div className="mb-6 rounded-lg border-2 border-gray-700 bg-black p-2 shadow-lg">
        <canvas
          ref={waveformCanvasRef}
          width={600}
          height={150}
          className="w-full max-w-[600px]"
        />
      </div>
      <div className="mb-6 rounded-lg border-2 border-gray-700 bg-black p-2 shadow-lg">
        <canvas
          ref={fftCanvasRef}
          width={600}
          height={150}
          className="w-full max-w-[600px]"
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import FftAnalyser from "./components/fftAnalyser";
import WaveformAnalyser from "./components/wavformAnalyser";

const BASIC_HERTZ = 440;

const KEY_MAP: { [key: string]: string } = {
  KeyA: "C4",
  KeyS: "D4",
  KeyD: "E4",
  KeyF: "F4",
  KeyG: "G4",
  KeyH: "A4",
  KeyJ: "B4",
  KeyK: "C5",
};

interface Voice {
  osc: Tone.Oscillator;
  env: Tone.AmplitudeEnvelope;
}

export default function Synth() {
  const voiceRef = useRef<Map<string, Voice>>(new Map());
  const keyMapRef = useRef<Map<string, HTMLElement>>(new Map());

  const oscRef = useRef<Tone.Oscillator | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const envelopRef = useRef<Tone.AmplitudeEnvelope | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);
  const analyserFftRef = useRef<Tone.Analyser | null>(null);
  const analyserWaveformRef = useRef<Tone.Analyser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [volume, setVolume] = useState(-10);
  const [adsr, setAdsr] = useState({
    attack: 0.01,
    decay: 0.01,
    sustain: 1,
    release: 0.01,
  });
  const adsrValueRef = useRef(adsr);
  const [lfoAmount, setLfoAmount] = useState(0);
  const [lfoFrequency, setLfoFrequency] = useState(5);
  const lfoValueRef = useRef({ lfoFrequency, lfoAmount });

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

    function updateInitState() {
      setIsInitialized(true);
    }

    updateInitState();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.code;
      const note = KEY_MAP[key];
      if (voiceRef.current.has(note)) {
        const voice = voiceRef.current.get(note);
        voice?.env.dispose();
      }
      if (
        note &&
        oscRef.current &&
        volumeRef.current &&
        analyserFftRef.current &&
        analyserWaveformRef.current
      ) {
        const osc = new Tone.Oscillator(note, oscRef.current.type);
        const env = new Tone.AmplitudeEnvelope({
          attack: adsrValueRef.current.attack,
          decay: adsrValueRef.current.decay,
          sustain: adsrValueRef.current.sustain,
          release: adsrValueRef.current.release,
        });

        const lfoMod = new Tone.LFO(
          lfoValueRef.current.lfoFrequency,
          Tone.Frequency(note).toFrequency() -
            (880 * lfoValueRef.current.lfoAmount) / 100,
          Tone.Frequency(note).toFrequency() +
            (880 * lfoValueRef.current.lfoAmount) / 100,
        ).start();
        lfoMod.connect(osc.frequency);
        osc.chain(
          env,
          volumeRef.current,
          analyserFftRef.current,
          analyserWaveformRef.current,
        );
        voiceRef.current.set(note, { osc, env });
        osc.start();
        env.triggerAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.code;
      const note = KEY_MAP[key];
      if (note) {
        const voice = voiceRef.current.get(note);
        voice?.env.triggerRelease();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

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
      frequency: lfoFrequency,
    });
    volumeRef.current.volume.value = volume;
    envelopRef.current.set({
      attack: adsr.attack,
      decay: adsr.decay,
      sustain: adsr.sustain,
      release: adsr.release,
    });
    adsrValueRef.current = adsr;
    lfoValueRef.current = { lfoFrequency, lfoAmount };
  }, [volume, adsr, lfoFrequency, lfoAmount]);

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
    { type: "hertz", value: lfoFrequency },
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
            setLfoFrequency(Number(e.target.value));
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
      <WaveformAnalyser
        analyserRef={analyserWaveformRef}
        width={600}
        height={150}
        isInitialized={isInitialized}
      />
      <FftAnalyser
        analyserRef={analyserFftRef}
        width={600}
        height={150}
        isInitialized={isInitialized}
      />

      <div className="flex gap-2">
        {Object.values(KEY_MAP).map((item) => {
          return (
            <div
              key={item}
              ref={(el) => {
                if (el) {
                  keyMapRef.current.set(item, el);
                } else {
                  keyMapRef.current?.delete(item);
                }
              }}
            >
              {item}
            </div>
          );
        })}
        {/* keyboard */}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const BASIC_HERTZ = 440;

export default function Synth() {
  const oscRef = useRef<Tone.Oscillator | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const envelopRef = useRef<Tone.AmplitudeEnvelope | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);
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
    volumeRef.current = new Tone.Volume().toDestination();
    oscRef.current.chain(envelopRef.current, volumeRef.current);
    oscRef.current?.start();
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
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onChange={(e) => {
            setAdsr({ ...adsr, [item.type]: Number(e.target.value) });
            envelopRef.current?.triggerAttack();
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
        <div onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
          start
        </div>
        <input
          type="range"
          max={0}
          min={-60}
          value={volume}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
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
    </div>
  );
}

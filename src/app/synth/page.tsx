"use client";

import { useState } from "react";
import * as Tone from "tone";

let osc: null | Tone.Oscillator = null;

interface adsr {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}
interface lfo {
  hertz: number;
  min: number;
  max: number;
}

const createSound = (oscInputType: OscillatorType, adsr: adsr, lfo: lfo) => {
  const env = new Tone.AmplitudeEnvelope(adsr);
  osc = new Tone.Oscillator(440, oscInputType);

  const volume = new Tone.Volume().toDestination();
  // const lfo = new Tone.LFO(0.5, 0, 40).start();
  // lfo.connect(volume.volume);

  const lfo2 = new Tone.LFO(lfo.hertz, lfo.min, lfo.max).start();
  lfo2.connect(osc.frequency);

  osc.connect(env);
  env.connect(volume);

  osc.volume.value = -16;
  osc.start();
  env.triggerAttackRelease("2.5");
};

export default function Synth() {
  const [oscType, setOscType] = useState<OscillatorType>("sine");
  const [adsrValue, setAdsrValue] = useState({
    attack: 1.4,
    decay: 0.8,
    sustain: 1,
    release: 0.8,
  });
  const [lfoValue, setLfoValue] = useState({
    hertz: 5,
    min: 220,
    max: 440,
  });

  const start = () => {
    if (osc === null) {
      createSound(oscType, adsrValue, lfoValue);
      return;
    }
    osc.stop();
    createSound(oscType, adsrValue, lfoValue);
  };

  const stop = () => {
    if (osc === null) {
      return;
    }
    osc.stop();
  };

  const adsrArray = [
    {
      type: "attack",
      value: adsrValue.attack,
    },
    {
      type: "decay",
      value: adsrValue.decay,
    },
    {
      type: "sustain",
      value: adsrValue.sustain,
    },
    {
      type: "release",
      value: adsrValue.release,
    },
  ];
  const renderAdsr = adsrArray.map((item) => {
    return (
      <div key={item.type}>
        {item.type}
        <input
          value={item.value}
          onChange={(e) => {
            setAdsrValue({ ...adsrValue, [item.type]: Number(e.target.value) });
          }}
          type="number"
        />
      </div>
    );
  });

  const lfoArray = [
    { type: "hertz", value: lfoValue.hertz },
    {
      type: "min",
      value: lfoValue.min,
    },
    { type: "max", value: lfoValue.max },
  ];

  const renderLfo = lfoArray.map((item) => {
    return (
      <div key={item.type}>
        {item.type}
        <input
          value={item.value}
          onChange={(e) => {
            setLfoValue({ ...lfoValue, [item.type]: Number(e.target.value) });
          }}
          type="number"
        />
      </div>
    );
  });

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <div className="flex gap-4">
        <div onClick={stop}>stop</div>
        <div onClick={start}>start</div>
      </div>
      <div className="flex justify-around gap-4">
        <select
          value={oscType}
          onChange={(e) => {
            if (osc !== null) {
              osc.stop();
            }
            setOscType(e.target.value as OscillatorType);
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

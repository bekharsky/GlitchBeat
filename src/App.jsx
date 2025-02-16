import { useState, useEffect } from "react";
import { PowerGlitch } from "powerglitch";
import {
  FaWaveSquare,
  FaDrum,
  FaBolt,
  FaFire,
  FaMusic,
  FaUpload,
} from "react-icons/fa";
import { GLITCH_CONFIG } from "./constants";
import { extractCover } from "./extractCover";
import {
  analyzeSpectralFlux,
  analyzeZeroCrossingRate,
  analyzeBeatTracking,
  analyzeEnergy,
  analyzePeakDetection,
} from "./analyzers";

const rhythmMethods = [
  { method: analyzeSpectralFlux, icon: <FaBolt />, title: "Spectral Flux" },
  {
    method: analyzeZeroCrossingRate,
    icon: <FaWaveSquare />,
    title: "Zero Crossing",
  },
  { method: analyzeBeatTracking, icon: <FaDrum />, title: "Beat Tracking" },
  { method: analyzeEnergy, icon: <FaFire />, title: "Energy Detection" },
  { method: analyzePeakDetection, icon: <FaMusic />, title: "Peak Detection" },
];

export default function AudioGlitchApp() {
  const [cover, setCover] = useState(null);
  const [audioAnalyzer, setAudioAnalyzer] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [detectRhythmMethod, setDetectRhythmMethod] = useState(
    () => analyzeSpectralFlux
  );
  const bpm = 120;
  let lastGlitchTime = 0;

  useEffect(() => {
    if (cover && audioAnalyzer && audioElement) {
      const { startGlitch } = PowerGlitch.glitch(".cover", {
        ...GLITCH_CONFIG,
        playMode: "manual",
      });

      const minGlitchInterval = 60000 / bpm;
      let detectRhythm = detectRhythmMethod(audioAnalyzer);
      let isRunning = true;

      const detectBeats = () => {
        if (!isRunning) return;
        const now = performance.now();
        if (now - lastGlitchTime > minGlitchInterval) {
          if (detectRhythm()) {
            startGlitch();
            lastGlitchTime = now;
          }
        }
        requestAnimationFrame(detectBeats);
      };
      detectBeats();
      audioElement.play();

      return () => {
        isRunning = false;
      };
    }
  }, [cover, audioAnalyzer, audioElement, detectRhythmMethod]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    const audioEl = new Audio(audioUrl);
    setAudioElement(audioEl);

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const source = context.createMediaElementSource(audioEl);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyser.connect(context.destination);

    setAudioAnalyzer(analyser);

    if (!cover) {
      const pic = await extractCover(file);
      setCover(pic);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative">
      {cover ? (
        <img
          src={cover}
          alt="Cover"
          className="cover w-64 h-64 object-cover rounded-lg shadow-lg"
        />
      ) : (
        <label className="p-4 bg-gray-700 text-white rounded-lg cursor-pointer flex flex-col items-center gap-2 border border-gray-600 hover:bg-gray-600 transition">
          <FaUpload size={24} />
          <span>Upload MP3</span>
          <input
            type="file"
            accept="audio/mpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      )}
      <div className="absolute bottom-4 space-x-2 flex">
        {rhythmMethods.map(({ method, icon, title }) => (
          <button
            key={title}
            title={title}
            className={`p-2 bg-red-800 rounded-lg flex items-center transition-colors hover:bg-red-700 ${
              detectRhythmMethod === method ? "ring-2 ring-white" : ""
            }`}
            onClick={() => setDetectRhythmMethod(() => method)}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

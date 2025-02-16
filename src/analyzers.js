export function analyzeSpectralFlux(analyser) {
  const bufferLength = analyser.frequencyBinCount;
  const previousFrame = new Uint8Array(bufferLength);
  const currentFrame = new Uint8Array(bufferLength);
  return () => {
    analyser.getByteFrequencyData(currentFrame);
    let flux = 0;
    for (let i = 0; i < bufferLength; i++) {
      let diff = currentFrame[i] - previousFrame[i];
      flux += diff > 0 ? diff : 0;
    }
    previousFrame.set(currentFrame);
    console.log("analyzeSpectralFlux", flux);
    return flux > 3000;
  };
}

export function analyzeZeroCrossingRate(analyser) {
  const buffer = new Float32Array(analyser.fftSize);
  return () => {
    analyser.getFloatTimeDomainData(buffer);
    let crossings = 0;
    for (let i = 1; i < buffer.length; i++) {
      if (
        (buffer[i - 1] < 0 && buffer[i] > 0) ||
        (buffer[i - 1] > 0 && buffer[i] < 0)
      ) {
        crossings++;
      }
    }
    console.log("analyzeZeroCrossingRate", crossings);
    return crossings > 120;
  };
}

export function analyzeBeatTracking(analyser) {
  const buffer = new Uint8Array(analyser.frequencyBinCount);
  return () => {
    analyser.getByteFrequencyData(buffer);
    const avg = buffer.reduce((sum, val) => sum + val, 0) / buffer.length;
    console.log("analyzeBeatTracking", avg);
    return avg > 100;
  };
}

export function analyzeEnergy(analyser) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let lastEnergy = 0;

  return () => {
    analyser.getByteFrequencyData(dataArray);
    const energy =
      dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

    const threshold = lastEnergy * 1.2; // 20% прирост энергии как порог
    const isBeat = energy > threshold;
    lastEnergy = energy * 0.9 + lastEnergy * 0.1; // медленный спад энергии
    return isBeat;
  };
}

export function analyzePeakDetection(analyser) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let lastPeak = 0;

  return () => {
    analyser.getByteFrequencyData(dataArray);
    const maxAmplitude = Math.max(...dataArray);

    const threshold = lastPeak * 0.8 + 50; // Динамический порог с базовым значением
    const isPeak = maxAmplitude > threshold;
    if (isPeak) lastPeak = maxAmplitude; // Обновляем последний пик
    return isPeak;
  };
}

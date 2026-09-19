// lib/climateCalculations.ts
// Scientific calculations for Indoor Climate, Thermal Comfort, Feels Like,
// Dew Point, and ASHRAE / VTT Indoor Mold Spore Germination Risk.

export interface ComfortAssessment {
  feelsLike: number; // °C
  comfortLevel: string; // e.g. "Optimal", "Warm", "Humid Heat"
  comfortColor: string; // Tailwind color class
  dewPoint: number; // °C
  moldRiskScore: number; // 0 to 100%
  moldRiskLevel: "minimal" | "low" | "moderate" | "high" | "critical";
  moldRiskColor: string; // Tailwind color class
  moldRecommendation: string;
  weatherTrend: string;
}

/**
 * Calculates perceived temperature ("Feels Like" / Heat Index)
 * Uses NOAA Rothfusz Regression for warm humid conditions and Australian Apparent Temp for mild conditions.
 */
export function calculateFeelsLike(tempC: number, rh: number): number {
  if (tempC >= 26 && rh >= 40) {
    // Convert to Fahrenheit for NOAA Rothfusz formula
    const tf = tempC * 1.8 + 32;
    // Simple Steadman formula test
    const hiSimple = 0.5 * (tf + 61.0 + (tf - 68.0) * 1.2 + rh * 0.094);
    if ((tf + hiSimple) / 2 < 80) {
      return Number(((hiSimple - 32) / 1.8).toFixed(1));
    }

    // Full Rothfusz regression equation
    let hi =
      -42.379 +
      2.04901523 * tf +
      10.14333127 * rh -
      0.22475541 * tf * rh -
      0.00683783 * tf * tf -
      0.05481717 * rh * rh +
      0.00122874 * tf * tf * rh +
      0.00085282 * tf * rh * rh -
      0.00000199 * tf * tf * rh * rh;

    // Adjustments
    if (rh < 13 && tf >= 80 && tf <= 112) {
      hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tf - 95)) / 17);
    } else if (rh > 85 && tf >= 80 && tf <= 87) {
      hi += ((rh - 85) / 10) * ((87 - tf) / 5);
    }

    return Number(((hi - 32) / 1.8).toFixed(1));
  }

  // Australian Apparent Temperature equation for general indoor comfort
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  const apparent = tempC + 0.33 * e - 0.7 * 0.2 - 4.0;
  return Number(apparent.toFixed(1));
}

/**
 * Calculates Dew Point using the Magnus-Tetens approximation.
 */
export function calculateDewPoint(tempC: number, rh: number): number {
  const safeRh = Math.max(1, Math.min(100, rh));
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(safeRh / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Number(dewPoint.toFixed(1));
}

/**
 * Evaluates Indoor Mold Growth Risk according to ASHRAE 160 criteria.
 * Mold spores require sustained relative humidity (>65%) at ambient temperatures (20°C - 35°C).
 */
export function calculateMoldRisk(tempC: number, rh: number): {
  score: number;
  level: "minimal" | "low" | "moderate" | "high" | "critical";
  color: string;
  recommendation: string;
} {
  // If temperature is outside mold growth envelope (<10°C or >40°C), risk is minimal
  if (tempC < 10 || tempC > 42) {
    return {
      score: 10,
      level: "minimal",
      color: "text-emerald-400",
      recommendation: "Room temperature inhibits spore germination.",
    };
  }

  // Base score from Relative Humidity
  let score = 0;
  if (rh < 50) {
    score = Math.round((rh / 50) * 20); // 0 - 20%
  } else if (rh < 65) {
    score = 20 + Math.round(((rh - 50) / 15) * 25); // 20 - 45%
  } else if (rh < 75) {
    score = 45 + Math.round(((rh - 65) / 10) * 30); // 45 - 75%
  } else {
    score = 75 + Math.round(Math.min(25, ((rh - 75) / 25) * 25)); // 75 - 100%
  }

  // Temperature multiplier (optimal mold growth is 22°C - 32°C)
  if (tempC >= 24 && tempC <= 34 && rh >= 65) {
    score = Math.min(100, score + 10);
  }

  if (score < 25) {
    return {
      score,
      level: "minimal",
      color: "text-emerald-400",
      recommendation: "Air is clean & crisp. Spore germination dormant.",
    };
  } else if (score < 50) {
    return {
      score,
      level: "low",
      color: "text-teal-400",
      recommendation: "Safe indoor balance. No moisture buildup detected.",
    };
  } else if (score < 70) {
    return {
      score,
      level: "moderate",
      color: "text-amber-400",
      recommendation: "Elevated humidity. Consider running exhaust or open window.",
    };
  } else if (score < 85) {
    return {
      score,
      level: "high",
      color: "text-orange-400",
      recommendation: "High humidity alert! Turn on fan/ventilation to stop fungal growth.",
    };
  } else {
    return {
      score,
      level: "critical",
      color: "text-rose-500",
      recommendation: "Severe condensation danger. Immediate dehumidification needed.",
    };
  }
}

/**
 * Complete comfort assessment combining all environmental metrics.
 */
export function getComfortAssessment(
  tempC: number,
  rh: number,
  pressureHpa: number = 1009.1
): ComfortAssessment {
  const feelsLike = calculateFeelsLike(tempC, rh);
  const dewPoint = calculateDewPoint(tempC, rh);
  const mold = calculateMoldRisk(tempC, rh);

  let comfortLevel = "Comfortable";
  let comfortColor = "text-emerald-400";

  if (feelsLike < 18) {
    comfortLevel = "Cool & Crisp";
    comfortColor = "text-sky-400";
  } else if (feelsLike <= 24.5) {
    comfortLevel = "Optimal Comfort";
    comfortColor = "text-emerald-400";
  } else if (feelsLike <= 29) {
    comfortLevel = "Warm & Dry";
    comfortColor = "text-amber-400";
  } else if (feelsLike <= 35) {
    comfortLevel = "Humid Heat";
    comfortColor = "text-orange-400";
  } else {
    comfortLevel = "Extreme Heat Caution";
    comfortColor = "text-rose-400";
  }

  let weatherTrend = "Normal Atmosphere";
  if (pressureHpa < 1005) {
    weatherTrend = "Low Pressure (Rain/Storm likely)";
  } else if (pressureHpa > 1018) {
    weatherTrend = "High Pressure (Clear, dry weather)";
  }

  return {
    feelsLike,
    comfortLevel,
    comfortColor,
    dewPoint,
    moldRiskScore: mold.score,
    moldRiskLevel: mold.level,
    moldRiskColor: mold.color,
    moldRecommendation: mold.recommendation,
    weatherTrend,
  };
}

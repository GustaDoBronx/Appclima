import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type WeatherDescription = {
  label: string;
  Icon: LucideIcon;
};

const byCode: Record<number, { label: string; Icon: LucideIcon }> = {
  0: { label: "Céu limpo", Icon: Sun },
  1: { label: "Predominantemente limpo", Icon: CloudSun },
  2: { label: "Parcialmente nublado", Icon: CloudSun },
  3: { label: "Nublado", Icon: Cloudy },
  45: { label: "Nevoeiro", Icon: CloudFog },
  48: { label: "Nevoeiro com geada", Icon: CloudFog },
  51: { label: "Garoa leve", Icon: CloudDrizzle },
  53: { label: "Garoa", Icon: CloudDrizzle },
  55: { label: "Garoa forte", Icon: CloudDrizzle },
  56: { label: "Garoa congelante", Icon: CloudDrizzle },
  57: { label: "Garoa congelante forte", Icon: CloudDrizzle },
  61: { label: "Chuva fraca", Icon: CloudRain },
  63: { label: "Chuva", Icon: CloudRain },
  65: { label: "Chuva forte", Icon: CloudRain },
  66: { label: "Chuva congelante", Icon: CloudRain },
  67: { label: "Chuva congelante forte", Icon: CloudRain },
  71: { label: "Neve fraca", Icon: CloudSnow },
  73: { label: "Neve", Icon: CloudSnow },
  75: { label: "Neve forte", Icon: CloudSnow },
  77: { label: "Grãos de neve", Icon: CloudSnow },
  80: { label: "Pancadas de chuva", Icon: CloudRain },
  81: { label: "Pancadas de chuva", Icon: CloudRain },
  82: { label: "Pancadas de chuva forte", Icon: CloudRain },
  85: { label: "Pancadas de neve", Icon: CloudSnow },
  86: { label: "Pancadas de neve forte", Icon: CloudSnow },
  95: { label: "Tempestade", Icon: CloudLightning },
  96: { label: "Tempestade com granizo", Icon: CloudHail },
  99: { label: "Tempestade com granizo forte", Icon: CloudHail },
};

export function describeWeather(code: number, isDay = true): WeatherDescription {
  const base = byCode[code] ?? { label: "Indisponível", Icon: Cloud };
  if (code <= 2 && !isDay) {
    return { label: base.label, Icon: code === 0 ? Moon : CloudMoon };
  }
  return base;
}

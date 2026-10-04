import { createServerFn } from "@tanstack/react-start";

export type Place = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string | undefined;
  admin1?: string | undefined;
};

export type WeatherData = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability_max: number[];
  };
};

export const searchCities = createServerFn({ method: "GET" })
  .inputValidator((name: string) => name)
  .handler(async ({ data }): Promise<Place[]> => {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", data);
    url.searchParams.set("count", "6");
    url.searchParams.set("language", "pt");
    url.searchParams.set("format", "json");

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      results?: { name: string; latitude: number; longitude: number; country?: string; admin1?: string }[];
    };
    return (json.results ?? []).map((r) => ({
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
    }));
  });

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((input: { latitude: number; longitude: number }) => input)
  .handler(async ({ data }): Promise<WeatherData | null> => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(data.latitude));
    url.searchParams.set("longitude", String(data.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
    );
    url.searchParams.set("hourly", "temperature_2m,weather_code,is_day,precipitation_probability");
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return (await res.json()) as WeatherData;
  });

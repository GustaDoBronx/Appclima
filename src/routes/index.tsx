import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  CloudRain,
  Droplets,
  Loader2,
  MapPin,
  Search,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import { getWeather, searchCities, type Place, type WeatherData } from "@/lib/weather-fns";
import { describeWeather } from "@/lib/weather-code";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clima — Previsão do Tempo" },
      {
        name: "description",
        content:
          "Consulte a previsão do tempo de qualquer cidade: temperatura atual, previsão por hora e para os próximos 7 dias.",
      },
      { property: "og:title", content: "Clima — Previsão do Tempo" },
      {
        property: "og:description",
        content: "Temperatura atual, previsão por hora e dos próximos 7 dias em qualquer cidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DEFAULT_PLACE: Place = {
  name: "São Paulo",
  latitude: -23.5505,
  longitude: -46.6333,
  country: "Brasil",
  admin1: "São Paulo",
};

function formatHour(time: string): string {
  const hour = time.slice(11, 16);
  return hour.replace(":", "h");
}

function formatDay(time: string, index: number): string {
  if (index === 0) return "Hoje";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(new Date(time + "T12:00:00"))
    .replace(".", "");
}

function placeLabel(place: Place): string {
  return [place.name, place.admin1, place.country].filter(Boolean).join(" · ");
}

function Index() {
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const suggestions = useQuery({
    queryKey: ["cities", debounced],
    queryFn: () => searchCities({ data: debounced }),
    enabled: debounced.length >= 2,
    staleTime: 5 * 60_000,
  });

  const weather = useQuery({
    queryKey: ["weather", place.latitude, place.longitude],
    queryFn: () => getWeather({ data: { latitude: place.latitude, longitude: place.longitude } }),
    staleTime: 5 * 60_000,
  });

  const data = weather.data ?? null;

  const currentDesc = useMemo(() => {
    if (!data) return null;
    return describeWeather(data.current.weather_code, data.current.is_day === 1);
  }, [data]);

  const hourly = useMemo(() => {
    if (!data) return [];
    const start = data.hourly.time.findIndex((t) => t >= data.current.time);
    const from = start === -1 ? 0 : start;
    return data.hourly.time.slice(from, from + 24).map((time, i) => ({
      time,
      temperature: Math.round(data.hourly.temperature_2m[from + i] ?? 0),
      code: data.hourly.weather_code[from + i] ?? 0,
      isDay: (data.hourly.is_day[from + i] ?? 0) === 1,
      precip: data.hourly.precipitation_probability?.[from + i] ?? 0,
    }));
  }, [data]);

  const daily = useMemo(() => {
    if (!data) return [];
    return data.daily.time.map((time, i) => ({
      time,
      code: data.daily.weather_code[i] ?? 0,
      max: Math.round(data.daily.temperature_2m_max[i] ?? 0),
      min: Math.round(data.daily.temperature_2m_min[i] ?? 0),
      precip: data.daily.precipitation_probability_max?.[i] ?? 0,
    }));
  }, [data]);

  const pickPlace = (p: Place) => {
    setPlace(p);
    setInput("");
    setDebounced("");
    setOpen(false);
  };

  const options = suggestions.data ?? [];

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 sm:mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Clima</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Previsão do tempo, hora a hora, em qualquer lugar.
          </p>
        </header>

        <div className="relative mb-8 sm:mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const first = options[0];
              if (first) pickPlace(first);
            }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Buscar cidade..."
              aria-label="Buscar cidade"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>

          {open && debounced.length >= 2 && (
            <div className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
              {suggestions.isLoading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Buscando...
                </div>
              )}
              {!suggestions.isLoading && options.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">Nenhuma cidade encontrada.</div>
              )}
              {options.map((p) => (
                <button
                  key={`${p.latitude},${p.longitude}`}
                  type="button"
                  onMouseDown={() => pickPlace(p)}
                  className="block w-full px-4 py-3 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.admin1 || p.country ? ` — ${[p.admin1, p.country].filter(Boolean).join(", ")}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {weather.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Carregando previsão...
          </div>
        )}

        {weather.isError && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Não foi possível carregar a previsão. Tente novamente em instantes.
          </div>
        )}

        {data && currentDesc && (
          <>
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{placeLabel(place)}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                <currentDesc.Icon className="size-16 shrink-0 text-accent sm:size-20" aria-hidden />
                <div className="min-w-0">
                  <p className="font-display text-6xl font-bold leading-none sm:text-7xl">
                    {Math.round(data.current.temperature_2m)}°
                  </p>
                  <p className="mt-2 text-base font-medium">{currentDesc.label}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Detail icon={<Thermometer className="size-4" />} label="Sensação" value={`${Math.round(data.current.apparent_temperature)}°`} />
                <Detail icon={<Droplets className="size-4" />} label="Umidade" value={`${data.current.relative_humidity_2m}%`} />
                <Detail icon={<Wind className="size-4" />} label="Vento" value={`${Math.round(data.current.wind_speed_10m)} km/h`} />
                <Detail
                  icon={<CloudRain className="size-4" />}
                  label="Chuva"
                  value={`${daily[0]?.precip ?? 0}%`}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Sunrise className="size-4 text-accent" aria-hidden />
                  Nascer: {data.daily.sunrise[0]?.slice(11, 16)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sunset className="size-4 text-accent" aria-hidden />
                  Pôr do sol: {data.daily.sunset[0]?.slice(11, 16)}
                </span>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Próximas 24 horas
              </h2>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                {hourly.map((h) => {
                  const desc = describeWeather(h.code, h.isDay);
                  return (
                    <div
                      key={h.time}
                      className="flex w-20 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4"
                    >
                      <span className="text-xs text-muted-foreground">{formatHour(h.time)}</span>
                      <desc.Icon className="size-6 text-accent" aria-hidden />
                      <span className="font-display text-lg font-semibold">{h.temperature}°</span>
                      {h.precip > 0 && (
                        <span className="text-[11px] text-muted-foreground">{h.precip}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Próximos 7 dias
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {daily.map((d, i) => {
                  const desc = describeWeather(d.code, true);
                  return (
                    <div
                      key={d.time}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:gap-4 sm:px-5"
                    >
                      <span className="min-w-0 truncate text-sm font-medium">{formatDay(d.time, i)}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {d.precip > 0 && (
                          <>
                            <CloudRain className="size-4" aria-hidden />
                            {d.precip}%
                          </>
                        )}
                      </span>
                      <desc.Icon className="size-5 shrink-0 text-accent" aria-hidden />
                      <span className="w-16 text-right text-sm tabular-nums">
                        <span className="font-semibold">{d.max}°</span>
                        <span className="text-muted-foreground"> / {d.min}°</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <footer className="mt-12 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Dados abertos da API Open-Meteo
        </footer>
      </div>
    </main>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 px-3 py-3">
      <span className="shrink-0 text-accent">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

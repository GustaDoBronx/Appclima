- Weather data comes from the free Open-Meteo API, fetched inside `createServerFn` handlers in `src/lib/weather-fns.ts` (no API key, works on the Edge worker runtime) — why: keeps browser/API calls centralized server-side.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history  force pushing, or rebasing/amending/squashing commits
> that are already pushed as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

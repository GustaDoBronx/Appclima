# Clima — Previsão do Tempo

App de clima responsivo com fundo preto fixo, feito com TanStack Start (React 19) e Tailwind CSS.
Os dados vêm da API gratuita [Open-Meteo](https://open-meteo.com) — sem chave de API.

## Rodar no Visual Studio Code

1. Abra a pasta do projeto no VS Code (`Arquivo → Abrir Pasta`).
2. Abra o terminal integrado (`Terminal → Novo Terminal`) e instale as dependências:

```sh
npm install
```

3. Inicie o servidor de desenvolvimento:

```sh
npm run dev
```

4. Abra `http://localhost:8080` no navegador.

Você precisa ter o [Node.js 20+](https://nodejs.org) instalado (ou use `nvm install 20`).

## Comandos úteis

| Comando           | O que faz                       |
| ----------------- | ------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento     |
| `npm run build`   | Build de produção               |
| `npm run preview` | Visualiza o build de produção   |
| `npm run lint`    | Verifica erros com ESLint       |
| `npm run format`  | Formata o código com Prettier   |
| `npm run test`    | Roda os testes (Vitest)         |

## Estrutura principal

- `src/routes/index.tsx` — interface completa: clima atual, busca de cidades, previsão por hora (24h) e de 7 dias.
- `src/routes/__root.tsx` — layout raiz, fontes e metadados.
- `src/lib/weather-fns.ts` — chamadas à API Open-Meteo no servidor (busca de cidades e previsão).
- `src/lib/weather-code.ts` — descrições e ícones dos códigos de clima.
- `src/styles.css` — tema: fundo preto fixo (#000), acento azul-céu, fontes Space Grotesk + DM Sans.

## Stack

- TanStack Start v1 (React 19, Vite 7)
- TypeScript
- Tailwind CSS v4
- Open-Meteo (dados abertos, sem chave)

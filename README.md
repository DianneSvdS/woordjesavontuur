# Woordjesavontuur

React/Vite PWA om Nederlandse woorden te oefenen.

## Publiceren op GitHub Pages

1. Maak een GitHub-repository met de naam `woordjesavontuur`.
2. Upload alle bestanden en mappen uit dit project naar de hoofdmap van de repository.
3. Controleer in `vite.config.js` dat `base` gelijk is aan `/woordjesavontuur/`.
4. Ga in GitHub naar **Settings > Pages**.
5. Kies bij **Source** voor **GitHub Actions**.
6. Open het tabblad **Actions** en controleer of de workflow groen wordt.
7. De URL staat daarna bij **Settings > Pages**.

Als de repository anders heet, pas dan `base` in `vite.config.js` aan naar `/<repositorynaam>/`.

## Lokaal testen

```bash
npm install
npm run dev
```

## Installeren op een telefoon

Open de gepubliceerde website. Gebruik op iPhone Safari: **Delen > Zet op beginscherm**. Android/Chrome kan de installatieknop in de app of **Toevoegen aan startscherm** tonen.

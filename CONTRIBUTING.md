# Bidra till projektet

Tack för ditt intresse! Här är hur du kan bidra.

## Rapportera buggar eller föreslå förbättringar

Öppna ett [issue](https://github.com/ulfboge/miljogifter-500/issues) och beskriv:

- Vad du försökte göra
- Vad som hände
- Vad du förväntade dig

## Bidra med kod

1. Forka repot
2. Skapa en branch: `git checkout -b feature/mitt-tillägg`
3. Gör dina ändringar
4. Committa: `git commit -m "Lägg till: kort beskrivning"`
5. Pusha: `git push origin feature/mitt-tillägg`
6. Öppna en Pull Request mot `main`

## Bidra med data

Om du har tillgång till officiell provtagningsdata från t.ex. SMHI, VISS eller HaV och vill bidra:

- Se till att data är offentlig och fritt licensierad
- Följ det befintliga GeoJSON-schemat i `data/sjoar.geojson`
- Beskriv källan i Pull Requesten

## Kodstil

- Vanilla JS utan byggsteg — håll det enkelt
- Kommentarer på svenska eller engelska
- Testa att `index.html` fungerar direkt i webbläsaren via lokal server

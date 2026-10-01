# Giochi

Ogni file `.html` messo nella cartella `pages/` compare automaticamente nella home del sito, con thumbnail e link.

## Setup (una volta sola)
1. Crea un repo **pubblico** su GitHub e carica il contenuto di questa cartella (anche con *Add file → Upload files*).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Dopo il primo deploy (tab *Actions*, 1-2 minuti) il sito è su `https://TUOUTENTE.github.io/NOMEREPO/`.

## Uso quotidiano
- Aggiungi o sostituisci un HTML in `pages/` → il sito si aggiorna da solo.
- Per rimuoverlo, cancellalo da `pages/`.
- Se la pagina usa altri file (immagini, JS), mettili in `pages/` accanto all'HTML.

## Personalizzare
In cima a `build.mjs`: titolo della home (`SITE_TITLE`) e attesa prima dello screenshot (`WAIT_MS`). Il titolo di ogni card è il `<title>` dell'HTML.

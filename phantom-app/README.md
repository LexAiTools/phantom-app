# Phantom

Komunikator P2P z szyfrowaniem end-to-end działający przez sieć Tor.

**Bez serwerów. Bez kont. Bez metadanych.**

## Jak to działa

Każde urządzenie działa jednocześnie jako klient i serwer (Tor Hidden Service).
Wiadomości szyfrowane są protokołem Signal i przesyłane przez 3 węzły sieci Tor.
Żaden węzeł nie zna jednocześnie nadawcy, odbiorcy i treści.

```
Telefon A (.onion) → Tor węzeł 1 → Tor węzeł 2 → Tor węzeł 3 → Telefon B (.onion)
```

## Funkcje

- Szyfrowanie E2E (Signal Protocol + Double Ratchet)
- Anonimizacja sieci (Tor Hidden Service)
- Kontakty przez QR kod (bez numerów telefonu)
- Grupy z zarządzaniem widocznością (ukryta / prywatna / publiczna)
- Prywatne kanały 1:1 z poziomu grupy
- Wiadomości efemeryczne (TTL od 30s do 24h)
- Zdjęcia z automatycznym usunięciem EXIF (GPS, model telefonu, data)
- Weryfikacja klucza (fingerprint / safety numbers)
- Status węzłów Tor z możliwością zmiany obwodu

## Status projektu

Aktualnie: prototyp UI (React, web).
W trakcie: migracja do React Native, integracja Tor i Signal Protocol.

## Strona projektu

https://illustrious-alfajores-8c81a8.netlify.app

## Licencja

MIT

# Architektura Phantom

## Warstwy systemu

```
┌─────────────────────────────────────┐
│           UI (React Native)          │  src/App.jsx i komponenty
├─────────────────────────────────────┤
│        Signal Protocol (E2E)         │  libsignal — szyfrowanie wiadomości
├─────────────────────────────────────┤
│         DHT / P2P Discovery          │  Kademlia — odkrywanie węzłów
├─────────────────────────────────────┤
│         Tor Hidden Service           │  tor-android / Tor.framework
├─────────────────────────────────────┤
│              Internet                │
└─────────────────────────────────────┘
```

## Przepływ wiadomości

```
Nadawca pisze wiadomość
  → Signal Protocol szyfruje (klucz publiczny odbiorcy)
  → Tor SOCKS5 proxy (:9050) kieruje ruch
  → Węzeł wejściowy Tor (zna IP nadawcy, nie zna odbiorcy)
  → Węzeł środkowy Tor (nie zna ani nadawcy ani odbiorcy)
  → Węzeł wyjściowy Tor (zna adres .onion odbiorcy, nie zna nadawcy)
  → Hidden Service odbiorcy (.onion)
  → Signal Protocol odszyfrowuje
  → Odbiorca czyta wiadomość
```

## Grupy

Grupy nie mają centralnego serwera. Każdy uczestnik przechowuje:
- Klucz grupowy (AES-256, rotowany przy każdym usunięciu członka)
- Log operacji (CRDT — append-only, deterministyczne scalanie konfliktów)
- Listę członków z ich adresami .onion i kluczami publicznymi

## Widoczność grup

- **HIDDEN** — adres grupy nie jest publikowany w DHT. Dołączyć można tylko przez bezpośrednie zaproszenie.
- **PRIVATE** — istnienie grupy widoczne w DHT, treść i członkowie zaszyfrowane.
- **PUBLIC** — każdy węzeł może znaleźć grupę i poprosić o dołączenie.

## Bezpieczeństwo zdjęć

Przed wysyłką każde zdjęcie przechodzi przez pipeline:
1. Strip EXIF (GPS, model telefonu, data wykonania, miniatura)
2. Re-kompresja JPEG (85% jakość) — usuwa artefakty identyfikujące sensor
3. Szyfrowanie Signal Protocol
4. Wysyłka przez Tor

## Forward Secrecy

Double Ratchet Algorithm generuje nowy klucz sesji co kilka wiadomości.
Zdobycie klucza prywatnego w przyszłości nie pozwala odszyfrować starych wiadomości.

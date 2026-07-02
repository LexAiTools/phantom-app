# PHANTOM — Instrukcja Projektu

> Plik startowy dla nowych rozmów z Claude i sesji Claude Code.
> Wklej go w całości na początku nowej rozmowy — daje Claude pełny kontekst projektu.
> Aktualizuj po każdej istotnej zmianie w projekcie.

---

## Czym jest Phantom

Phantom to komunikator mobilny peer-to-peer z szyfrowaniem end-to-end,
działający przez sieć Tor. Projekt jest w 100% open source.

Główne założenia — niezmienne, nie podlegają negocjacji:
- Zero serwerów — połączenia bezpośrednio między urządzeniami przez Tor
- Zero kont — tożsamość to klucz kryptograficzny wygenerowany lokalnie
- Zero metadanych — sieć Tor ukrywa kto z kim rozmawia
- Zero śledzenia — brak telemetrii, brak reklam, brak analizy zachowań
- Zero opłat — zawsze bezpłatny, bez planów premium
- Zero inwestorów — finansowany wyłącznie z dobrowolnych darowizn kryptowalutowych

Projekt inspirowany: Signal (protokół szyfrowania), Briar (architektura P2P przez Tor),
Cwtch (grupy P2P przez Tor), Session (brak numeru telefonu).

---

## Filozofia projektu — ważne dla każdej rozmowy

Phantom to projekt ideowy, nie komercyjny. Każda decyzja techniczna,
marketingowa i finansowa musi być zgodna z tymi zasadami:

1. Prywatność użytkownika jest nadrzędna wobec wygody
2. Kod źródłowy jest zawsze publiczny — żadnych closed-source komponentów.
   Użycie komercyjne wymaga osobnej licencji (patrz COMMERCIAL-LICENSE.md),
   ale kod pozostaje w 100% jawny i dostępny do wglądu/modyfikacji.
3. Finansowanie wyłącznie przez darowizny — żadnych VC, żadnych reklam
4. Transparentność wydatków — każda wydana kwota dokumentowana publicznie
5. Społeczność jest właścicielem projektu — nie ma korporacyjnego właściciela

Jeśli jakaś propozycja narusza którąkolwiek z tych zasad — należy to wyraźnie zaznaczyć.

---

## Status projektu (aktualny)

| Warstwa | Status |
|---------|--------|
| UI prototyp (React web) | Zaimplementowany |
| Strona www (phantom-site) | Live na Netlify |
| Dokumentacja HTML (docs/) | Zaimplementowana |
| Smart kontrakt donacyjny (Solidity) | Napisany, do deployu |
| README + GitBook-style docs | Przygotowane |
| React Native (mobile) | Do migracji |
| Signal Protocol (E2E) | Do integracji |
| Tor Android/iOS | Do integracji |
| DHT / P2P Discovery | Do implementacji |

---

## Repozytoria GitHub

| Repo | URL | Cel |
|------|-----|-----|
| phantom-app | github.com/LexAiTools/phantom-app | Kod aplikacji mobilnej |
| phantom-site | github.com/LexAiTools/phantom-site | Strona docelowa |

Strona live: https://illustrious-alfajores-8c81a8.netlify.app
Dokumentacja: podstrony w folderze /docs/ na stronie

---

## Architektura systemu

### Przepływ wiadomości

```
Telefon A                        Sieć Tor                       Telefon B
[Piszesz wiadomość]
[Signal Protocol szyfruje]
[Tor SOCKS5 :9050]     →→  [Węzeł 1]→[Węzeł 2]→[Węzeł 3]  →→  [Hidden Service .onion]
                                                                  [Signal Protocol odszyfrowuje]
                                                                  [Czytasz wiadomość]
```

### Warstwy ochrony

```
Warstwa 1: Signal Protocol    → chroni TREŚĆ wiadomości
Warstwa 2: Tor Hidden Service → chroni METADANE (kto z kim)
Warstwa 3: Separacja urządzeń → chroni przed Pegasusem i podobnymi
Warstwa 4: VPN na routerze    → ukrywa sam fakt używania Tor przed ISP
Razem:                        → nikt nie wie ani co, ani kto, ani że Tor
```

### Konfiguracja sprzętowa (zalecana dla użytkowników wysokiego ryzyka)

```
[Telefon bez SIM]     [Router mobilny + SIM prepaid + VPN]
  tylko Phantom    →     WiFi     →   WireGuard VPN   →   Sieć Tor   →   .onion
  bez innych apek      hotspot        (np. Mullvad)       3 węzły        odbiorca
```

---

## Struktura projektu phantom-app

```
phantom-app/
├── CLAUDE.md                  ← instrukcja dla Claude Code (czytana automatycznie)
├── README.md                  ← dokumentacja publiczna dwujęzyczna PL/EN
├── ROADMAP.md                 ← plan rozwoju projektu
├── package.json               ← React + Vite
├── src/
│   ├── App.jsx                ← GŁÓWNY PLIK UI (2000+ linii)
│   ├── main.jsx               ← entry point React
│   ├── components/
│   └── screens/
├── contracts/
│   └── P2PDonations.sol       ← smart kontrakt donacyjny (Ethereum)
├── scripts/
│   └── deploy.js              ← deploy + weryfikacja Etherscan
├── test/
│   └── P2PDonations.test.js   ← testy jednostkowe kontraktu
├── docs/                      ← dokumentacja HTML (styl GitBook)
│   ├── style.css
│   ├── index.html
│   ├── manifesto.html
│   ├── security-model.html
│   ├── device-separation.html ← separacja urządzeń + VPN na routerze
│   ├── funding.html
│   ├── roadmap.html
│   └── ... (19 plików łącznie)
├── android/
└── ios/
```

---

## Komponenty UI (App.jsx)

```
Boot                  — animacja startowa (handshake Tor, 5 kroków)
TorDot                — kropka statusu sieci Tor (zielona/żółta/czerwona)
QRModal               — modal z adresem .onion użytkownika do skanowania
AddContactModal       — dodawanie kontaktu przez adres .onion
PrivateModal          — potwierdzenie otwarcia prywatnego kanału
PhotoPreviewModal     — podgląd zdjęcia przed wysyłką (strip EXIF + szyfrowanie)
E2EModal              — fingerprint klucza, weryfikacja tożsamości
TorModal              — status węzłów Tor, circuit ID, nowy obwód
ChatPanel             — panel czatu (wiadomości, input, TTL, aparat)
CreateGroupModal      — tworzenie grupy (3 kroki)
EditGroupModal        — edycja grupy (tylko założyciel)
Sidebar               — lewy panel (full 250px / mini 52px)
InfoPanel             — prawy panel (szczegóły kontaktu/grupy)
BottomNav             — dolna nawigacja mobile (5 ikon)
App                   — główny komponent, stan całej aplikacji
```

---

## Smart kontrakt donacyjny (P2PDonations.sol)

Napisany, zweryfikowany, gotowy do deployu na Ethereum Mainnet.

Funkcje:
- `donateETH(message)` — wpłata ETH z opcjonalną wiadomością on-chain
- `donateToken(token, amount, message)` — wpłata USDC lub DAI
- `receive()` — przyjmuje ETH bezpośrednio z portfela
- `withdrawETH / withdrawToken` — wypłata tylko przez właściciela
- `transferOwnership` — przekazanie kontroli na multisig (Safe)

Zaakceptowane tokeny (mainnet):
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`

Deploy: `npx hardhat run scripts/deploy.js --network mainnet`
Najpierw przetestuj na Sepolia.
Po deployu: zaktualizuj adres kontraktu w docs/funding.html i README.md.

---

## Fundraising i marketing — strategia

### Zasada nadrzędna
Phantom nie szuka inwestorów. Phantom nie będzie miał reklam.
Jedyne źródło finansowania: dobrowolne darowizny kryptowalutowe od społeczności.
To jest część tożsamości projektu, nie tylko decyzja ekonomiczna.

### Kanały donacyjne

| Metoda | Adres | Status |
|--------|-------|--------|
| ETH / USDC / DAI | Smart kontrakt (do deployu) | Przygotowany |
| BTC | Adres do uzupełnienia | Do skonfigurowania |
| Gitcoin Grants | Aplikacja przy następnej rundzie | Planowane |
| Drips (drips.network) | Streaming dotacji | Planowane |

### Grupy docelowe dla fundraisingu

1. Społeczność cypherpunk / privacy — Reddit r/privacy, r/privacyguides, Tor forums
2. Społeczność Web3 — Twitter/X krypto, Nostr, Farcaster
3. Dziennikarze śledczy i NGO — organizacje ochrony wolności słowa
4. Deweloperzy open source — GitHub Sponsors, Gitcoin
5. Użytkownicy Tor Browser — komunikacja przez kanały Tor Project

### Platformy obecności

| Platforma | Cel | Status |
|-----------|-----|--------|
| GitHub (phantom-app, phantom-site) | Kod + dokumentacja | Aktywny |
| Twitter/X | Techniczne aktualizacje, społeczność | Do założenia |
| Nostr | Społeczność prywatności, BTC/Lightning | Do założenia |
| Reddit r/privacy | Widoczność, dyskusje | Do aktywacji |
| Gitcoin | Granty od społeczności Web3 | Planowane |

### Transparentność wydatków

Wszystkie wydatki dokumentowane publicznie w docs/fund-usage.html.
Planowane kategorie:
- Audyt bezpieczeństwa (niezależny badacz): ~$5,000–15,000
- Development iOS/Android: ciągły
- Bug bounty program: zmienny
- Infrastruktura testowa: ~$100/miesiąc

---

## Design System

```
Tło główne:      #0A0A0F  (głęboka czerń)
Powierzchnia:    #12121A
Powierzchnia hi: #1A1A26
Krawędź:         #1E1E2E
Akcent główny:   #00FF87  (fosforyzująca zieleń) — E2E, TOR, kontakty
Akcent prywatny: #9B6DFF  (fiolet) — prywatne kanały, grupy ukryte
Ostrzeżenie:     #FFB800  (żółty) — niezweryfikowane klucze, TTL
Błąd:            #FF4466  (czerwony)
Tekst główny:    #C8C8D0
Tekst dim:       #6C6C7E
Font:            JetBrains Mono (monospace — celowy wybór estetyczny)
```

Filozofia dizajnu: terminal/kryptografia. Zero dekoracji, tylko funkcja.
Nie zmieniać kolorów ani fontu bez wyraźnej decyzji.
Nie używać emoji ani dekoracyjnych ikon w kodzie UI bez zgody.

---

## Backlog

### Priorytet wysoki
- [ ] Deploy smart kontraktu na Ethereum Mainnet + weryfikacja Etherscan
- [ ] Aktualizacja adresu kontraktu w docs/ i README.md
- [ ] Migracja UI z React (web) na React Native (mobile)
- [ ] Integracja tor-android — Tor wewnątrz aplikacji Android
- [ ] Integracja libsignal — rzeczywiste szyfrowanie E2E
- [ ] Generowanie kluczy przy pierwszym uruchomieniu
- [ ] Ekran onboardingu

### Priorytet średni
- [ ] Konto na X/Twitter i Nostr — pierwsze posty z demo
- [ ] Aplikacja do Gitcoin Grants
- [ ] Implementacja DHT — odkrywanie węzłów P2P
- [ ] Implementacja CRDT — synchronizacja grup
- [ ] Strip EXIF (natywny kod Android/iOS)
- [ ] Kolejkowanie wiadomości offline
- [ ] Powiadomienia push bez metadanych
- [ ] Uzupełnienie placeholder pages w docs/

### Priorytet niższy
- [ ] Ekran ustawień użytkownika
- [ ] Widok sieci (mapa węzłów DHT)
- [ ] Obsługa wiadomości głosowych
- [ ] Strona /verify.html z SHA-256 każdego .apk
- [ ] Przewodnik konfiguracji VPN + separacji urządzeń (GL.iNet Mudi)

---

## Jak zacząć nową rozmowę

Wklej na początku rozmowy:

```
Pracuję nad projektem Phantom — open source komunikator P2P przez Tor,
finansowany wyłącznie z darowizn kryptowalutowych.

Kontekst projektu: [wklej PHANTOM_PROJECT.md]
Wiedza techniczna: [wklej PHANTOM_KNOWLEDGE.md jeśli potrzebne]

Dzisiaj chcę: [opisz konkretne zadanie]
```

W Claude Code: plik CLAUDE.md w repozytorium jest czytany automatycznie.

---

## Linki

- Repo aplikacji: https://github.com/LexAiTools/phantom-app
- Repo strony: https://github.com/LexAiTools/phantom-site
- Strona live: https://illustrious-alfajores-8c81a8.netlify.app
- Inspiracje: Signal, Briar, Cwtch, Session
- Biblioteki do integracji: tor-android, libsignal, libp2p
- VPN zalecany (router): Mullvad (płatność gotówką, no-logs, WireGuard)
- Sprzęt zalecany: GL.iNet Mudi (GL-E750), Google Pixel 6a + GrapheneOS

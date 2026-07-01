# Phantom App — instrukcja dla Claude Code

## Co to jest
Phantom to komunikator mobilny P2P z szyfrowaniem end-to-end działający przez sieć Tor.
Bez serwerów, bez kont, bez metadanych. Użytkownicy łączą się bezpośrednio przez adresy .onion.

## Powiązane repozytoria
- Aplikacja (ten repo): github.com/LexAiTools/phantom-app
- Strona docelowa: github.com/LexAiTools/phantom-site → illustrious-alfajores-8c81a8.netlify.app

## Struktura projektu
```
phantom-app/
├── CLAUDE.md                  ← ten plik
├── README.md                  ← dokumentacja projektu
├── package.json               ← zależności React Native
├── src/
│   ├── App.jsx                ← GŁÓWNY PLIK — cały UI aplikacji (2000+ linii)
│   ├── components/            ← komponenty do wydzielenia z App.jsx
│   └── screens/               ← ekrany do wydzielenia z App.jsx
├── android/                   ← kod natywny Android
├── ios/                       ← kod natywny iOS
└── docs/                      ← dokumentacja architektury
```

## Główny plik: src/App.jsx
Zawiera WSZYSTKIE komponenty UI w jednym pliku. Przy rozbudowie należy wydzielać
komponenty do osobnych plików w src/components/ i src/screens/.

### Komponenty w App.jsx (kolejność w pliku)
- `Boot` — animacja startowa (handshake Tor)
- `TorDot` — status sieci Tor
- `QRModal` — modal z adresem .onion użytkownika
- `AddContactModal` — dodawanie kontaktu (3 kroki: formularz → weryfikacja → gotowe)
- `PrivateModal` — potwierdzenie prywatnego kanału z członka grupy
- `PhotoPreviewModal` — podgląd zdjęcia przed wysyłką (strip EXIF + szyfrowanie)
- `PhotoMsg` — wiadomość ze zdjęciem (miniatura + fullscreen)
- `E2EModal` — status szyfrowania, fingerprint klucza, weryfikacja
- `TorModal` — status węzłów Tor, circuit ID, nowy obwód
- `Nick` — klikalny nick w wiadomości grupowej (otwiera prywatny czat)
- `Msg` — pojedyncza wiadomość (tekstowa lub zdjęcie, zwykła lub efemeryczna)
- `ChatPanel` — panel czatu (input, TTL, wysyłanie, wiadomości)
- `RadioOpt` — opcja radio do formularzy ustawień
- `CreateGroupModal` — tworzenie grupy (3 kroki: nazwa → ustawienia → członkowie)
- `EditGroupModal` — edycja ustawień grupy (tylko dla założyciela)
- `Sidebar` — lewy panel (tryb full 250px lub mini 52px)
- `InfoPanel` — prawy panel (szczegóły kontaktu lub członkowie grupy)
- `MemberBtn` — przycisk członka grupy (klikalny → prywatny czat)
- `BottomNav` — dolna nawigacja mobilna
- `InfoDrawer` — drawer od dołu na mobile (szczegóły kontaktu/grupy)
- `App` — główny komponent, zarządza całym stanem

## Architektura docelowa (P2P przez Tor)
```
Telefon A                    Sieć Tor                    Telefon B
[Tor Hidden Service]  →  [3 węzły relay]  →  [Tor Hidden Service]
[Signal Protocol E2E]                         [Signal Protocol E2E]
```

### Kluczowe mechanizmy do zaimplementowania
1. **Tor Hidden Service** — każde urządzenie ma adres .onion (biblioteka: tor-android / Tor.framework)
2. **Signal Protocol** — szyfrowanie E2E (biblioteka: libsignal)
3. **DHT (Kademlia)** — odkrywanie węzłów w sieci P2P
4. **CRDT** — synchronizacja stanu grup bez konfliktu (append-only log operacji)
5. **Strip EXIF** — usuwanie metadanych ze zdjęć przed wysyłką

## Stack technologiczny
- **UI**: React Native (src/App.jsx to prototyp React — docelowo React Native)
- **Szyfrowanie**: Signal Protocol (libsignal)
- **Sieć**: Tor (tor-android na Android, Tor.framework na iOS)
- **P2P**: libp2p lub własna implementacja Kademlia DHT
- **Baza lokalna**: SQLCipher (szyfrowana)

## Dane demo (w src/App.jsx)
Wszystkie dane są hardcoded jako stałe na górze pliku:
- `ALL_MEMBERS` — słownik wszystkich znanych użytkowników
- `INIT_CONTACTS` — lista początkowych kontaktów
- `INIT_GROUPS` — lista początkowych grup (z ustawieniami widoczności)
- `MSGS` — wiadomości demo per kontakt/grupa

## Styl i design
- Tło: #0A0A0F (głęboka czerń)
- Akcent: #00FF87 (fosforyzująca zieleń)
- Fiolet: #9B6DFF (prywatne kanały)
- Font: JetBrains Mono (monospace — celowy wybór estetyczny)
- Filozofia: terminal/kryptografia, zero dekoracji, tylko funkcja

## Zasady pracy
- Commit message po polsku, krótko i konkretnie
- Po każdej zmianie: git add . && git commit && git push
- Nie zmieniaj kolorów ani fontu bez wyraźnej prośby
- Przy wydzielaniu komponentów zachowaj wszystkie obecne funkcje
- Nowe funkcje najpierw prototypuj w App.jsx, potem wydzielaj

## Do zrobienia (backlog)
- [ ] Migracja z React (web) na React Native (mobile)
- [ ] Integracja z biblioteką tor-android / Tor.framework
- [ ] Implementacja Signal Protocol (libsignal)
- [ ] Implementacja DHT do odkrywania węzłów
- [ ] Implementacja CRDT dla synchronizacji grup
- [ ] Strip EXIF przy wysyłaniu zdjęć (natywny kod)
- [ ] Ekran weryfikacji klucza (safety numbers)
- [ ] Powiadomienia push (bez metadanych)
- [ ] Obsługa wiadomości offline (kolejkowanie)
- [ ] Ekran ustawień użytkownika
- [ ] Onboarding (pierwszy start, generowanie kluczy)
- [ ] Backup kluczy (opcjonalny, z ostrzeżeniem)

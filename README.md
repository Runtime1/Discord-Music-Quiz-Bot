# Discord Music Quiz Bot

Ein interaktiver Discord-Bot für Musikquizze, der Spaß und Unterhaltung in Ihren Server bringt!

## Funktionen

- Spielt Musikclips ab und lässt Benutzer den Titel oder Künstler erraten
- Unterstützt mehrere Runden mit konfigurierbarer Anzahl
- Punktesystem zur Verfolgung der Spielerleistung
- Leaderboard-Funktion zur Anzeige der Top-Spieler
- Interaktive Befehle und Embed-Nachrichten für ein verbessertes Benutzererlebnis

## Installation

1. Klonen Sie dieses Repository:
   ```
   git clone https://github.com/IhrBenutzername/discord-music-quiz-bot.git
   ```

2. Installieren Sie die erforderlichen Abhängigkeiten:
   ```
   npm install
   ```

3. Erstellen Sie eine `.env`-Datei im Hauptverzeichnis und fügen Sie Ihren Discord Bot-Token hinzu:
   ```
   BOT_TOKEN=IhrBotTokenHier
   ```

4. Stellen Sie sicher, dass FFmpeg auf Ihrem System installiert ist. Der Bot benötigt FFmpeg für die Audioverarbeitung.

## Verwendung

1. Starten Sie den Bot:
   ```
   node music_quiz_bot.js
   ```

2. Laden Sie den Bot auf Ihren Discord-Server ein.

3. Verwenden Sie den Befehl `.start` in einem Textkanal, um ein neues Musikquiz zu beginnen.

4. Verwenden Sie `.guess [Ihre Vermutung]`, um während des Quiz zu raten.

5. Verwenden Sie `.leaderboard`, um die aktuellen Punktestände zu sehen.

6. Verwenden Sie `.help` für eine Liste aller verfügbaren Befehle.

## Fehlerbehebung

Wenn Sie eine Fehlermeldung erhalten, die besagt "FFmpeg/avconv not found!", stellen Sie sicher, dass FFmpeg korrekt auf Ihrem System installiert ist und sich im PATH befindet.

## Beitrag

Beiträge sind willkommen! Bitte erstellen Sie ein Issue oder einen Pull Request für Verbesserungsvorschläge.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe die [LICENSE](LICENSE)-Datei für Details.

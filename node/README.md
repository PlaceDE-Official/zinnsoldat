# Der kopflose Zinnsoldat
Der kopflose Zinnsoldat übernimmt die selben Aufgaben wie der Zinnsoldat, braucht aber keinen offenen Browsertab.

## Benutzung
Es gibt zwei Möglichkeiten, den Zinnsoldaten zu verwenden:

### NodeJS + NPM
Für diese Installationsvariante benötigt man lediglich NodeJS und NPM.

Zuerst muss die `index.js`-Datei mit dem eigenen Account personalisiert werden, danach müssen folgende Kommandos ausgeführt werden:

```sh
npm install

# Einfach starten
node index.js

# Im Hintergrund ausführen
chmod +x ./start.sh
./start.sh
```

### Docker
Hierfür wird Docker + Docker-Compose oder vergleichbares benötigt.

Kopieren Sie zuerst die `.env.example`-Datei in eine `.env`-Datei, und personalisieren Sie diese. Führen Sie danach den folgenden Befehl aus:

```sh
docker compose up # [-d] für einen Hintergrundprozess
```

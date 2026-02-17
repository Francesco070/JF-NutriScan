# Testprotokoll

## Inhaltsverzeichnis

- [Testprotokoll](#testprotokoll)
    - [Testfall 1:Lebensmittel per Barcode scannen](#testfall-1lebensmittel-per-barcode-scannen)
        - [Vorbedingungen](#vorbedingungen)
        - [Vorgehen beim Test](#vorgehen-beim-test)
        - [Erwartetes Resultat](#erwartetes-resultat)
    - [Testfall 2: Profil und Statistiken anzeigen](#testfall-2-profil-und-statistiken-anzeigen)
        - [Vorbedingungen](#vorbedingungen-1)
        - [Vorgehen beim Test](#vorgehen-beim-test-1)
        - [Erwartetes Resultat](#erwartetes-resultat-1)
- [Reflexion](#reflexion)
    - [Originaler Sinn / Vision und Zielgruppe der App:](#originaler-sinn--vision-und-zielgruppe-der-app)
    - [Neuer Sinn / Vision und Zielgruppe der App:](#neuer-sinn--vision-und-zielgruppe-der-app)
- [Vorbereitung zur Veröffentlichung](#vorbereitung-zur-veroffentlichung)
- [Installationsanleitung](#installationsanleitung)

## Testfall 1:Lebensmittel per Barcode scannen

### Vorbedingungen

- App ist installiert und gestartet
- Internetverbindung ist aktiv
- Kamera-Zugriff wurde erlaubt

### Vorgehen beim Test

1. App starten
2. Auf den Button "Barcode scannen" tippen
3. Kamera auf den Barcode eines Lebensmittels richten
4. Warten, bis der Barcode erkannt wird
5. Produktdetails anzeigen lassen
6. Menge in Gramm eingeben
7. Auf "Hinzufügen" tippen

### Erwartetes Resultat

- Das gescannte Produkt wird korrekt erkannt
- Die Nährwertdaten werden angezeigt
- Die Kalorien werden entsprechend der eingegebenen Menge berechnet
- Das Lebensmittel erscheint im Tagesprotokoll

## Testfall 2: Profil und Statistiken anzeigen

### Vorbedingungen

- App ist installiert und gestartet
- Es sind bereits Kaloriendaten gespeichert

### Vorgehen beim Test

1. App starten
2. In der Navigationsleiste auf den Button "Profil" tippen
3. Profilansicht wird geöffnet
4. Statistikbereich in der Profilansicht anzeigen lassen

### Erwartetes Resultat

- Die Profilseite wird korrekt angezeigt
- Die persönlichen Profildaten sind sichtbar
- Die Statistiken (z.B. tägliche Kalorienübersicht) werden korrekt dargestellt
- Die angezeigten Werte entsprechen den gespeicherten Daten

# Reflexion

Zu Beginn des Projekts (SOLL) war geplant, eine klassische Kalorientracking-App zu entwickeln, bei der Nutzer ihre tägliche Kalorienaufnahme erfassen und auswerten können. Während der Umsetzung hat sich jedoch gezeigt, dass der Schwerpunkt auf der reinen Kalorienmenge den tatsächlichen Nutzen im Alltag nur begrenzt abbildet. Deshalb wurde die Vision angepasst: Statt Kalorien zu zählen, bewertet die App nun Lebensmittel anhand des Nutri-Score-Systems. Das Resultat (IST) ist somit eine Anwendung, die nicht die Menge der Nahrung, sondern deren Qualität in den Fokus stellt.

Der Nutri-Score wird dabei nicht selbst berechnet, sondern über die Open Food Facts API bezogen. Nach dem Scannen eines Barcodes ruft die App die Produktdaten aus der Datenbank ab, in der der Nutri-Score bereits auf Basis der hinterlegten Nährwertangaben berechnet wurde. Dadurch kann dem Nutzer direkt eine verständliche Bewertung angezeigt werden, ohne dass komplexe Berechnungen lokal durchgeführt werden müssen.

### Originaler Sinn / Vision und Zielgruppe der App:

Sinn der App / Vision

Die App soll Nutzerinnen und Nutzern helfen, ihre tägliche Kalorienaufnahme einfach und mobil zu erfassen. Der Fokus liegt auf einer schnellen und intuitiven Bedienung, zum Beispiel durch das Scannen von Barcodes und das automatische Übernehmen von Nährwertdaten.
Ziel ist eine Kalorientracking-App, die vollständig lokal auf dem Gerät funktioniert, kein Benutzerkonto benötigt und alle wichtigen Funktionen für den Alltag bietet.

Zielgruppe

Die App richtet sich an Personen, die ihre Ernährung bewusster kontrollieren möchten. Zum Beispiel:

- Menschen, die Kalorien zählen (z.B. zum Abnehmen oder Gewichtserhalt)
- Sportlich aktive Nutzer, die ihre Ernährung überwachen möchten

### Neuer Sinn / Vision und Zielgruppe der App:

Sinn der App / Vision

Die App soll Nutzerinnen und Nutzern helfen, die Qualität ihrer täglichen Ernährung einfach und mobil zu erfassen. Der Fokus liegt auf einer schnellen und intuitiven Bedienung, zum Beispiel durch das Scannen von Barcodes und das automatische Übernehmen von Produkt- und Nährwertdaten inklusive Nutri-Score.
Ziel ist eine Ernährungs-Tracking-App, die alle wichtigen Funktionen für den Alltag bietet. Die App bewertet Lebensmittel anhand des Nutri-Score-Systems und zeigt übersichtlich, wie ausgewogen sich die Nutzerinnen und Nutzer im Alltag ernähren.

Zielgruppe

Die App richtet sich an Personen, die ihre Ernährungsqualität bewusster einschätzen und verbessern möchten. Zum Beispiel:

- Menschen, die sich gesünder ernähren möchten und eine einfache Orientierung beim Einkaufen brauchen
- Personen, die schnell erkennen möchten, wie ausgewogen ihre täglichen Lebensmittel sind
- Sportlich aktive Nutzer, die auf eine hochwertige und ausgewogene Ernährung achten möchten

# Vorbereitung zur Veröffentlichung

1. Build und Signierung
    - APK wird automatisch über GitHub Actions gebaut
    - eindeutige Version:
        - versionName (z. B. 1.2.0)
        - versionCode muss bei jedem Release höher sein
    - Release-Keystore wird verwendet (signierte APK notwendig für Installation und Updates)
    - keine Debug-Builds veröffentlichen
    - Produktionsbuild darf keine Test- oder localhost-URLs enthalten

2. App-Konfiguration & Sicherheit
    - API nur über HTTPS
    - keine Passwörter, Tokens oder API-Keys im Frontend speichern
    - Debug-Logs deaktivieren
    - nur benötigte Berechtigungen:
        - Internet
        - Kamera (Barcode-Scanner)
    - Fehlerbehandlung, damit die App bei fehlender Internetverbindung nicht abstürzt

3. Backend-Bereitstellung
   Der Backend-Server läuft als Container in einem Kubernetes-Cluster.
   Bei jedem Push baut die CI-Pipeline automatisch ein neues Docker-Image und veröffentlicht es in der GitHub Container Registry (GHCR).
   Das Cluster verwendet immer das latest-Tag und startet die Pods neu, wodurch automatisch die neue Version geladen wird (Rolling Update, kein manueller Deploy notwendig).

    Voraussetzungen
    - Kubernetes-Cluster (z. B. VPS oder Cloud-Provider)
    - Domain
    - TLS-Zertifikat (HTTPS)
    - PostgreSQL-Datenbank
    - Zugriff des Clusters auf GHCR (ImagePullSecret oder öffentliches Repository)

    Ingress und Erreichbarkeit
    Der Zugriff erfolgt über einen Kubernetes Ingress Controller.

    Aufgaben des Ingress:
    - Weiterleitung der Domain auf den Backend-Service
    - HTTPS-Verschlüsselung (TLS-Termination)
    - automatische Zertifikatsverwaltung (z. B. Cert-Manager + Let’s Encrypt)
    - Weiterleitung aller Anfragen an den internen Service-Port (3000)

    Beispielablauf:
    1. Nutzer ruft https://nutriscan.viel-erfolg.ch auf
    2. Anfrage erreicht den Ingress Controller
    3. TLS wird dort entschlüsselt
    4. Anfrage wird an den Kubernetes Service weitergeleitet
    5. Service verteilt die Anfrage auf die laufenden Pods

    Dadurch ist der Container selbst nicht öffentlich erreichbar, sondern nur über den Ingress.

    Image-Update / Deployment
    - Pipeline baut Image bei jedem Push
    - Image wird nach GHCR gepusht
    - Kubernetes verwendet immer :latest
    - Pods werden neu gestartet und ziehen automatisch das neue Image
    - Update erfolgt ohne Downtime durch Rolling Update

    Environment-Variablen
    Die sensiblen Werte werden nicht im Cluster gespeichert, sondern beim Build über die Pipeline gesetzt.

    Wichtige Variablen:
    - DATABASE_URL
    - JWT_SECRET
    - ALLOWED_ORIGINS
    - NODE_ENV=production

    Datenbank
    - PostgreSQL extern oder im Cluster (Everest)
    - Schema wird beim Start automatisch erstellt/aktualisiert (prisma db push)
    - Backend verbindet sich über DATABASE_URL

    Ergebnis:
    Das Backend ist dauerhaft unter einer Domain erreichbar, automatisch aktualisiert und über HTTPS abgesichert, ohne manuelle Server-Deployments.

4. Security-Massnahmen
    - HTTPS erzwingen
    - CORS nur für eigene Domain erlauben
    - sicheres JWT-Secret verwenden
    - Firewall (nur Webports offen)
    - keine Server-Fehlermeldungen an Nutzer ausgeben

5. Verteilung der App

    Die APK wird über GitHub Releases oder eine Website bereitgestellt.

    Installation durch Nutzer:
    1. APK herunterladen
    2. "Unbekannte Quellen" aktivieren
    3. APK installieren

    Updates müssen manuell installiert werden. Eine höhere versionCode überschreibt die alte Version.

6. Tests vor Veröffentlichung
    - Installation auf mehreren Android-Versionen
    - Login/Registrierung
    - Barcode-Scan
    - Serververbindung
    - keine Abstürze oder Serverfehler

# Installationsanleitung

[README.md](../../README.md)

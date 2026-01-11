<div align="center">

<br />

ＥＣＨＯ   ＡＲＣＨＩＶＥ

<p>
<i>Intelligent Knowledge Space & Neural Interface</i>
</p>

<img src="public/preview.png" alt="Echo Archive Interface" width="100%" style="border-radius: 4px; border: 1px solid #2d2d2d; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

<br />
<br />

</div>

<br />

⬡ Über das Projekt

Echo Archive ist ein Experiment zur Organisation von Wissen im digitalen Raum. Wir brechen mit starren Ordnerstrukturen und linearen Listen zugunsten einer räumlichen Konstellation von Gedanken.

Die App visualisiert Notizen als leuchtende Knotenpunkte in einem 3D-Universum. Ähnliche Themen finden durch ein intelligentes Tagging-System ("Gravity") automatisch zueinander. Unterstützt wird das Ganze durch Google Gemini AI, die beim Schreiben, Zusammenfassen und Kategorisieren hilft.

Thoughts are not linear. Why should our notes be?

◈ Features

Wir haben die Funktionalitäten in drei Kernbereiche unterteilt:

Modul

Beschreibung & Fähigkeiten

⌖ Spatial UI

• Interaktives Universum: Navigiere durch deine Gedanken wie durch ein Sternensystem (Pan, Zoom, Orbit).



• Responsive Design: Nahtlose Erfahrung auf Desktop, Tablet und Mobile (Touch-optimiert).



• Visuelle Verbindungen: Notizen mit gleichen Tags werden automatisch visuell verknüpft.

✦ AI Core

• Auto-Tagging: Die KI analysiert deinen Text und schlägt passende Kategorien vor.



• Smart Continue: Schreibblockade? Die KI führt deinen Gedanken kontextbasiert weiter.



• Abstract Generator: Erstellt vollautomatisch eine kurze Zusammenfassung deiner Notiz.

🔒 Tech & Privacy

• Local First: Alle Daten liegen im localStorage deines Browsers. Keine Datenbank, kein Tracking.



• PWA Ready: Installierbar als native App auf dem Homescreen.



• Minimalismus: Ein "Distraction-Free" Editor im Dark Mode.

⚙ Installation & Setup

Du kannst das Projekt mit wenigen Befehlen lokal aufsetzen.

1. Quick Start

Führe diese Befehle nacheinander in deinem Terminal aus:

# Repository klonen
git clone [https://github.com/dewtm/echo-archive.git](https://github.com/dewtm/echo-archive.git)

# In das Verzeichnis wechseln
cd echo-archive

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev


2. Environment Variables (Wichtig für KI!)

Damit die KI-Funktionen (Gemini) funktionieren, benötigst du einen API Key.

Erstelle eine Datei namens .env im Hauptverzeichnis des Projekts.

Füge den folgenden Inhalt ein:

VITE_GEMINI_API_KEY=Dein_Google_API_Key_Hier


Hinweis: Einen kostenlosen API Key erhältst du im Google AI Studio. Ohne diesen Key funktioniert die App, aber die KI-Features (Zauberstab, Auto-Tagging) geben keine Antwort.

⌘ Bedienung

Das Interface passt sich automatisch an dein Gerät an.

Aktion

🖥️ Desktop (Maus)

📱 Mobile (Touch)

Bewegen

Rechtsklick + Ziehen

Wischen (1 Finger)

Zoom

Mausrad

Pinch-Geste (2 Finger)

Öffnen

Linksklick auf Node

Tippen auf Node

Editor

Sidebar (Rechts)

Fullscreen Overlay

⌬ Tech Stack

Frontend: React 18

Build Tool: Vite

3D Engine: Three.js / React Three Fiber / Drei

Styling: Tailwind CSS

Icons: Lucide React

AI: Google Generative AI SDK (Gemini 2.5 Flash)

§ Lizenz & Rechtliches

Dieses Projekt ist ein privates Showcase.
Die Inhalte der Demo-Notizen und das Design sind urheberrechtlich geschützt.
Der Code darf für Lernzwecke genutzt werden (MIT License).

Impressum & Datenschutz: Siehe Live-Seite.

<br />

<div align="center">
<small>Built with ❤️ and ☕ by [Calvin] in 2025</small>
</div>

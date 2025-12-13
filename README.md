# Epoxy Calculator

En desktop applikation til beregning af epoxy-støbninger, kostpriser og data management.

## Installation

Da denne applikation er leveret som kildekode, skal du først installere nødvendige værktøjer.

1.  **Install Node.js**: Ensure you have Node.js (version 18+) installed.
    *   Download: [https://nodejs.org/](https://nodejs.org/)
2.  **Clone/Download** this repository.
3.  **Open a terminal** in the project directory (`epoxy-calculator`).
4.  **Install dependencies**:
    ```bash
    npm install
    ```

## 🚀 Usage

### 💻 Development Mode
To start the application in development mode (with hot-reload):

```bash
npm run dev
```

This will launch two processes:
1.  Vite server (for React frontend)
2.  Electron window

### 📦 Build for Production
To package the application as an executable (exe/dmg/etc.):

```bash
npm run dist
```

Filen vil kunne findes i `dist/` mappen.

## Funktioner

*   **Beregner**: Udregn priser baseret på materialeforbrug, tid, formslid, etc.
*   **Historik**: Gem beregninger og se summeret status på projekter.
*   **Indstillinger**: Tilpas dine kg-priser, timeløn og gem farver i biblioteket.
*   **Lokal Data**: Alt data gemmes lokalt på din maskine i `Documents/epoxy_data.json`.

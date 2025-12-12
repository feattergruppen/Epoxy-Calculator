# Epoxy Calculator

En desktop applikation til beregning af epoxy-støbninger, kostpriser og data management.

## Installation

Da denne applikation er leveret som kildekode, skal du først installere nødvendige værktøjer.

1.  **Installer Node.js**: Sørg for at du har Node.js (version 18+) installeret.
    *   Hent her: [https://nodejs.org/](https://nodejs.org/)
2.  **Åbn en terminal** i denne mappe (`epoxy-calculator`).
3.  **Installer afhængigheder**:
    ```bash
    npm install
    ```

## Kør Applikationen

For at starte applikationen i udviklingstilstand (med "hot reload"):

```bash
npm run dev
```

Dette vil åbne to processer:
1.  Vite server (React)
2.  Electron vindue

## Byg til Produktion (Exe/Dmg)

For at pakke programmet til en eksekverbar fil:

```bash
npm run dist
```

Filen vil kunne findes i `dist/` mappen.

## Funktioner

*   **Beregner**: Udregn priser baseret på materialeforbrug, tid, formslid, etc.
*   **Historik**: Gem beregninger og se summeret status på projekter.
*   **Indstillinger**: Tilpas dine kg-priser, timeløn og gem farver i biblioteket.
*   **Lokal Data**: Alt data gemmes lokalt på din maskine i `Documents/epoxy_data.json`.

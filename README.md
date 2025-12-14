# ⚗️ Epoxy Calculator

![Version](https://img.shields.io/badge/version-1.3.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A desktop application for calculating epoxy casting costs, managing materials, and tracking project history. Built with Electron and React.

## 🌟 Features

- **🧮 Cost Calculator**: Calculate prices based on material usage, labor, mold wear, consumables, and more.
- **📜 Project History**: Save calculations and view summarized project stats.
- **📄 PDF Export**: Generate professional PDF invoices and summaries of your projects.
- **🧪 Material Management**: Manage custom materials, densities, and categories.
- **🎨 Color Library**: Save and organize your color pigments.
- **⚙️ Settings**: Customize hourly rates, currency, and default costs.
- **🔒 Privacy & Control**: Data is stored in files you own. No external cloud servers or subscriptions.
- **💾 Backup & Restore**: Export/Import your full database including images.
- **☁️ Shared Database**: Configurable storage path for syncing data across computers via shared folders.
- **💲Invoice Management**: Manage invoices and merge multiple invoices into one.

## 📥 Installation

This application is provided as source code. You will need Node.js installed to run it.

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

The output file will be located in the `dist-electron/` directory.

## 🛠️ Technologies

- **Electron**: Desktop runtime
- **React**: UI Framework
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling
- **Lucide React**: Icons
- **✨ Vibe-code**: Coded with Vibe-code

## 🆕 Latest Updates (v1.3.1)

- **Themes**: Major update ensuring themes apply consistently across the entire application.
- **Color Pricing**: Added price field to colors in the library.
- **Bug Fixes**: Minor bug fixes and UI improvements.
- **Invorce number**: Added invoice number to invoices.
- **Invorce merger**: Added invoice merger to invoices.


## 📄 License

This project is open source.

<br />

> [!TIP]
> **Too tech-savvy?**
> Or if you don't bother with all the codeing, here's an setup.exe file: [Download Release](https://github.com/feattergruppen/Epoxy-Calculator/releases/tag/Epoxy-Calculator)

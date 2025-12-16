# ⚗️ Epoxy Calculator
![Version](https://img.shields.io/badge/version-1.4.19-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A desktop application for calculating epoxy casting costs, managing materials, and tracking project history. Built with Electron and React.

## 🌟 Features

- **🧮 Cost Calculator**: Calculate prices based on material usage, labor, mold wear, consumables, and more.
- **📜 Project History**: Save calculations, merge invoices, and view summarized project stats.
- **📄 PDF Export**: Generate professional PDF invoices (single or merged) with auto-numbering.
- **👥 Customer Directory**: Manage customer details and easily add them to invoices.
- **🧪 Material Management**: Manage custom materials, densities, and categories.
- **🎨 Color Library**: Save and organize your color pigments with pricing.
- **⚙️ Settings**: Customize hourly rates, currency, themes, company info. And much more.
- **🎨 Themes**: Choose from Light, Dark, Ocean, and Sunset themes.
- **🧾Invoice Merging**: Select multiple projects to create a single merged invoice.
- **🧾Invoice Numbering**: Automatic year-based numbering (YYYY-NNN).
- **🔒 Privacy & Control**: Data is stored in files you own. No external cloud servers or subscriptions required.
- **💾 Backup & Restore**: Export/Import your full database including images, Customer Directory, Material Management, Color Library, Settings, and much more.
- **☁️ Shared Database**: Configurable storage path for syncing data across computers via shared folders.
- **👥 Customer Directory**: Dedicated directory in Settings to manage customer details.
- **🖥️ Full Screen Support**: Optimized layout for large monitors with responsive grids.

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

## 🆕 Latest Updates (v1.4.19)

- **📝 Material & Project Notes**: Add optional notes to specific materials or the entire project. Toggable for invoice visibility.
- **🧾 Invoice Price Breakdown**: Detailed invoice footer showing Subtotal, Discount/Rounding, and Total.
- **📊 History Sorting**: Sort your calculation history by Date, Price, or Name (Asc/Desc).
- **⏱️ Timestamps**: Exact time of calculation is now saved and displayed on invoices.
- **🐛 Bug Fixes**: Improved Drift calculation logic and fixed PDF header alignment.


## 📄 License

This project is open source.

<br />

> [!TIP]
> **Too tech-savvy?**
> Or if you don't bother with all the codeing, here's an setup.exe file: [Download Release](https://github.com/feattergruppen/Epoxy-Calculator/releases/tag/Epoxy-Calculator-v.1.3.3)

## � To-Do

- [⚠️] **Smart Auto-save**: Implement local buffering system (saves to temp file first) for optimized network drive usage.
- [⚠️] **Conditional Logic**: Option to enable/disable "Buffered Save" (intended for non-local locations).
- [⚠️] **Sync Settings**: Configurable timer for how often to sync to the main database.
- [⚠️] **UI Feedback**: Add "Loading" / "Syncing" indicator when updating the database.
- [⚠️] **Differential Updates**: Ensure only new/changed data is synced to minimize invalid file writes.
- [⚠️] **Update Checker**: Implement a mechanism to check for updates (e.g., via GitHub Releases) and notify the user.
- [⚠️] **Improments to the Help section**: Add more information about the application and its features.
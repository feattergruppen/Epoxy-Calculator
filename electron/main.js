const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Define path to data file
// Using app.getPath('userData') ensures it's in a standard OS location
// On Windows: %APPDATA%/epoxy-calculator/epoxy_data.json
const DATA_FILE_NAME = 'epoxy_data.json';
// Using Documents folder as requested in instructions "f.eks. i brugerens AppData eller Documents mappe"
// Documents is often easier for users to find/backup manually.
const DATA_PATH = path.join(app.getPath('documents'), DATA_FILE_NAME);

// Default Data Structure (Chapter 4)
const DEFAULT_DATA = {
    settings: {
        price1to1: 125.0,
        price2to1: 125.0,
        hourlyRate: 150.0,
        buffer: 15.0,
        moldWear: 10.0,
        vacuumCost: 5.0,
        consumables: 5.0
    },
    entries: [],
    colors: []
};

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Security best practice
            contextIsolation: true, // Security best practice
            sandbox: false // Needed for some fs operations if not strictly isolated? false is okay for local tool
        },
        icon: path.join(__dirname, '../public/icon.png')
    });

    // Check if we are in dev mode (localhost) or prod
    // In this setup, we assume dev if env variable is set or we can try to connect to localhost
    // For simplicity in the generated package.json script 'electron .', we might need to wait for vite.
    // The 'dev:electron' script waits on port 5173.

    // We can check if the dev server is running by trying to load the URL?
    // Or just use command line args.

    // Simple meaningful check:
    // If we are running via 'electron .' AND 'npm run dev' is active, load localhost.
    // If packaged, load index.html.

    // Check environment
    const isDev = !app.isPackaged;

    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// IPC Handlers
ipcMain.handle('get-data', async () => {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            // Create with default data if not exists
            fs.writeFileSync(DATA_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
            return DEFAULT_DATA;
        }
        const data = fs.readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return DEFAULT_DATA;
    }
});

ipcMain.handle('save-data', async (event, data) => {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Error saving data:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-pdf', async (event, { dataBase64, filename }) => {
    try {
        const win = BrowserWindow.getFocusedWindow();
        const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title: 'Gem Faktura',
            defaultPath: path.join(app.getPath('documents'), filename),
            filters: [
                { name: 'PDF Files', extensions: ['pdf'] }
            ]
        });

        if (canceled || !filePath) {
            return { success: false, canceled: true };
        }

        fs.writeFileSync(filePath, Buffer.from(dataBase64, 'base64'));
        return { success: true, filePath };
    } catch (error) {
        console.error('Error saving PDF:', error);
        return { success: false, error: error.message };
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

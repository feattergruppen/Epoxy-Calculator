const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const AdmZip = require('adm-zip');

// Define path to data file
// Using app.getPath('userData') ensures it's in a standard OS location
// On Windows: %APPDATA%/epoxy-calculator/epoxy_data.json
const DATA_FILE_NAME = 'epoxy_data.json';
const CONFIG_FILE_NAME = 'config.json';
const CONFIG_PATH = path.join(app.getPath('userData'), CONFIG_FILE_NAME);

// Function to get current data path
function getDataPath() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
            if (config.dataPath && fs.existsSync(config.dataPath)) {
                return path.join(config.dataPath, DATA_FILE_NAME);
            }
        }
    } catch (e) {
        console.error("Config read error", e);
    }
    // Default fallback
    return path.join(app.getPath('documents'), DATA_FILE_NAME);
}

let DATA_PATH = getDataPath();

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

// Config Handlers
ipcMain.handle('get-data-path', () => {
    return path.dirname(DATA_PATH);
});

ipcMain.handle('change-data-path', async () => {
    const win = BrowserWindow.getFocusedWindow();
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Select Database Folder',
        properties: ['openDirectory']
    });

    if (canceled || filePaths.length === 0) return { success: false };

    const newDir = filePaths[0];
    const newPath = path.join(newDir, DATA_FILE_NAME);

    // Check if data already exists there
    if (!fs.existsSync(newPath)) {
        // Offer to copy current data
        const choice = dialog.showMessageBoxSync(win, {
            type: 'question',
            buttons: ['Copy current data', 'Start fresh', 'Cancel'],
            title: 'New Location',
            message: 'No database found in selected folder.',
            detail: 'Do you want to copy your current data there?'
        });

        if (choice === 2) return { success: false, canceled: true }; // Cancel

        if (choice === 0) {
            // Copy
            try {
                if (fs.existsSync(DATA_PATH)) {
                    fs.copyFileSync(DATA_PATH, newPath);
                } else {
                    fs.writeFileSync(newPath, JSON.stringify(DEFAULT_DATA, null, 2));
                }
            } catch (err) {
                return { success: false, error: 'Could not copy file: ' + err.message };
            }
        } else {
            // Create empty default if choice is 1
            fs.writeFileSync(newPath, JSON.stringify(DEFAULT_DATA, null, 2));
        }
    }

    // Save config
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ dataPath: newDir }, null, 2));

        // Update runtime path
        DATA_PATH = newPath;

        return { success: true, newPath: newDir, requiresRestart: true };
    } catch (e) {
        return { success: false, error: 'Could not save config: ' + e.message };
    }
});

// Start of export-backup (hook for context)
ipcMain.handle('export-backup', async () => {
    try {
        const win = BrowserWindow.getFocusedWindow();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
        const defaultName = `epoxy_backup_${dateStr}.zip`;

        const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title: 'Export Backup',
            defaultPath: path.join(app.getPath('documents'), defaultName),
            filters: [{ name: 'Zip Files', extensions: ['zip'] }]
        });

        if (canceled || !filePath) return { success: false, canceled: true };

        const zip = new AdmZip();
        // Add the data file
        if (fs.existsSync(DATA_PATH)) {
            zip.addLocalFile(DATA_PATH);
        } else {
            // If no data file, save defaults first
            fs.writeFileSync(DATA_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
            zip.addLocalFile(DATA_PATH);
        }

        // Write zip
        zip.writeZip(filePath);
        return { success: true, filePath };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('import-backup', async () => {
    try {
        const win = BrowserWindow.getFocusedWindow();
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            title: 'Import Backup',
            filters: [{ name: 'Zip Files', extensions: ['zip'] }],
            properties: ['openFile']
        });

        if (canceled || filePaths.length === 0) return { success: false, canceled: true };

        const zipPath = filePaths[0];
        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();

        // Check for epoxy_data.json
        const dataEntry = zipEntries.find(entry => entry.entryName === DATA_FILE_NAME);
        if (!dataEntry) {
            return { success: false, error: 'Invalid backup: epoxy_data.json missing' };
        }

        // Validate JSON
        const dataStr = zip.readAsText(dataEntry);
        try {
            JSON.parse(dataStr);
        } catch (e) {
            return { success: false, error: 'Invalid backup: Data file is corrupt' };
        }

        // Backup current file before overwriting
        if (fs.existsSync(DATA_PATH)) {
            const backupPath = DATA_PATH + '.bak';
            fs.copyFileSync(DATA_PATH, backupPath);
        }

        // Extract (overwrite)
        zip.extractEntryTo(dataEntry, path.dirname(DATA_PATH), false, true);

        return { success: true };
    } catch (error) {
        console.error('Import error:', error);
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

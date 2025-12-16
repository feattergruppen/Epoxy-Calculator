const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
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

// Auto Updater Events
autoUpdater.autoDownload = false; // We ask user first

autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Update Error', error == null ? "unknown" : (error.stack || error).toString());
});

autoUpdater.on('update-available', (info) => {
    const choice = dialog.showMessageBoxSync({
        type: 'info',
        title: 'Update Available',
        message: `Version ${info.version} is available.`,
        detail: 'Do you want to download it now?',
        buttons: ['Download', 'Cancel']
    });
    if (choice === 0) {
        autoUpdater.downloadUpdate();
    }
});

autoUpdater.on('update-not-available', (info) => {
    // Only show if manually requested? Or just log? 
    // Usually only show dialog if user clicked "Check for Updates", 
    // but here global listeners catch it. We might need flagged checks.
    // For now, let's silence this global listener and handle manual check differently or just show dialog always.
    // Better: show dialog only on manual trigger. But listeners are global.
    // Simple approach: Logic in menu item.
});

autoUpdater.on('update-downloaded', (info) => {
    const choice = dialog.showMessageBoxSync({
        type: 'question',
        title: 'Ready to Install',
        message: 'Update downloaded. Application will restart to install.',
        buttons: ['Restart Now', 'Later']
    });
    if (choice === 0) {
        autoUpdater.quitAndInstall();
    }
});

function createAppMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Check for Updates',
                    click: () => {
                        autoUpdater.checkForUpdatesAndNotify();
                        // Note: checkForUpdatesAndNotify only shows notification.
                        // We want explicit dialog.
                        // Let's use checkForUpdates() and let listeners handle it.
                        // To show "No update available", we might need a flag or custom logic.
                        // For MVP: Just run check. If nothing happens, user knows its up to date? 
                        // No, bad UX.
                        // Let's make a manual check function.
                        manualCheck();
                    }
                },
                {
                    label: 'About',
                    click: async () => {
                        const { response } = await dialog.showMessageBox({
                            type: 'info',
                            title: 'About Epoxy Calculator',
                            message: `Epoxy Calculator v${app.getVersion()}`,
                            detail: 'Created by FeatterGruppen.\n\nOpen Source Project.',
                            buttons: ['Visit Website', 'OK']
                        });
                        if (response === 0) {
                            shell.openExternal('https://github.com/feattergruppen/Epoxy-Calculator');
                        }
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

let manualCheckTriggered = false;
function manualCheck() {
    manualCheckTriggered = true;
    autoUpdater.checkForUpdates();
}

// Add listener for 'update-not-available' specifically for manual checks
autoUpdater.on('update-not-available', (info) => {
    if (manualCheckTriggered) {
        dialog.showMessageBox({
            type: 'info',
            title: 'No Updates',
            message: 'You are using the latest version.',
            buttons: ['OK']
        });
        manualCheckTriggered = false;
    }
});

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

// Smart Auto-Save Handlers
const TEMP_FILE_NAME = 'epoxy_temp_buffer.json';
const TEMP_PATH = path.join(app.getPath('userData'), TEMP_FILE_NAME);

ipcMain.handle('save-local-buffer', async (event, data) => {
    try {
        fs.writeFileSync(TEMP_PATH, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Error saving local buffer:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('sync-data', async (event, localData) => {
    try {
        // 1. Read Main DB to get latest state
        let mainData = DEFAULT_DATA;
        if (fs.existsSync(DATA_PATH)) {
            mainData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        }

        // 2. Differential Merge Logic
        // Strategy: "Smart Merge" - Add new items, update modified items.
        // For simplicity & safety: We will assume localData is the "source os truth" for the current user's session.
        // HOWEVER, to respect other users, we should preserve items that are in Main but NOT in Local?
        // NO, that might re-introduce deleted items. Use Last-Write-Wins for now.
        // Improvements: Check 'lastModified' timestamps if we had them.
        // Current Plan: Overwrite specific keys if changed?
        // Safest approach for "Shared Drive" without a real DB is tricky.
        // Let's implement a robust "Union" for Arrays (Entries, Colors, Materials, Customers).

        // Helper to merge arrays by ID
        const mergeArrays = (mainArr, localArr) => {
            const merged = [...mainArr];
            localArr.forEach(localItem => {
                const index = merged.findIndex(m => m.id === localItem.id);
                if (index >= 0) {
                    // Update existing
                    merged[index] = localItem;
                } else {
                    // Add new
                    merged.push(localItem);
                }
            });
            return merged;
        };

        const mergedData = {
            ...mainData,
            ...localData, // Settings overwrite
            entries: mergeArrays(mainData.entries || [], localData.entries || []),
            colors: mergeArrays(mainData.colors || [], localData.colors || []),
            materials: mergeArrays(mainData.materials || [], localData.materials || []),
            customers: mergeArrays(mainData.customers || [], localData.customers || []),
            // Categories are sets of strings, simple overwrite or union? Union is safer.
            materialCategories: [...new Set([...(mainData.materialCategories || []), ...(localData.materialCategories || [])])],
            colorCategories: [...new Set([...(mainData.colorCategories || []), ...(localData.colorCategories || [])])],
        };

        // 3. Write to Main DB
        fs.writeFileSync(DATA_PATH, JSON.stringify(mergedData, null, 2));

        return { success: true, syncedPath: DATA_PATH };
    } catch (error) {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
    }
});

// Original Save Handler (kept for backward compatibility or direct saves)
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
        let defaultDir = app.getPath('documents');

        // Try to read last saved path from config
        try {
            if (fs.existsSync(CONFIG_PATH)) {
                const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
                if (config.lastPdfPath && fs.existsSync(config.lastPdfPath)) {
                    defaultDir = config.lastPdfPath;
                }
            }
        } catch (e) {
            console.error("Error reading config for pdf path", e);
        }

        const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title: 'Gem Faktura',
            defaultPath: path.join(defaultDir, filename),
            filters: [
                { name: 'PDF Files', extensions: ['pdf'] }
            ]
        });

        if (canceled || !filePath) {
            return { success: false, canceled: true };
        }

        fs.writeFileSync(filePath, Buffer.from(dataBase64, 'base64'));

        // Save new path to config
        try {
            const newDir = path.dirname(filePath);
            let config = {};
            if (fs.existsSync(CONFIG_PATH)) {
                config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
            }
            config.lastPdfPath = newDir;
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        } catch (e) {
            console.error("Error saving config with pdf path", e);
        }

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

ipcMain.handle('change-data-path', async (event, options = {}) => {
    const win = BrowserWindow.getFocusedWindow();
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: options.title || 'Select Database Folder',
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
            buttons: options.buttons || ['Copy current data', 'Start fresh', 'Cancel'],
            title: options.dialogNewLoc || 'New Location',
            message: options.dialogNoDbFound || 'No database found in selected folder.',
            detail: options.dialogCopyAsk || 'Do you want to copy your current data there?'
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
ipcMain.handle('export-backup', async (event, options = {}) => {
    try {
        const win = BrowserWindow.getFocusedWindow();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
        const defaultName = `epoxy_backup_${dateStr}.zip`;

        const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title: options.title || 'Export Backup',
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

ipcMain.handle('import-backup', async (event, options = {}) => {
    try {
        const win = BrowserWindow.getFocusedWindow();
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            title: options.title || 'Import Backup',
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
    createAppMenu();

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

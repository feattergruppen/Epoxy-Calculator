const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getData: () => ipcRenderer.invoke('get-data'),
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    exportBackup: (options) => ipcRenderer.invoke('export-backup', options),
    importBackup: (options) => ipcRenderer.invoke('import-backup', options),
    getDataPath: () => ipcRenderer.invoke('get-data-path'),
    changeDataPath: (options) => ipcRenderer.invoke('change-data-path', options),
    saveLocalBuffer: (data) => ipcRenderer.invoke('save-local-buffer', data),
    syncData: (data) => ipcRenderer.invoke('sync-data', data),
    savePdf: (bg, filename) => ipcRenderer.invoke('save-pdf', { dataBase64: bg, filename }),
    saveSession: (data) => ipcRenderer.invoke('save-session', data),
    getSession: () => ipcRenderer.invoke('get-session'),
    onCloseIntent: (callback) => ipcRenderer.on('app-close-intent', callback),
    confirmClose: () => ipcRenderer.send('app-close-confirmed')
});

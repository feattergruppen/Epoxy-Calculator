const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getData: () => ipcRenderer.invoke('get-data'),
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    savePdf: (dataBase64, filename) => ipcRenderer.invoke('save-pdf', { dataBase64, filename }),
    exportBackup: () => ipcRenderer.invoke('export-backup'),
    importBackup: () => ipcRenderer.invoke('import-backup'),
    getDataPath: () => ipcRenderer.invoke('get-data-path'),
    changeDataPath: () => ipcRenderer.invoke('change-data-path')
});

// Wrapper for interacting with Electron's exposed API

export const dataHandler = {
    // Fetch all data (settings, entries, colors)
    loadData: async () => {
        if (window.electronAPI) {
            return await window.electronAPI.getData();
        } else {
            console.warn("Electron API not found (Browser Mode?)");
            return null;
        }
    },

    // Save the entire state object
    saveData: async (data) => {
        if (window.electronAPI) {
            return await window.electronAPI.saveData(data);
        } else {
            console.warn("Electron API not found (Browser Mode?)");
            return { success: false, error: "No API" };
        }
    },

    saveLocalBuffer: async (data) => {
        if (window.electronAPI && window.electronAPI.saveLocalBuffer) {
            return await window.electronAPI.saveLocalBuffer(data);
        }
        return { success: false };
    },

    syncData: async (data) => {
        if (window.electronAPI && window.electronAPI.syncData) {
            return await window.electronAPI.syncData(data);
        }
        return { success: false };
    }
};

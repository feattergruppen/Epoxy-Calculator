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
    }
};

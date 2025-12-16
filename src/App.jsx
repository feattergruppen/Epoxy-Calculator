import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, History as HistoryIcon, Settings as SettingsIcon, Palette, Layers, Pencil, X } from 'lucide-react';
import Calculator from './components/Calculator';
import History from './components/History';
import Settings from './components/Settings';
import ColorGallery from './components/ColorGallery';
import MaterialGallery from './components/MaterialGallery';
import { dataHandler } from './utils/dataHandler';
import { translations } from './utils/translations';

// Helper to detect system language
const getSystemLanguage = () => {
    const rawLang = navigator.language || navigator.userLanguage || 'en';
    const langCode = rawLang.split('-')[0];

    // Map special cases
    if (langCode === 'nb' || langCode === 'nn') return 'no';

    // Supported languages
    const supported = ['da', 'en', 'sv', 'no', 'de', 'pl', 'cs', 'hu', 'ro', 'bg'];
    return supported.includes(langCode) ? langCode : 'en'; // Default to English if not supported
};

function App() {
    const [activeTab, setActiveTab] = useState('calculator');
    const [loading, setLoading] = useState(true);

    // Initial state uses system language
    const [settings, setSettings] = useState({
        price1to1: 125.0, price2to1: 125.0, hourlyRate: 150.0, buffer: 15.0,
        moldWear: 10.0, vacuumCost: 5.0, consumables: 5.0,
        multiCastCost: 0.0, // New setting
        language: getSystemLanguage(),
        currency: 'kr',
        invoiceYear: new Date().getFullYear(),
        invoiceSeq: 1
    });
    const [entries, setEntries] = useState([]);
    const [colors, setColors] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [customers, setCustomers] = useState([]); // Customer Directory
    const [materialCategories, setMaterialCategories] = useState(['Træ', 'Metal', 'Inserts']); // Default categories
    const [colorCategories, setColorCategories] = useState(['Mica Pulver', 'Flydende Farve', 'Alcohol Ink']); // Default color categories

    // Persistent Calculator State
    const [calculatorInputs, setCalculatorInputs] = useState({
        projectName: '',
        amount1to1: 0,
        amount2to1: 0,
        useMultiCast: false, // New input
        multiCastCount: 0,   // New input
        customMaterials: [],
        projectNote: '',
        showProjectNoteOnInvoice: false,
        isProjectNoteOpen: false,
        time: 0,
        extrasCost: 0,
        packagingCost: 0,
        useDrift: true,      // New input check
        useVacuum: true,
        includeLabor: true,
        includeProfit: true,
        includeBuffer: true,
        includeMoldWear: true,
        note: '',
        projectImage: null,
        rounding: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(Date.now());

    // Load data on mount
    useEffect(() => {
        const init = async () => {
            try {
                const data = await dataHandler.loadData();
                if (data) {
                    // Merge loaded settings with default to ensure existence of keys
                    setSettings(prev => ({ ...prev, ...(data.settings || {}) }));
                    setEntries(data.entries || []);
                    setColors(data.colors || []);
                    setMaterials(data.materials || []);
                    setCustomers(data.customers || []);
                    if (data.materialCategories && data.materialCategories.length > 0) {
                        setMaterialCategories(data.materialCategories);
                    }
                    if (data.colorCategories && data.colorCategories.length > 0) {
                        setColorCategories(data.colorCategories);
                    }
                }
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Apply theme
    useEffect(() => {
        const theme = settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.className = theme; // Also set as class for redundancy
    }, [settings.theme]);

    // Auto-save on changes
    // Auto-save on changes (Smart Logic)
    useEffect(() => {
        if (!loading) {
            const dataToSave = { settings, entries, colors, materials, customers, materialCategories, colorCategories };

            if (settings.enableBufferedSave) {
                // Buffer Mode: Save to local temp file only
                dataHandler.saveLocalBuffer(dataToSave).catch(err => console.error("Buffer save failed", err));
            } else {
                // Direct Mode: Save directly to Main DB (blocking/standard)
                dataHandler.saveData(dataToSave);
            }
        }
    }, [settings, entries, colors, materials, customers, materialCategories, colorCategories, loading]);

    // Sync Loop (only active if Buffered Save is enabled)
    useEffect(() => {
        if (!settings.enableBufferedSave || loading) return;

        const intervalSec = Math.max(5, parseInt(settings.syncInterval || 10)); // Min 5 sec

        const syncId = setInterval(async () => {
            setIsSyncing(true);
            try {
                const dataToSync = { settings, entries, colors, materials, customers, materialCategories, colorCategories };
                await dataHandler.syncData(dataToSync);
                setLastSyncTime(Date.now());
            } catch (err) {
                console.error("Sync failed", err);
            } finally {
                // Keep "Syncing" shown for at least 500ms so user sees it
                setTimeout(() => setIsSyncing(false), 800);
            }
        }, intervalSec * 1000);

        return () => clearInterval(syncId);
    }, [settings.enableBufferedSave, settings.syncInterval, loading, settings, entries, colors, materials, customers, materialCategories, colorCategories]);

    // Translation Helper
    const t = (key) => {
        const lang = settings.language || 'da';
        return translations[lang][key] || key;
    };

    const handleSaveEntry = (entryData) => {
        if (editingId) {
            // Update existing
            setEntries(prev => prev.map(e => e.id === editingId ? { ...e, ...entryData, id: editingId, date: e.date } : e));
            // We do NOT clear inputs here, so user can continue editing or see what they saved.
            // But we should probably exit edit mode? 
            // Let's clear edit mode but keep inputs for now, or clear everything. 
            // User request: "husker hvad der er skrevet". So let's keep it.
            // Actually, for a NEW save, we usually clear. But for edit...
            // Let's stick to standard behavior: Save = Done. 
            // But for "persistence", we keep inputs if they switch tabs. 
            // If they SAVE, it's a "submit", so we usually clear.
            setEditingId(null);
            setCalculatorInputs({
                projectName: '',
                amount1to1: 0,
                amount2to1: 0,
                customMaterials: [],
                time: 0,
                extrasCost: 0,
                packagingCost: 0,
                useDrift: true,
                useVacuum: true,
                includeLabor: true,
                includeProfit: true,
                includeBuffer: true,
                includeMoldWear: true,
                note: '',
                projectImage: null
            });
        } else {
            // Create new
            setEntries(prev => [entryData, ...prev]);
            // Clear inputs after save new
            setCalculatorInputs({
                projectName: '',
                amount1to1: 0,
                amount2to1: 0,
                customMaterials: [],
                time: 0,
                extrasCost: 0,
                packagingCost: 0,
                useVacuum: true,
                includeLabor: true,
                includeProfit: true,
                includeBuffer: true,
                includeMoldWear: true,
                note: '',
                projectImage: null
            });
        }
        setActiveTab('history');
    };

    const handleEditEntry = (entry) => {
        setCalculatorInputs({
            projectName: entry.projectName,
            amount1to1: entry.amount1to1 || 0,
            amount2to1: entry.amount2to1 || 0,
            useMultiCast: entry.useMultiCast || false,
            multiCastCount: entry.multiCastCount || 0,
            customMaterials: entry.customMaterials || [],
            projectNote: entry.projectNote || '',
            showProjectNoteOnInvoice: entry.showProjectNoteOnInvoice || false,
            isProjectNoteOpen: !!entry.projectNote, // Auto-open if there is a note
            time: entry.time || 0,
            extrasCost: entry.extrasCost || 0,
            packagingCost: entry.packagingCost || 0,
            useDrift: entry.useDrift !== undefined ? entry.useDrift : true,
            useVacuum: entry.useVacuum !== undefined ? entry.useVacuum : true,
            includeLabor: entry.includeLabor !== undefined ? entry.includeLabor : true,
            includeProfit: entry.includeProfit !== undefined ? entry.includeProfit : true,
            includeBuffer: entry.includeBuffer !== undefined ? entry.includeBuffer : true,
            includeMoldWear: entry.includeMoldWear !== undefined ? entry.includeMoldWear : true,
            note: entry.note || '',
            projectImage: entry.projectImage || null,
            rounding: entry.rounding || ''
        });
        setEditingId(entry.id);
        setActiveTab('calculator');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setCalculatorInputs({
            projectName: '',
            amount1to1: 0,
            amount2to1: 0,
            useMultiCast: false,
            multiCastCount: 0,
            customMaterials: [],
            time: 0,
            extrasCost: 0,
            packagingCost: 0,
            useDrift: true,
            useVacuum: true,
            includeLabor: true,
            includeProfit: true,
            includeBuffer: true,
            includeMoldWear: true,
            note: '',
            projectImage: null,
            rounding: ''
        });
    };

    const handleDeleteEntry = (id) => {
        if (confirm(t('confirmDelete'))) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleUpdateEntry = (id, updatedFields) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loader...</div>;
    }

    return (
        <div className="min-h-screen bg-skin-base text-skin-base-text transition-colors duration-300">
            <header className="bg-gradient-to-r from-primary to-primary-hover text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalculatorIcon size={28} />
                        {t('appTitle')}
                    </h1>
                    <nav className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('calculator')}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'calculator' ? 'bg-white text-primary font-bold shadow' : 'hover:bg-white/10 text-white'}`}
                        >
                            <CalculatorIcon size={18} />
                            <span className="hidden sm:inline">{t('tabCalculator')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-primary font-bold shadow' : 'hover:bg-white/10 text-white'}`}
                        >
                            <HistoryIcon size={18} />
                            <span className="hidden sm:inline">{t('tabHistory')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('colors')}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'colors' ? 'bg-white text-primary font-bold shadow' : 'hover:bg-white/10 text-white'}`}
                        >
                            <Palette size={18} />
                            <span className="hidden sm:inline">{t('tabColors')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'materials' ? 'bg-white text-primary font-bold shadow' : 'hover:bg-white/10 text-white'}`}
                        >
                            <Layers size={18} />
                            <span className="hidden sm:inline">{t('tabMaterials')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white text-primary font-bold shadow' : 'hover:bg-white/10 text-white'}`}
                        >
                            <SettingsIcon size={18} />
                            <span className="hidden sm:inline">{t('tabSettings')}</span>
                        </button>
                    </nav>
                </div>
            </header>

            <main className="w-full max-w-[1920px] mx-auto p-4 md:py-8">
                {activeTab === 'calculator' && (
                    <div className="w-full">
                        <Calculator
                            settings={settings}
                            onSave={handleSaveEntry}
                            t={t}
                            inputs={calculatorInputs}
                            setInputs={setCalculatorInputs}
                            isEditing={!!editingId}
                            onCancel={handleCancelEdit}
                            colors={colors}
                            materials={materials}
                        />
                    </div>
                )}
                {activeTab === 'history' && (
                    <History
                        entries={entries}
                        settings={settings}
                        setSettings={setSettings}
                        onDelete={handleDeleteEntry}
                        onEdit={handleEditEntry}
                        t={t}
                        customers={customers}
                    />
                )}
                {activeTab === 'colors' && (
                    <ColorGallery colors={colors} categories={colorCategories} t={t} currency={settings.currency || 'kr'} />
                )}
                {activeTab === 'materials' && (
                    <MaterialGallery materials={materials} categories={materialCategories} t={t} currency={settings.currency || 'kr'} />
                )}
                {activeTab === 'settings' && (
                    <Settings
                        settings={settings}
                        setSettings={setSettings}
                        t={t}
                        colors={colors}
                        setColors={setColors}
                        materials={materials}
                        setMaterials={setMaterials}
                        materialCategories={materialCategories}
                        setMaterialCategories={setMaterialCategories}
                        colorCategories={colorCategories}
                        setColorCategories={setColorCategories}
                        customers={customers} // Pass customers
                        setCustomers={setCustomers} // Pass setter
                    />
                )}
            </main>
            {/* SYNC INDICATOR */}
            {isSyncing && (
                <div className="fixed bottom-4 right-4 bg-skin-card border border-primary text-primary px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium z-50 animate-bounce-slight opacity-90">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    Syncing...
                </div>
            )}
        </div>
    );
}

export default App;

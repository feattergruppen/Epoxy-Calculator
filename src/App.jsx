import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, History as HistoryIcon, Settings as SettingsIcon, Palette, Layers } from 'lucide-react';
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
        language: getSystemLanguage(),
        currency: 'kr'
    });
    const [entries, setEntries] = useState([]);
    const [colors, setColors] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [materialCategories, setMaterialCategories] = useState(['Træ', 'Metal', 'Inserts']); // Default categories

    // Load data on mount
    useEffect(() => {
        const init = async () => {
            try {
                const data = await dataHandler.loadData();
                if (data) {
                    // Merge loaded settings with default to ensure keys exist
                    setSettings(prev => ({ ...prev, ...(data.settings || {}) }));
                    setEntries(data.entries || []);
                    setColors(data.colors || []);
                    setMaterials(data.materials || []);
                    if (data.materialCategories && data.materialCategories.length > 0) {
                        setMaterialCategories(data.materialCategories);
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

    // Auto-save on changes
    useEffect(() => {
        if (!loading) {
            const dataToSave = { settings, entries, colors, materials, materialCategories };
            dataHandler.saveData(dataToSave);
        }
    }, [settings, entries, colors, materials, materialCategories, loading]);

    // Translation Helper
    const t = (key) => {
        const lang = settings.language || 'da';
        return translations[lang][key] || key;
    };

    const handleSaveEntry = (newEntry) => {
        setEntries(prev => [newEntry, ...prev]);
        setActiveTab('history');
    };

    const handleDeleteEntry = (id) => {
        if (confirm(t('confirmDelete'))) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loader...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* HEADER / NAV */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t('appTitle')}
                            </span>
                        </div>
                        <nav className="flex space-x-4 items-center overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('calculator')}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'calculator' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <CalcIcon size={18} /> {t('tabCalculator')}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <HistoryIcon size={18} /> {t('tabHistory')} ({entries.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('colors')}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'colors' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Palette size={18} /> {t('tabColors')}
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'materials' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Layers size={18} /> {t('tabMaterials')}
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <SettingsIcon size={18} /> {t('tabSettings')}
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* CONTENT */}
            <main className="flex-1 py-8">
                {activeTab === 'calculator' && (
                    <Calculator settings={settings} onSave={handleSaveEntry} t={t} />
                )}
                {activeTab === 'history' && (
                    <History entries={entries} onDelete={handleDeleteEntry} t={t} settings={settings} />
                )}
                {activeTab === 'colors' && (
                    <ColorGallery colors={colors} t={t} />
                )}
                {activeTab === 'materials' && (
                    <MaterialGallery materials={materials} categories={materialCategories} t={t} />
                )}
                {activeTab === 'settings' && (
                    <Settings
                        settings={settings}
                        setSettings={setSettings}
                        colors={colors}
                        setColors={setColors}
                        materials={materials}
                        setMaterials={setMaterials}
                        materialCategories={materialCategories}
                        setMaterialCategories={setMaterialCategories}
                        t={t}
                    />
                )}
            </main>
        </div>
    );
}

export default App;

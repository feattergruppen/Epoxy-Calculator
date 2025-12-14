import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Layers, X, Pencil, Check, ChevronDown, ChevronRight, Download, Upload, Database, Folder, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Settings = ({
    settings, setSettings,
    colors, setColors,
    materials, setMaterials,
    materialCategories, setMaterialCategories,
    colorCategories, setColorCategories,
    t
}) => {
    const [newColor, setNewColor] = useState({ name: '', type: '', image: '', note: '' });
    const [editingColorId, setEditingColorId] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [newColorCategory, setNewColorCategory] = useState(''); // Separate state for color categories input
    const [newMaterial, setNewMaterial] = useState({ name: '', cost: '', category: '', images: [], note: '' }); // Replaced 'image' with 'images' array
    const [editingMaterialId, setEditingMaterialId] = useState(null);

    const [collapsedSections, setCollapsedSections] = useState({});
    const [currentDataPath, setCurrentDataPath] = useState('');

    React.useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.getDataPath().then(path => setCurrentDataPath(path));
        }
    }, []);

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Special handling for string fields
        const isString = name === 'language' || name === 'currency' || name === 'companyName' || name === 'theme';
        const val = isString ? value : (parseFloat(value) || 0);

        setSettings(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewColor(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveColor = () => {
        if (!newColor.name) return;
        const cat = newColor.type || (colorCategories.length > 0 ? colorCategories[0] : '');

        if (editingColorId) {
            setColors(prev => prev.map(c => c.id === editingColorId ? { ...newColor, type: cat, id: editingColorId } : c));
            setEditingColorId(null);
        } else {
            setColors(prev => [...prev, { ...newColor, type: cat, id: uuidv4() }]);
        }
        setNewColor({ name: '', type: '', image: '', note: '' });
    };

    const startEditColor = (color) => {
        setNewColor({ ...color });
        setEditingColorId(color.id);
        // Scroll to form
        document.getElementById('color-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEditColor = () => {
        setNewColor({ name: '', type: '', image: '', note: '' });
        setEditingColorId(null);
    };

    const deleteColor = (id) => {
        if (confirm(t('confirmDelete'))) {
            setColors(prev => prev.filter(c => c.id !== id));
            if (editingColorId === id) cancelEditColor();
        }
    };

    const addColorCategory = () => {
        if (!newColorCategory || colorCategories.includes(newColorCategory)) return;
        setColorCategories(prev => [...prev, newColorCategory]);
        setNewColorCategory('');
    };

    const deleteColorCategory = (cat) => {
        if (confirm(`Slet kategori "${cat}"?`)) {
            setColorCategories(prev => prev.filter(c => c !== cat));
        }
    };

    // --- MATERIALS LOGIC ---
    const addCategory = () => {
        if (!newCategory || materialCategories.includes(newCategory)) return;
        setMaterialCategories(prev => [...prev, newCategory]);
        setNewCategory('');
    };

    const deleteCategory = (cat) => {
        if (confirm(`Slet kategori "${cat}"? Alle materialer i denne kategori beholdes men mister deres kategori.`)) {
            setMaterialCategories(prev => prev.filter(c => c !== cat));
        }
    };

    const handleMatImageUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMaterial(prev => ({
                    ...prev,
                    images: [...(prev.images || []), reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewMatImage = (index) => {
        setNewMaterial(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSaveMaterial = () => {
        if (!newMaterial.name) return;

        // Default to first category if none selected
        const cat = newMaterial.category || (materialCategories.length > 0 ? materialCategories[0] : '');
        const matToSave = {
            ...newMaterial,
            category: cat,
            // Ensure backwards compatibility or migration if needed, but we rely on 'images' now
            image: newMaterial.images.length > 0 ? newMaterial.images[0] : ''
        };

        if (editingMaterialId) {
            setMaterials(prev => prev.map(m => m.id === editingMaterialId ? { ...matToSave, id: editingMaterialId } : m));
            setEditingMaterialId(null);
        } else {
            setMaterials(prev => [...prev, { ...matToSave, id: uuidv4() }]);
        }

        setNewMaterial({ name: '', cost: '', category: '', images: [], note: '' });
    };

    const startEditMaterial = (mat) => {
        setNewMaterial({
            name: mat.name,
            cost: mat.cost,
            category: mat.category,
            note: mat.note || '',
            images: mat.images || (mat.image ? [mat.image] : [])
        });
        setEditingMaterialId(mat.id);
        // Scroll to form
        document.getElementById('material-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setNewMaterial({ name: '', cost: '', category: '', images: [], note: '' });
        setEditingMaterialId(null);
    };

    const deleteMaterial = (id) => {
        if (confirm(t('confirmDelete'))) {
            setMaterials(prev => prev.filter(m => m.id !== id));
            if (editingMaterialId === id) cancelEdit();
        }
    };



    const currency = settings.currency || 'kr';

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">

            {/* DATA MANAGEMENT */}
            <section className="bg-skin-card p-6 rounded-lg shadow-sm border border-skin-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Database className="text-indigo-600" /> {t('dataManagement')}
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={async () => {
                            if (!window.electronAPI) return alert(t('msgOnlyApp'));
                            const res = await window.electronAPI.exportBackup({
                                title: t('btnExportDB')
                            });
                            if (res.success) {
                                alert(`${t('msgBackupSaved')} ${res.filePath}`);
                            } else if (res.error) {
                                alert(`${t('msgExportError')} ${res.error}`);
                            }
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded flex items-center justify-center gap-2 font-medium"
                    >
                        <Download size={20} />
                        {t('btnExportDB')}
                    </button>
                    <button
                        onClick={async () => {
                            if (!window.electronAPI) return alert(t('msgOnlyApp'));
                            if (!confirm(t('msgConfirmImport'))) return;

                            const res = await window.electronAPI.importBackup({
                                title: t('btnImportDB')
                            });
                            if (res.success) {
                                alert(t('msgImportSuccess'));
                                window.location.reload();
                            } else if (res.error) {
                                alert(`${t('msgImportError')} ${res.error}`);
                            }
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded flex items-center justify-center gap-2 font-medium"
                    >
                        <Upload size={20} />
                        {t('btnImportDB')}
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t border-skin-border">
                    <label className="block text-sm font-medium text-skin-muted mb-2">{t('lblDbLoc')}</label>
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 bg-skin-base border border-skin-border rounded p-2 text-sm text-skin-muted font-mono w-full truncate">
                            {currentDataPath || 'Loading...'}
                        </div>
                        <button
                            onClick={async () => {
                                if (!window.electronAPI) return alert(t('msgOnlyApp'));
                                const res = await window.electronAPI.changeDataPath({
                                    title: t('dialogSelectFolder'),
                                    dialogNewLoc: t('dialogNewLoc'),
                                    dialogNoDbFound: t('dialogNoDbFound'),
                                    dialogCopyAsk: t('dialogCopyAsk'),
                                    buttons: [t('btnCopyData'), t('btnStartFresh'), t('btnCancel')]
                                });
                                if (res.success) {
                                    alert(t('msgLocChanged'));
                                    window.location.reload();
                                } else if (res.error) {
                                    alert(`${t('msgLocError')} ${res.error}`);
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm whitespace-nowrap"
                        >
                            <Folder size={16} /> {t('btnChangeLoc')}
                        </button>
                    </div>
                    <p className="text-xs text-skin-muted mt-2">
                        {t('tipShared')}
                    </p>
                </div>
            </section>

            {/* COMPANY PROFILE */}
            <section className="bg-skin-card p-6 rounded-lg shadow-sm border border-skin-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {t('setProfileTitle')}
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-skin-muted">{t('setCompanyName')}</label>
                        <input
                            type="text"
                            name="companyName"
                            value={settings.companyName || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                            placeholder="F.eks. Skov Design ApS"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-skin-muted">{t('setCompanyLogo')}</label>
                        <div className="flex items-center gap-4 mt-1">
                            {settings.companyLogo ? (
                                <div className="relative group w-20 h-20 border rounded overflow-hidden">
                                    <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, companyLogo: '' }))}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 border-2 border-dashed border-skin-border rounded flex items-center justify-center text-skin-muted">
                                    <ImageIcon />
                                </div>
                            )}
                            <label className="cursor-pointer bg-skin-card border border-skin-border hover:bg-skin-base py-2 px-3 rounded flex items-center gap-2 text-sm text-skin-base-text h-10 self-center">
                                {t('btnUpload')}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setSettings(prev => ({ ...prev, companyLogo: reader.result }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Invoice Settings */}
            <section className="bg-skin-card p-6 rounded-lg shadow-sm border border-skin-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="text-primary" /> {t('setInvoiceTitle')}
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-skin-muted">{t('lblInvoiceYear')}</label>
                        <input
                            type="text"
                            value={settings.invoiceYear || new Date().getFullYear()}
                            disabled
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm p-2 border bg-skin-input text-skin-muted cursor-not-allowed"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-skin-muted">{t('lblInvoiceSeq')}</label>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-skin-muted font-mono">{settings.invoiceYear}-</span>
                            <input
                                type="number"
                                name="invoiceSeq"
                                value={settings.invoiceSeq || 1}
                                onChange={handleChange}
                                min="1"
                                className="block w-full flex-1 rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text font-mono"
                            />
                        </div>
                        <p className="text-xs text-skin-muted mt-1">{t('tipInvoiceSeq')}</p>
                    </div>
                </div>
            </section>

            {/* General Settings */}
            <section className="bg-skin-card p-6 rounded-lg shadow-sm border border-skin-border">
                <h2 className="text-xl font-bold mb-4">{t('setGlobalTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('langLabel')}</label>
                        <select
                            name="language"
                            value={settings.language}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        >
                            <option value="da">Dansk</option>
                            <option value="en">English</option>
                            <option value="sv">Svenska</option>
                            <option value="no">Norsk</option>
                            <option value="de">Deutsch</option>
                            <option value="pl">Polski</option>
                            <option value="cs">Čeština</option>
                            <option value="hu">Magyar</option>
                            <option value="ro">Română</option>
                            <option value="bg">Български</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('currLabel')}</label>
                        <select
                            name="currency"
                            value={settings.currency}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        >
                            <option value="kr">DKK / NOK / SEK (kr)</option>
                            <option value="€">Euro (€)</option>
                            <option value="$">USD ($)</option>
                            <option value="£">GBP (£)</option>
                            <option value="zł">PLN (zł)</option>
                            <option value="Kč">CZK (Kč)</option>
                            <option value="Ft">HUF (Ft)</option>
                            <option value="lei">RON (lei)</option>
                            <option value="лв">BGN (лв)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setTheme')}</label>
                        <select
                            name="theme"
                            value={settings.theme || 'light'}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        >
                            <option value="light">Lys / Light</option>
                            <option value="dark">Mørk / Dark</option>
                            <option value="ocean">Ocean</option>
                            <option value="sunset">Solnedgang / Sunset</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setPrice1')} ({currency}/kg)</label>
                        <input
                            type="number"
                            name="price1to1"
                            value={settings.price1to1}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setPrice2')} ({currency}/kg)</label>
                        <input
                            type="number"
                            name="price2to1"
                            value={settings.price2to1}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setHourly')} ({currency}/t)</label>
                        <input
                            type="number"
                            name="hourlyRate"
                            value={settings.hourlyRate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setBuffer')}</label>
                        <input
                            type="number"
                            name="buffer"
                            value={settings.buffer}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setMold')} ({currency})</label>
                        <input
                            type="number"
                            name="moldWear"
                            value={settings.moldWear}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setVacuum')} ({currency})</label>
                        <input
                            type="number"
                            name="vacuumCost"
                            value={settings.vacuumCost}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('setConsumables')} ({currency})</label>
                        <input
                            type="number"
                            name="consumables"
                            value={settings.consumables}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-skin-input text-skin-base-text"
                        />
                    </div>
                </div>
            </section>

            {/* COLOR LIBRARY */}
            <section className="bg-skin-card p-6 rounded-lg shadow-sm border border-skin-border">
                <h2 className="text-xl font-bold mb-4">{t('setColorTitle')}</h2>

                {/* Color Categories Management */}
                <div className="mb-8 bg-skin-accent p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-primary mb-2">{t('setColorCatTitle')}</h3>
                    <form
                        className="flex gap-2 mb-3"
                        onSubmit={(e) => { e.preventDefault(); addColorCategory(); }}
                    >
                        <input
                            type="text"
                            name="newColorCategory"
                            className="flex-1 rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                            placeholder={t('phNewCat')}
                            value={newColorCategory}
                            onChange={(e) => setNewColorCategory(e.target.value)}
                            autoComplete="off"
                        />
                        <button type="submit" className="bg-primary text-white px-4 rounded hover:bg-primary-hover">
                            <Plus size={16} />
                        </button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                        {colorCategories.map(cat => (
                            <span key={cat} className="bg-skin-card text-primary px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-skin-accent flex items-center gap-2">
                                {cat}
                                <button type="button" onClick={() => deleteColorCategory(cat)} className="text-primary/50 hover:text-danger"><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                </div>

                <div id="color-form" className={`flex flex-col gap-4 mb-6 p-4 rounded-lg transition-colors ${editingColorId ? 'bg-skin-accent border border-skin-border' : 'bg-skin-base'}`}>
                    {editingColorId && (
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <Pencil size={16} /> Rediger farve
                            </h3>
                            <button onClick={cancelEditColor} className="text-sm text-skin-muted hover:text-skin-base-text">Annuller</button>
                        </div>
                    )}
                    <div className="flex gap-4 items-end flex-col md:flex-row">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-skin-muted mb-1">{t('setColorName')}</label>
                            <input
                                type="text"
                                value={newColor.name}
                                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                                placeholder="F.eks. Deep Blue"
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-xs font-medium text-skin-muted mb-1">{t('setColorType')}</label>
                            <select
                                value={newColor.type}
                                onChange={(e) => setNewColor({ ...newColor, type: e.target.value })}
                                className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                            >
                                <option value="" disabled>{t('lblSelect')}</option>
                                {colorCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-skin-muted mb-1">{t('matCost')}</label>
                            <input
                                type="number"
                                value={newColor.cost || ''}
                                onChange={(e) => setNewColor({ ...newColor, cost: e.target.value })}
                                className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-medium text-skin-muted mb-1">{t('setColorNote')}</label>
                        <textarea
                            value={newColor.note}
                            onChange={(e) => setNewColor({ ...newColor, note: e.target.value })}
                            className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                            placeholder="..."
                            rows="2"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="cursor-pointer bg-skin-card border border-skin-border hover:bg-skin-base py-2 px-3 rounded flex items-center gap-2 text-sm text-skin-base-text">
                            <ImageIcon size={16} />
                            {newColor.image ? t('btnChange') : t('btnUpload')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        <button
                            onClick={handleSaveColor}
                            className={`bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium`}
                        >
                            {editingColorId ? <Check size={16} /> : <Plus size={16} />}
                            {editingColorId ? 'Gem ændringer' : t('btnAdd')}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {colorCategories.map(cat => {
                        const catColors = colors.filter(c => c.type === cat);
                        if (catColors.length === 0) return null;
                        const isCollapsed = collapsedSections[`color-${cat}`];

                        return (
                            <div key={cat} className="space-y-2">
                                <div
                                    className="flex items-center gap-2 cursor-pointer border-b pb-1 border-skin-border group"
                                    onClick={() => toggleSection(`color-${cat}`)}
                                >
                                    {isCollapsed ? <ChevronRight size={16} className="text-skin-muted group-hover:text-primary" /> : <ChevronDown size={16} className="text-skin-muted group-hover:text-primary" />}
                                    <h4 className="font-semibold text-skin-base-text select-none text-sm">
                                        {cat} ({catColors.length})
                                    </h4>
                                </div>
                                {!isCollapsed && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fadeIn">
                                        {catColors.map(color => (
                                            <div key={color.id} className="relative group bg-skin-card border border-skin-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="absolute top-1 right-1 flex gap-1  z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEditColor(color)}
                                                        className="bg-white/90 hover:bg-white text-primary p-1 rounded shadow-sm"
                                                        title="Rediger"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteColor(color.id)}
                                                        className="bg-danger hover:bg-red-600 text-white p-1 rounded shadow-sm"
                                                        title="Slet"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <div className="h-24 bg-skin-base flex items-center justify-center overflow-hidden">
                                                    {color.image ? (
                                                        <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-skin-border"><ImageIcon size={32} /></div>
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <p className="font-medium text-sm truncate text-skin-base-text" title={color.name}>{color.name}</p>
                                                    <div className="flex justify-between items-center text-xs text-skin-muted">
                                                        <span className="capitalize">
                                                            {color.type === 'pulver' ? t('typePowder') :
                                                                color.type === 'flydende' ? t('typeLiquid') :
                                                                    color.type === 'alcohol' ? t('typeAlcohol') : color.type}
                                                        </span>
                                                        {color.cost && <span className="font-mono text-primary bg-skin-accent px-1 rounded">{color.cost} {settings.currency}</span>}
                                                    </div>
                                                    {color.note && <p className="text-xs text-skin-muted mt-1 truncate" title={color.note}>📝 {color.note}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* Uncategorized Colors */}
                    {colors.filter(c => !colorCategories.includes(c.type)).length > 0 && (
                        <div className="space-y-2 mt-4">
                            <h4 className="font-semibold text-skin-muted select-none text-sm border-b pb-1 border-skin-border">{t('otherCategory') || 'Andet'}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {colors.filter(c => !colorCategories.includes(c.type)).map(color => (
                                    <div key={color.id} className="relative group bg-skin-card border border-skin-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Same actions for uncategorized */}
                                        <div className="absolute top-1 right-1 flex gap-1  z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditColor(color)} className="bg-white/90 hover:bg-white text-indigo-600 p-1 rounded shadow-sm"><Pencil size={12} /></button>
                                            <button onClick={() => deleteColor(color.id)} className="bg-red-500 hover:bg-red-600 text-white p-1 rounded shadow-sm"><Trash2 size={12} /></button>
                                        </div>
                                        <div className="h-24 bg-skin-base flex items-center justify-center overflow-hidden">
                                            {color.image ? <img src={color.image} alt={color.name} className="w-full h-full object-cover" /> : <div className="text-skin-muted"><ImageIcon size={32} /></div>}
                                        </div>
                                        <div className="p-2">
                                            <p className="font-medium text-sm truncate text-skin-base-text">{color.name}</p>
                                            <p className="text-xs text-danger">{color.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* MATERIAL LIBRARY */}
            <section className="bg-skin-card p-6 rounded-lg shadow-sm border border-skin-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Layers className="text-primary" /> {t('setMatTitle')}
                </h2>

                {/* Categories Management */}
                <div className="mb-8 bg-skin-accent p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-primary mb-2">{t('setMatCatTitle')}</h3>
                    <form
                        className="flex gap-2 mb-3"
                        onSubmit={(e) => { e.preventDefault(); addCategory(); }}
                    >
                        <input
                            type="text"
                            className="flex-1 rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                            placeholder={t('catName')}
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            autoComplete="off"
                        />
                        <button type="submit" className="bg-primary text-white px-4 rounded hover:bg-primary-hover">
                            <Plus size={16} />
                        </button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                        {materialCategories.map(cat => (
                            <span key={cat} className="bg-skin-card text-primary px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-skin-accent flex items-center gap-2">
                                {cat}
                                <button type="button" onClick={() => deleteCategory(cat)} className="text-primary/50 hover:text-danger"><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Add Material Form */}
                <div id="material-form" className={`flex flex-col gap-4 mb-6 p-4 rounded-lg transition-colors ${editingMaterialId ? 'bg-skin-accent border border-skin-border' : 'bg-skin-base'}`}>
                    {editingMaterialId && (
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <Pencil size={16} /> Rediger materiale
                            </h3>
                            <button onClick={cancelEdit} className="text-sm text-skin-muted hover:text-skin-base-text">Annuller</button>
                        </div>
                    )}
                    <div className="flex gap-4 items-end flex-col md:flex-row">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-skin-muted mb-1">{t('matName')}</label>
                            <input
                                type="text"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                                placeholder="..."
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-medium text-skin-muted mb-1">{t('matCost')}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={newMaterial.cost}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, cost: e.target.value })}
                                    className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-8 top-2 text-skin-muted text-xs pointer-events-none">
                                    {/* spacer */}
                                </span>
                            </div>
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-xs font-medium text-skin-muted mb-1">{t('matCat')}</label>
                            <select
                                value={newMaterial.category}
                                onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                                className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                            >
                                <option value="" disabled>{t('lblSelect')}</option>
                                {materialCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-medium text-skin-muted mb-1">{t('setColorNote')}</label>
                        <textarea
                            value={newMaterial.note}
                            onChange={(e) => setNewMaterial({ ...newMaterial, note: e.target.value })}
                            className="w-full rounded border-skin-border border p-2 text-sm bg-skin-input text-skin-base-text"
                            rows="2"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="cursor-pointer bg-skin-card border border-skin-border hover:bg-skin-base py-2 px-3 rounded flex items-center gap-2 text-sm text-skin-base-text">
                            <ImageIcon size={16} />
                            {newMaterial.images?.length > 0 ? (
                                <span className="flex items-center gap-1">{newMaterial.images.length} billede(r)</span>
                            ) : (
                                t('btnUpload')
                            )}
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleMatImageUpload} />
                        </label>

                        {/* Image Preview List */}
                        {(newMaterial.images || []).length > 0 && (
                            <div className="flex gap-2 overflow-x-auto py-1">
                                {newMaterial.images.map((img, idx) => (
                                    <div key={idx} className="relative w-12 h-12 flex-shrink-0 border rounded overflow-hidden group">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeNewMatImage(idx)}
                                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleSaveMaterial}
                            className={`${editingMaterialId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium`}
                        >
                            {editingMaterialId ? <Check size={16} /> : <Plus size={16} />}
                            {editingMaterialId ? 'Gem ændringer' : t('btnAdd')}
                        </button>
                    </div>
                </div>

                {/* Materials List */}
                <div className="space-y-6">
                    {materialCategories.map(cat => {
                        const catMaterials = materials.filter(m => m.category === cat);
                        if (catMaterials.length === 0) return null;
                        const isCollapsed = collapsedSections[`mat-${cat}`];

                        return (
                            <div key={cat} className="space-y-2">
                                <div
                                    className="flex items-center gap-2 cursor-pointer border-b pb-1 border-skin-border group"
                                    onClick={() => toggleSection(`mat-${cat}`)}
                                >
                                    {isCollapsed ? <ChevronRight size={16} className="text-skin-muted group-hover:text-primary" /> : <ChevronDown size={16} className="text-skin-muted group-hover:text-primary" />}
                                    <h4 className="font-semibold text-skin-base-text select-none text-sm">
                                        {cat} ({catMaterials.length})
                                    </h4>
                                </div>
                                {!isCollapsed && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fadeIn">
                                        {catMaterials.map(mat => (
                                            <div key={mat.id} className="relative group bg-skin-card border border-skin-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="absolute top-1 right-1 flex gap-1  z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEditMaterial(mat)}
                                                        className="bg-white/90 hover:bg-white text-primary p-1 rounded shadow-sm"
                                                        title="Rediger"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMaterial(mat.id)}
                                                        className="bg-danger hover:bg-red-600 text-white p-1 rounded shadow-sm"
                                                        title="Slet"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <div className="h-24 bg-skin-base flex items-center justify-center overflow-hidden">
                                                    {mat.images && mat.images.length > 0 ? (
                                                        <div className="w-full h-full relative">
                                                            <img src={mat.images[0]} alt={mat.name} className="w-full h-full object-cover" />
                                                            {mat.images.length > 1 && (
                                                                <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-1 m-1 rounded">
                                                                    +{mat.images.length - 1}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : mat.image ? (
                                                        <img src={mat.image} alt={mat.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-gray-300"><ImageIcon size={32} /></div>
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <p className="font-medium text-sm truncate" title={mat.name}>{mat.name}</p>
                                                    <div className="flex justify-between items-center text-xs mt-1">
                                                        <span className="text-indigo-600 font-semibold truncate max-w-[50%]">{mat.category}</span>
                                                        {mat.cost && <span className="text-gray-600 font-mono">{mat.cost} {currency}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* Uncategorized Materials */}
                    {materials.filter(m => !materialCategories.includes(m.category)).length > 0 && (
                        <div className="space-y-2 mt-4">
                            <h4 className="font-semibold text-gray-700 select-none text-sm border-b pb-1 border-gray-200">{t('otherCategory') || 'Andet'}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {materials.filter(m => !materialCategories.includes(m.category)).map(mat => (
                                    <div key={mat.id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Same actions for uncategorized */}
                                        <div className="absolute top-1 right-1 flex gap-1  z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditMaterial(mat)} className="bg-white/90 hover:bg-white text-indigo-600 p-1 rounded shadow-sm"><Pencil size={12} /></button>
                                            <button onClick={() => deleteMaterial(mat.id)} className="bg-red-500 hover:bg-red-600 text-white p-1 rounded shadow-sm"><Trash2 size={12} /></button>
                                        </div>
                                        <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {mat.images && mat.images.length > 0 ? (
                                                <div className="w-full h-full relative">
                                                    <img src={mat.images[0]} alt={mat.name} className="w-full h-full object-cover" />
                                                    {mat.images.length > 1 && (
                                                        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-1 m-1 rounded">
                                                            +{mat.images.length - 1}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : mat.image ? (
                                                <img src={mat.image} alt={mat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-gray-300"><ImageIcon size={32} /></div>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <p className="font-medium text-sm truncate">{mat.name}</p>
                                            <div className="flex justify-between items-center text-xs mt-1">
                                                <span className="text-indigo-600 font-semibold truncate max-w-[50%]">{mat.category}</span>
                                                {mat.cost && <span className="text-gray-600 font-mono">{mat.cost} {currency}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Settings;

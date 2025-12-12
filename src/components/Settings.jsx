import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Layers, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Settings = ({
    settings, setSettings,
    colors, setColors,
    materials, setMaterials,
    materialCategories, setMaterialCategories,
    t
}) => {
    const [newColor, setNewColor] = useState({ name: '', type: 'pulver', image: '', note: '' });
    const [newCategory, setNewCategory] = useState('');
    const [newMaterial, setNewMaterial] = useState({ name: '', cost: '', category: '', image: '', note: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Special handling for string fields
        const isString = name === 'language' || name === 'currency';
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

    const addColor = () => {
        if (!newColor.name) return;
        setColors(prev => [...prev, { ...newColor, id: uuidv4() }]);
        setNewColor({ name: '', type: 'pulver', image: '', note: '' });
    };

    const deleteColor = (id) => {
        setColors(prev => prev.filter(c => c.id !== id));
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
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMaterial(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addMaterial = () => {
        if (!newMaterial.name) return;
        // Default to first category if none selected
        const cat = newMaterial.category || (materialCategories.length > 0 ? materialCategories[0] : '');
        setMaterials(prev => [...prev, { ...newMaterial, category: cat, id: uuidv4() }]);
        setNewMaterial({ name: '', cost: '', category: '', image: '', note: '' });
    };

    const deleteMaterial = (id) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
    };



    const currency = settings.currency || 'kr';

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">

            {/* COMPANY PROFILE */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {t('setProfileTitle')}
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">{t('setCompanyName')}</label>
                        <input
                            type="text"
                            name="companyName"
                            value={settings.companyName || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="F.eks. Skov Design ApS"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">{t('setCompanyLogo')}</label>
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
                                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
                                    <ImageIcon />
                                </div>
                            )}
                            <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded flex items-center gap-2 text-sm text-gray-700 h-10 self-center">
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

            {/* GLOBAL SETTINGS */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {t('setGlobalTitle')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Sprog */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('langLabel')}</label>
                        <select
                            name="language"
                            value={settings.language || 'da'}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
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

                    {/* Valuta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('currLabel')}</label>
                        <select
                            name="currency"
                            value={settings.currency || 'kr'}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
                        >
                            <option value="kr">DKK (kr)</option>
                            <option value="$">USD ($)</option>
                            <option value="€">EUR (€)</option>
                            <option value="£">GBP (£)</option>
                            <option value="SEK">SEK</option>
                            <option value="NOK">NOK</option>
                            <option value="zł">PLN (zł)</option>
                            <option value="CHF">CHF</option>
                            <option value="Kč">CZK (Kč)</option>
                            <option value="Ft">HUF (Ft)</option>
                            <option value="lei">RON (lei)</option>
                            <option value="лв">BGN (лв)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('setPrice1')} ({currency}/kg)</label>
                        <input
                            type="number"
                            name="price1to1"
                            value={settings.price1to1}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('setPrice2')} ({currency}/kg)</label>
                        <input
                            type="number"
                            name="price2to1"
                            value={settings.price2to1}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('setHourly')} ({currency}/t)</label>
                        <input
                            type="number"
                            name="hourlyRate"
                            value={settings.hourlyRate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('setBuffer')}</label>
                        <input
                            type="number"
                            name="buffer"
                            value={settings.buffer}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('setMold')} ({currency})</label>
                        <input
                            type="number"
                            name="moldWear"
                            value={settings.moldWear}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('setVacuum')} ({currency})</label>
                        <input
                            type="number"
                            name="vacuumCost"
                            value={settings.vacuumCost}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('setConsumables')} ({currency})</label>
                        <input
                            type="number"
                            name="consumables"
                            value={settings.consumables}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>
            </section>

            {/* COLOR LIBRARY */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">{t('setColorTitle')}</h2>

                <div className="flex flex-col gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex gap-4 items-end flex-col md:flex-row">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('setColorName')}</label>
                            <input
                                type="text"
                                value={newColor.name}
                                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                className="w-full rounded border-gray-300 border p-2 text-sm"
                                placeholder="F.eks. Deep Blue"
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('setColorType')}</label>
                            <select
                                value={newColor.type}
                                onChange={(e) => setNewColor({ ...newColor, type: e.target.value })}
                                className="w-full rounded border-gray-300 border p-2 text-sm"
                            >
                                <option value="pulver">{t('typePowder')}</option>
                                <option value="flydende">{t('typeLiquid')}</option>
                                <option value="alcohol">{t('typeAlcohol')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('setColorNote')}</label>
                        <textarea
                            value={newColor.note}
                            onChange={(e) => setNewColor({ ...newColor, note: e.target.value })}
                            className="w-full rounded border-gray-300 border p-2 text-sm"
                            placeholder="..."
                            rows="2"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded flex items-center gap-2 text-sm text-gray-700">
                            <ImageIcon size={16} />
                            {newColor.image ? t('btnChange') : t('btnUpload')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        <button
                            onClick={addColor}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus size={16} /> {t('btnAdd')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {colors.map(color => (
                        <div key={color.id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <button
                                onClick={() => deleteColor(color.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <Trash2 size={12} />
                            </button>
                            <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                                {color.image ? (
                                    <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-300"><ImageIcon size={32} /></div>
                                )}
                            </div>
                            <div className="p-2">
                                <p className="font-medium text-sm truncate" title={color.name}>{color.name}</p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {color.type === 'pulver' ? t('typePowder') :
                                        color.type === 'flydende' ? t('typeLiquid') :
                                            color.type === 'alcohol' ? t('typeAlcohol') : color.type}
                                </p>
                                {color.note && <p className="text-xs text-gray-400 mt-1 truncate" title={color.note}>📝 {color.note}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* MATERIAL LIBRARY */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Layers className="text-indigo-600" /> {t('setMatTitle')}
                </h2>

                {/* Categories Management */}
                <div className="mb-8 bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-indigo-900 mb-2">{t('setMatCatTitle')}</h3>
                    <form
                        className="flex gap-2 mb-3"
                        onSubmit={(e) => { e.preventDefault(); addCategory(); }}
                    >
                        <input
                            type="text"
                            className="flex-1 rounded border-indigo-200 border p-2 text-sm"
                            placeholder={t('catName')}
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            autoComplete="off"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700">
                            <Plus size={16} />
                        </button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                        {materialCategories.map(cat => (
                            <span key={cat} className="bg-white text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-indigo-100 flex items-center gap-2">
                                {cat}
                                <button type="button" onClick={() => deleteCategory(cat)} className="text-indigo-400 hover:text-red-500"><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Add Material Form */}
                <div className="flex flex-col gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex gap-4 items-end flex-col md:flex-row">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('matName')}</label>
                            <input
                                type="text"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                className="w-full rounded border-gray-300 border p-2 text-sm"
                                placeholder="..."
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('matCost')}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={newMaterial.cost}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, cost: e.target.value })}
                                    className="w-full rounded border-gray-300 border p-2 text-sm"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-8 top-2 text-gray-400 text-xs pointer-events-none">
                                    {/* spacer */}
                                </span>
                            </div>
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('matCat')}</label>
                            <select
                                value={newMaterial.category}
                                onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                                className="w-full rounded border-gray-300 border p-2 text-sm"
                            >
                                <option value="" disabled>Vælg...</option>
                                {materialCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('setColorNote')}</label>
                        <textarea
                            value={newMaterial.note}
                            onChange={(e) => setNewMaterial({ ...newMaterial, note: e.target.value })}
                            className="w-full rounded border-gray-300 border p-2 text-sm"
                            rows="2"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded flex items-center gap-2 text-sm text-gray-700">
                            <ImageIcon size={16} />
                            {newMaterial.image ? t('btnChange') : t('btnUpload')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleMatImageUpload} />
                        </label>

                        <button
                            onClick={addMaterial}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus size={16} /> {t('btnAdd')}
                        </button>
                    </div>
                </div>

                {/* Materials List */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {materials.map(mat => (
                        <div key={mat.id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <button
                                onClick={() => deleteMaterial(mat.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <Trash2 size={12} />
                            </button>
                            <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                                {mat.image ? (
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
            </section>
        </div>
    );
};

export default Settings;

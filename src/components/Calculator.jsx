import React, { useState, useEffect, useRef } from 'react';
import { Calculator as CalcIcon, Save, DollarSign, Trash2, Image as ImageIcon, X, Plus } from 'lucide-react';
import { calculateCost } from '../utils/calculations';

const Calculator = ({ settings, onSave, t, inputs, setInputs, isEditing, onCancel, colors = [], materials = [] }) => {
    // Internal state removed, using props


    const [results, setResults] = useState(null);

    useEffect(() => {
        setResults(calculateCost(inputs, settings));
    }, [inputs, settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked) : (value)
        }));
    };

    // Specific handler to ensure no interference
    const handleNameChange = (e) => {
        setInputs(prev => ({ ...prev, projectName: e.target.value }));
    };

    // Custom Materials Handlers
    const addMaterial = () => {
        setInputs(prev => ({
            ...prev,
            customMaterials: [...prev.customMaterials, { id: Date.now(), name: '', cost: 0, quantity: 1, unitPrice: 0, type: 'material', isSystemItem: false, note: '', showOnInvoice: false, isNoteOpen: false }]
        }));
    };

    const removeMaterial = (id) => {
        setInputs(prev => ({
            ...prev,
            customMaterials: prev.customMaterials.filter(m => m.id !== id)
        }));
    };

    const updateMaterial = (id, field, value) => {
        setInputs(prev => ({
            ...prev,
            customMaterials: prev.customMaterials.map(m => {
                if (m.id !== id) return m;
                if (field === 'all') return { ...m, ...value }; // Handle bulk update
                return { ...m, [field]: value };
            })
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setInputs(prev => ({ ...prev, projectImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setInputs(prev => ({ ...prev, projectImage: null }));
    };

    const handleDriftChange = (e) => {
        const isChecked = e.target.checked;
        setInputs(prev => ({
            ...prev,
            useDrift: isChecked,
            useVacuum: isChecked,
            includeBuffer: isChecked,
            includeMoldWear: isChecked,
            includeLabor: isChecked
        }));
    };

    const handleSave = () => {
        if (!inputs.projectName) {
            alert(t('alertNoName'));
            return;
        }

        // Create entry object
        const entry = {
            id: Date.now(),
            date: new Date().toLocaleDateString('da-DK'),
            timestamp: new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }),
            projectName: inputs.projectName,
            ...inputs,
            amount1to1: parseFloat(inputs.amount1to1) || 0,
            amount2to1: parseFloat(inputs.amount2to1) || 0,
            time: parseFloat(inputs.time) || 0,
            extrasCost: parseFloat(inputs.extrasCost) || 0,
            packagingCost: parseFloat(inputs.packagingCost) || 0,
            results: results
        };

        onSave(entry);
        // Clearing is now handled by parent


    };

    if (!results) return null;

    const cur = settings.currency || 'kr';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 max-w-[1920px] mx-auto">

            {/* INPUTS */}
            <div className="space-y-6 bg-skin-card p-6 rounded-xl shadow-sm border border-skin-border lg:col-span-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-skin-base-text">
                    <CalcIcon className="text-primary" /> {t('calcTitle')}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('projectName')}</label>
                        <input
                            type="text"
                            name="projectName"
                            value={inputs.projectName}
                            onChange={handleNameChange}
                            autoComplete="off"
                            className="mt-1 w-full rounded-md border-skin-border border p-2 focus:ring-primary focus:border-primary bg-skin-input text-skin-base-text"
                            placeholder={t('projectNamePlaceholder')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-skin-muted">{t('amount1to1')}</label>
                            <input type="number" name="amount1to1" value={inputs.amount1to1} onChange={handleChange} className="mt-1 w-full rounded border-skin-border border p-2 bg-skin-input text-skin-base-text" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-skin-muted">{t('amount2to1')}</label>
                            <input type="number" name="amount2to1" value={inputs.amount2to1} onChange={handleChange} className="mt-1 w-full rounded border-skin-border border p-2 bg-skin-input text-skin-base-text" />
                        </div>
                    </div>

                    {/* CUSTOM MATERIALS */}
                    <div className="bg-skin-base p-4 rounded-lg border border-skin-border space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-skin-base-text">{t('addMat')}</label>
                            <button onClick={addMaterial} className="text-primary hover:text-primary-hover text-sm font-bold flex items-center gap-1">
                                + {t('addMat')}
                            </button>
                        </div>

                        {inputs.customMaterials.map((mat) => (
                            <MaterialItem
                                key={mat.id}
                                material={mat}
                                updateMaterial={updateMaterial}
                                removeMaterial={removeMaterial}
                                t={t}
                                currency={cur}
                                suggestions={[
                                    ...materials.map(m => ({ type: 'material', name: m.name, cost: m.cost, category: m.category })),
                                    ...colors.map(c => ({ type: 'color', name: c.name, category: c.type, cost: c.cost }))
                                ]}
                            />
                        ))}
                        {inputs.customMaterials.length === 0 && (
                            <p className="text-xs text-skin-muted italic">Tryk på + for at tilføje f.eks. træ, inserts eller pigment.</p>
                        )}
                    </div>
                    {/* IMAGE UPLOAD */}
                    <div className="bg-skin-base p-4 rounded-lg border border-skin-border">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-skin-base-text flex items-center gap-2">
                                <ImageIcon size={16} /> {t('calcImage')}
                            </label>
                            {inputs.projectImage && (
                                <button onClick={removeImage} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                                    <X size={14} /> {t('removeImage')}
                                </button>
                            )}
                        </div>

                        {inputs.projectImage ? (
                            <div className="relative h-40 w-full rounded-lg overflow-hidden border border-skin-border group">
                                <img src={inputs.projectImage} alt="Project" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100">
                                        {t('changeImage')}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-skin-border rounded-lg cursor-pointer hover:border-primary hover:bg-skin-accent transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <p className="text-xs text-skin-muted">{t('uploadImagePrompt')}</p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-skin-muted">{t('time')}</label>
                            <input type="number" name="time" value={inputs.time} onChange={handleChange} className="mt-1 w-full rounded border-skin-border border p-2 bg-skin-input text-skin-base-text" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-skin-muted">{t('extras')} ({cur})</label>
                            <input type="number" name="extrasCost" value={inputs.extrasCost} onChange={handleChange} className="mt-1 w-full rounded border-skin-border border p-2 bg-skin-input text-skin-base-text" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-skin-muted">{t('packaging')} ({cur})</label>
                            <input type="number" name="packagingCost" value={inputs.packagingCost} onChange={handleChange} className="mt-1 w-full rounded border-skin-border border p-2 bg-skin-input text-skin-base-text" />
                        </div>
                    </div>

                    <div className="border-t border-skin-border pt-4 space-y-3">
                        {/* Multiple Castings */}
                        <div className="flex items-center justify-between bg-skin-base/50 p-2 rounded-lg">
                            <label className="flex items-center space-x-2 text-sm text-skin-base-text cursor-pointer flex-1">
                                <input type="checkbox" name="useMultiCast" checked={inputs.useMultiCast} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                                <span>{t('useMultiCast')}</span>
                            </label>
                            {inputs.useMultiCast && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-sm text-skin-muted">{t('multiCastCount')}:</span>
                                    <input
                                        type="number"
                                        name="multiCastCount"
                                        value={inputs.multiCastCount}
                                        onChange={handleChange}
                                        className="w-16 rounded border-skin-border border p-1 bg-skin-input text-skin-base-text text-sm text-center"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Drift Master */}
                        <div className="border-t border-skin-border pt-2">
                            <label className="flex items-center space-x-2 text-sm font-bold text-skin-base-text cursor-pointer hover:bg-skin-base p-2 rounded">
                                <input type="checkbox" name="useDrift" checked={inputs.useDrift} onChange={handleDriftChange} className="rounded text-primary focus:ring-primary" />
                                <span>{t('useDrift')}</span>
                            </label>

                            {/* Sub options */}
                            <div className={`grid grid-cols-2 gap-2 pl-6 mt-1 transition-all duration-300 ${inputs.useDrift ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <label className="flex items-center space-x-2 text-sm text-skin-base-text cursor-pointer hover:bg-skin-base p-2 rounded">
                                    <input type="checkbox" name="useVacuum" checked={inputs.useVacuum} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                                    <span>{t('lblUseVacuum')}</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-skin-base-text cursor-pointer hover:bg-skin-base p-2 rounded">
                                    <input type="checkbox" name="includeLabor" checked={inputs.includeLabor} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                                    <span>{t('lblIncludeLabor')}</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-skin-base-text cursor-pointer hover:bg-skin-base p-2 rounded">
                                    <input type="checkbox" name="includeBuffer" checked={inputs.includeBuffer} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                                    <span>{t('lblIncludeBuffer')}</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-skin-base-text cursor-pointer hover:bg-skin-base p-2 rounded">
                                    <input type="checkbox" name="includeMoldWear" checked={inputs.includeMoldWear} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                                    <span>{t('lblIncludeMoldWear')}</span>
                                </label>
                            </div>
                        </div>

                        <label className="flex items-center space-x-2 text-sm text-skin-base-text cursor-pointer hover:bg-skin-base p-2 rounded pt-2 border-t border-skin-border">
                            <input type="checkbox" name="includeProfit" checked={inputs.includeProfit} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                            <span>{t('includeProfit')}</span>
                        </label>
                    </div>

                    {/* ROUNDING */}
                    <div>
                        <label className="block text-sm font-medium text-skin-muted">{t('lblRounding')}</label>
                        <p className="text-xs text-skin-muted mb-1">{t('tipRounding')}</p>
                        <input
                            type="text"
                            name="rounding"
                            value={inputs.rounding || ''}
                            onChange={handleChange}
                            placeholder="-10% / -50 / 100"
                            className="mt-1 w-full rounded-md border-skin-border border p-2 focus:ring-primary focus:border-primary font-mono bg-skin-input text-skin-base-text"
                        />
                    </div>

                    {/* PROJECT NOTE */}
                    <div className="pt-2">
                        <button
                            onClick={() => setInputs(prev => ({ ...prev, isProjectNoteOpen: !prev.isProjectNoteOpen }))}
                            className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                        >
                            <Plus size={16} /> {t('lblProjectNote')}
                        </button>

                        {inputs.isProjectNoteOpen && (
                            <div className="mt-2 p-3 bg-skin-base rounded-md border border-skin-border animate-in fade-in slide-in-from-top-2">
                                <textarea
                                    value={inputs.projectNote || ''}
                                    onChange={(e) => setInputs(prev => ({ ...prev, projectNote: e.target.value }))}
                                    className="w-full text-sm rounded border-skin-border border p-2 bg-skin-input text-skin-base-text mb-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder={t('phNote')}
                                    rows={3}
                                />
                                <label className="flex items-center space-x-2 text-sm text-skin-muted cursor-pointer hover:text-skin-base-text">
                                    <input
                                        type="checkbox"
                                        checked={inputs.showProjectNoteOnInvoice || false}
                                        onChange={(e) => setInputs(prev => ({ ...prev, showProjectNoteOnInvoice: e.target.checked }))}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span>{t('lblShowOnInvoice')}</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RESULTS */}
            <div className="space-y-6">
                <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <DollarSign className="text-green-400" /> {t('resultsTitle')}
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-gray-300">
                            <span>{t('resMaterial')}</span>
                            <span className="font-mono text-lg">{results.material.toFixed(2)} {cur}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-300">
                            <span>{t('resOps')}</span>
                            <span className="font-mono text-lg">{results.operations.toFixed(2)} {cur}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-300">
                            <span>{t('resLabor')}</span>
                            <span className="font-mono text-lg">{results.labor.toFixed(2)} {cur}</span>
                        </div>

                        {results.rounding !== 0 && (
                            <div className="flex justify-between items-center text-yellow-400">
                                <span>{t('resRounding')}</span>
                                <span className="font-mono text-lg">{results.rounding > 0 ? '+' : ''}{results.rounding.toFixed(2)} {cur}</span>
                            </div>
                        )}

                        <div className="h-px bg-gray-700 my-4"></div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">{t('resCost')}</span>
                            <span className="font-mono text-2xl font-bold">{results.total.toFixed(2)} {cur}</span>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-green-400 font-bold uppercase tracking-wide">{t('resSales')}</span>
                                <span className="font-mono text-4xl font-bold text-green-400">{results.sales.toFixed(2)} {cur}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl shadow-lg font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Save /> {isEditing ? t('btnUpdate') : t('saveBtn')}
                </button>
                {isEditing && (
                    <button
                        onClick={onCancel}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl shadow font-bold text-lg flex items-center justify-center gap-2"
                    >
                        {t('btnCancelEdit')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Calculator;

const MaterialItem = ({ material, updateMaterial, removeMaterial, t, currency, suggestions = [] }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Filter suggestions based on input
    const filteredSuggestions = material.name
        ? suggestions.filter(s => s.name.toLowerCase().includes(material.name.toLowerCase()))
        : suggestions; // Show all if empty

    const handleSelect = (item) => {
        // When selecting an item, we lock the unit price if it's a system item (has an ID from settings)
        // For simplicity, we assume any suggestion selected is a "system item" and set its price.
        // If user wants to override, they can't unless we add an override toggle.
        // User req: "Price per unit shouldn't change if it's already in the system".

        updateMaterial(material.id, 'all', {
            name: item.name,
            type: item.type || 'material',
            category: item.category || '',
            unitPrice: item.cost || 0, // Set unit price from item
            quantity: 1, // Default to 1
            cost: (item.cost || 0) * 1, // Calculate total
            isSystemItem: true // Flag to lock price
        });
        setShowSuggestions(false);
    };

    const handleQtyChange = (val) => {
        const qty = parseFloat(val) || 0;
        const total = qty * (material.unitPrice || 0);
        updateMaterial(material.id, 'all', {
            quantity: qty,
            cost: total
        });
    };

    const handlePriceChange = (val) => {
        const price = parseFloat(val) || 0;
        const total = (material.quantity || 0) * price;
        updateMaterial(material.id, 'all', {
            unitPrice: price,
            cost: total
        });
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to format currency
    const fmt = (num) => parseFloat(num || 0).toFixed(2);

    return (
        <div className="flex flex-col md:flex-row gap-4 items-start mb-3 bg-skin-base p-3 rounded-lg border border-skin-border relative group">
            {/* NAME INPUT */}
            <div className="flex-1 relative w-full" ref={wrapperRef}>
                <label className="block text-sm font-medium text-skin-muted mb-1">{t('matName')}</label>
                <input
                    type="text"
                    value={material.name}
                    onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary p-2 bg-skin-input text-skin-base-text"
                    placeholder={t('phMatName')}
                    autoComplete="off"
                />

                {/* Note Toggle */}
                <button
                    onClick={() => updateMaterial(material.id, 'isNoteOpen', !material.isNoteOpen)}
                    className="text-xs text-primary hover:text-primary-hover underline mt-1 flex items-center gap-1"
                >
                    <Plus size={12} /> {t('btnNote')}
                </button>

                {/* Note Section */}
                {material.isNoteOpen && (
                    <div className="mt-2 p-2 bg-skin-accent rounded-md border border-skin-border animate-in fade-in slide-in-from-top-1">
                        <textarea
                            value={material.note || ''}
                            onChange={(e) => updateMaterial(material.id, 'note', e.target.value)}
                            className="w-full text-sm rounded border-skin-border border p-1 bg-skin-input text-skin-base-text mb-2"
                            placeholder={t('phNote')}
                            rows={2}
                        />
                        <label className="flex items-center space-x-2 text-xs text-skin-muted cursor-pointer">
                            <input
                                type="checkbox"
                                checked={material.showOnInvoice || false}
                                onChange={(e) => updateMaterial(material.id, 'showOnInvoice', e.target.checked)}
                                className="rounded text-primary focus:ring-primary"
                            />
                            <span>{t('lblShowOnInvoice')}</span>
                        </label>
                    </div>
                )}

                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-skin-card mt-1 rounded-md shadow-lg border border-skin-border max-h-60 overflow-auto">
                        {filteredSuggestions.map((item, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-skin-accent cursor-pointer border-b border-skin-border last:border-0 flex justify-between items-center"
                                onClick={() => handleSelect(item)}
                            >
                                <span className="text-skin-base-text font-medium">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    {item.category && (
                                        <span className="text-xs bg-skin-base text-skin-muted px-2 py-0.5 rounded-full border border-skin-border">
                                            {item.type === 'material' ? `Mat / ${item.category}` : `${t('tabColors')} / ${item.category}`}
                                        </span>
                                    )}
                                    <span className="text-xs font-mono text-skin-muted">
                                        {item.cost > 0 ? `${item.cost} ${currency}` : ''}
                                    </span>
                                    {item.type === 'color' && (
                                        <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-pink-500 to-primary"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QUANTITY */}
            <div className="w-full md:w-24">
                <label className="block text-sm font-medium text-skin-muted mb-1">{t('matQuantity')}</label>
                <input
                    type="number"
                    value={material.quantity || ''}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    className="w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary p-2 bg-skin-input text-skin-base-text text-center"
                    placeholder="1"
                />
            </div>

            {/* UNIT PRICE */}
            <div className="w-full md:w-28">
                <label className="block text-sm font-medium text-skin-muted mb-1">{t('matUnitPrice')}</label>
                <input
                    type="number"
                    value={material.unitPrice || ''}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    disabled={material.isSystemItem} // Lock if system item
                    className={`w-full rounded-md border-skin-border shadow-sm focus:border-primary focus:ring-primary p-2 bg-skin-input text-skin-base-text text-right ${material.isSystemItem ? 'bg-skin-base/50 text-skin-muted cursor-not-allowed' : ''}`}
                    placeholder="0.00"
                />
            </div>

            {/* TOTAL (Read Only) */}
            <div className="w-full md:w-28">
                <label className="block text-sm font-medium text-skin-muted mb-1">{t('matTotal')}</label>
                <div className="w-full p-2 bg-skin-accent rounded-md text-right font-mono text-skin-base-text border border-skin-border">
                    {fmt(material.cost)} {currency}
                </div>
            </div>

            {/* Remove Button */}
            <div className="flex items-end mt-7">
                <button
                    onClick={() => removeMaterial(material.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-md transition-colors"
                    title={t('btnRemove')}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

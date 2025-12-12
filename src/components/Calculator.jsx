import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Save, DollarSign, Trash2 } from 'lucide-react';
import { calculateCost } from '../utils/calculations';

const Calculator = ({ settings, onSave, t }) => {
    const [inputs, setInputs] = useState({
        projectName: '',
        amount1to1: 0,
        amount2to1: 0,
        customMaterials: [], // {id, name, cost}
        time: 0,
        extrasCost: 0,
        packagingCost: 0,
        useVacuum: true,
        includeLabor: true,
        includeProfit: true,
        includeBuffer: true,
        includeMoldWear: true,
        note: ''
    });

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
            customMaterials: [...prev.customMaterials, { id: Date.now(), name: '', cost: '' }]
        }));
    };

    const removeMaterial = (id) => {
        setInputs(prev => ({
            ...prev,
            customMaterials: prev.customMaterials.filter(m => m.id !== id)
        }));
    };

    const updateMaterial = (id, field, val) => {
        setInputs(prev => ({
            ...prev,
            customMaterials: prev.customMaterials.map(m =>
                m.id === id ? { ...m, [field]: val } : m
            )
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

        setInputs(prev => ({
            ...prev,
            projectName: '',
            amount1to1: 0,
            amount2to1: 0,
            customMaterials: [],
            time: 0,
            extrasCost: 0,
            packagingCost: 0,
            note: ''
        }));
    };

    if (!results) return null;

    const cur = settings.currency || 'kr';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 max-w-6xl mx-auto">

            {/* INPUTS */}
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <CalcIcon className="text-indigo-600" /> {t('calcTitle')}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('projectName')}</label>
                        <input
                            type="text"
                            name="projectName"
                            value={inputs.projectName}
                            onChange={handleNameChange}
                            autoComplete="off"
                            className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={t('projectNamePlaceholder')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('amount1to1')}</label>
                            <input type="number" name="amount1to1" value={inputs.amount1to1} onChange={handleChange} className="mt-1 w-full rounded border-gray-300 border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('amount2to1')}</label>
                            <input type="number" name="amount2to1" value={inputs.amount2to1} onChange={handleChange} className="mt-1 w-full rounded border-gray-300 border p-2" />
                        </div>
                    </div>

                    {/* CUSTOM MATERIALS */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">{t('addMat')}</label>
                            <button onClick={addMaterial} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1">
                                + {t('addMat')}
                            </button>
                        </div>

                        {inputs.customMaterials.map((mat, index) => (
                            <div key={mat.id} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder={t('matName')}
                                    value={mat.name}
                                    onChange={(e) => updateMaterial(mat.id, 'name', e.target.value)}
                                    className="flex-1 rounded border-gray-300 border p-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder={t('matCost')}
                                    value={mat.cost}
                                    onChange={(e) => updateMaterial(mat.id, 'cost', e.target.value)}
                                    className="w-24 rounded border-gray-300 border p-2 text-sm"
                                />
                                <span className="text-gray-500 text-sm">{cur}</span>
                                <button onClick={() => removeMaterial(mat.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {inputs.customMaterials.length === 0 && (
                            <p className="text-xs text-gray-400 italic">Tryk på + for at tilføje f.eks. træ, inserts eller pigment.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('time')}</label>
                            <input type="number" name="time" value={inputs.time} onChange={handleChange} className="mt-1 w-full rounded border-gray-300 border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('extras')} ({cur})</label>
                            <input type="number" name="extrasCost" value={inputs.extrasCost} onChange={handleChange} className="mt-1 w-full rounded border-gray-300 border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('packaging')} ({cur})</label>
                            <input type="number" name="packagingCost" value={inputs.packagingCost} onChange={handleChange} className="mt-1 w-full rounded border-gray-300 border p-2" />
                        </div>
                    </div>

                    <div className="border-t pt-4 grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="useVacuum" checked={inputs.useVacuum} onChange={handleChange} className="rounded text-indigo-600" />
                            <span>{t('useVacuum')}</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="includeLabor" checked={inputs.includeLabor} onChange={handleChange} className="rounded text-indigo-600" />
                            <span>{t('includeLabor')}</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="includeBuffer" checked={inputs.includeBuffer} onChange={handleChange} className="rounded text-indigo-600" />
                            <span>{t('includeBuffer')} ({settings.buffer}%)?</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="includeMoldWear" checked={inputs.includeMoldWear} onChange={handleChange} className="rounded text-indigo-600" />
                            <span>{t('includeMoldWear')}</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded col-span-2">
                            <input type="checkbox" name="includeProfit" checked={inputs.includeProfit} onChange={handleChange} className="rounded text-indigo-600" />
                            <span>{t('includeProfit')}</span>
                        </label>
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
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl shadow-lg font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Save /> {t('saveBtn')}
                </button>
            </div>
        </div>
    );
};

export default Calculator;

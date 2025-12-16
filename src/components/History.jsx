
import React, { useState } from 'react';
import { Trash2, FileText, TrendingUp, Package, DollarSign, Image as ImageIcon, Pencil, Clock, History as HistoryIcon, CheckSquare, Square } from 'lucide-react';
import { generateInvoice } from '../utils/pdfGenerator';

const History = ({ entries, onDelete, onUpdate, t, settings, setSettings, onEdit, customers }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceNumInput, setInvoiceNumInput] = useState('');
    const [customerDetails, setCustomerDetails] = useState({ name: '', address: '', zipCity: '', ref: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    // Sorting Logic
    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        // Expects DD.MM.YYYY
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return new Date(0);
    };

    const sortedEntries = [...entries].sort((a, b) => {
        let valA, valB;

        switch (sortConfig.key) {
            case 'price':
                valA = a.results?.sales || 0;
                valB = b.results?.sales || 0;
                break;
            case 'name':
                valA = (a.projectName || '').toLowerCase();
                valB = (b.projectName || '').toLowerCase();
                break;
            case 'date':
            default:
                valA = parseDate(a.date).getTime();
                valB = parseDate(b.date).getTime();
                break;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSortChange = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === sortedEntries.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedEntries.map(e => e.id));
        }
    };

    const prepareInvoice = (singleId = null) => {
        if (singleId) {
            setSelectedIds([singleId]);
        } else if (selectedIds.length === 0) {
            return; // Should not happen
        }

        // Calculate next number
        const currentYear = new Date().getFullYear();
        let year = settings.invoiceYear || currentYear;
        let seq = settings.invoiceSeq || 1;

        if (year < currentYear) {
            year = currentYear;
            seq = 1;
        }

        const formattedSeq = String(seq).padStart(3, '0');
        const invNum = year + '-' + formattedSeq;
        setInvoiceNumInput(invNum);
        setShowInvoiceModal(true);
    };

    const confirmGenerateInvoice = () => {
        const selectedEntries = entries.filter(e => selectedIds.includes(e.id));

        // Use the input value (which might have been edited)
        generateInvoice(selectedEntries.length === 1 ? selectedEntries[0] : selectedEntries, settings, invoiceNumInput, customerDetails);

        // Update sequence
        const parts = invoiceNumInput.split('-');
        if (parts.length === 2) {
            const inputYear = parseInt(parts[0]);
            const inputSeq = parseInt(parts[1]);

            if (!isNaN(inputYear) && !isNaN(inputSeq)) {
                // If the used number >= current settings, increment next
                const currentSeq = (settings.invoiceYear === inputYear) ? settings.invoiceSeq : 0;

                if (inputYear > (settings.invoiceYear || 0) || (inputYear === settings.invoiceYear && inputSeq >= currentSeq)) {
                    setSettings(prev => ({
                        ...prev,
                        invoiceYear: inputYear,
                        invoiceSeq: inputSeq + 1
                    }));
                }
            }
        }

        setShowInvoiceModal(false);
        setSelectedIds([]);
    };

    const handleImageUpload = (id, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate(id, { projectImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Group by project name to calculate stats
    const projectStats = entries.reduce((acc, entry) => {
        const name = entry.projectName || 'Ukendt';
        if (!acc[name]) {
            acc[name] = { count: 0, material: 0, cost: 0, sales: 0 };
        }
        acc[name].count += 1;
        // Let's look at raw weight
        const weight = (parseFloat(entry.amount1to1) || 0) + (parseFloat(entry.amount2to1) || 0);
        acc[name].material += weight;
        acc[name].cost += (entry.results?.total || 0);
        acc[name].sales += (entry.results?.sales || 0);
        return acc;
    }, {});

    const cur = settings.currency || 'kr';

    return (
        <div className="p-4 md:p-6 w-full space-y-6">

            {/* STATS CARDS */}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(projectStats).map(([name, stats]) => (
                    <div key={name} className="bg-skin-card p-4 rounded-xl shadow-sm border border-skin-border">
                        <h3 className="font-bold text-skin-base-text border-b border-skin-border pb-2 mb-2 truncate" title={name}>{name}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-skin-muted">{t('histCount')}</span>
                                <span className="font-mono text-skin-base-text">{stats.count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-skin-muted">{t('histMat')}</span>
                                <span className="font-mono text-skin-base-text">{(stats.material / 1000).toFixed(1)} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-skin-muted">{t('histCost')}</span>
                                <span className="font-mono text-skin-base-text">{stats.cost.toFixed(0)} {cur}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-success font-bold">{t('histSales')}</span>
                                <span className="font-mono font-bold text-success">{stats.sales.toFixed(0)} {cur}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* SORTING CONTROLS */}
            {entries.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center bg-skin-card p-3 rounded-lg border border-skin-border">
                    <span className="text-sm font-medium text-skin-muted mr-2">Sort By:</span>
                    {['date', 'price', 'name'].map(key => (
                        <button
                            key={key}
                            onClick={() => handleSortChange(key)}
                            className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors ${sortConfig.key === key ? 'bg-primary text-white' : 'bg-skin-base text-skin-base-text hover:bg-skin-border'}`}
                        >
                            {key === 'date' && t('sortDate')}
                            {key === 'price' && t('sortPrice')}
                            {key === 'name' && t('sortName')}
                            {sortConfig.key === key && (
                                sortConfig.direction === 'asc' ? <TrendingUp size={14} className="rotate-180" /> : <TrendingUp size={14} />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* HISTORY LIST */}
            {
                sortedEntries.length === 0 ? (
                    <div className="bg-skin-card p-8 rounded-lg shadow-sm text-center border border-skin-border">
                        <HistoryIcon size={48} className="mx-auto text-skin-muted mb-4" />
                        <h3 className="text-lg font-medium text-skin-base-text mb-1">{t('histNoHistory')}</h3>
                        <p className="text-skin-muted">{t('histStartCalc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {sortedEntries.map((entry) => {
                            const isSelected = selectedIds.includes(entry.id);
                            const cardClass = `bg-skin-card rounded-lg shadow-sm border border-skin-border overflow-hidden transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`;
                            return (
                                <div key={entry.id} className={cardClass}>
                                    <div className="p-4 sm:px-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start gap-4">
                                                <button
                                                    onClick={() => toggleSelect(entry.id)}
                                                    className="mt-1 text-skin-muted hover:text-primary transition-colors focus:outline-none"
                                                >
                                                    {selectedIds.includes(entry.id) ? <CheckSquare className="text-primary" /> : <Square />}
                                                </button>
                                                <div>
                                                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                                        {entry.projectName || t('histTableProject')}
                                                    </h3>
                                                    <p className="text-xs text-skin-muted flex items-center gap-1 mt-1">
                                                        <Clock size={12} /> {entry.date} {entry.timestamp && <span className="text-skin-muted/70">- {entry.timestamp}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-success">{entry.results.sales.toFixed(2)} {cur}</p>
                                                <p className="text-xs text-skin-muted">
                                                    {t('resCost')}: {entry.results.total.toFixed(2)} {cur}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 border-t border-b border-skin-border py-3 bg-skin-base/50">
                                            <div>
                                                <p className="text-xs text-skin-muted mb-1">{t('amount1to1')}</p>
                                                <p className="font-medium text-skin-base-text">{entry.amount1to1} g</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-skin-muted mb-1">{t('amount2to1')}</p>
                                                <p className="font-medium text-skin-base-text">{entry.amount2to1} g</p>
                                            </div>
                                            {entry.customMaterials && entry.customMaterials.length > 0 && (
                                                <div className="col-span-2">
                                                    <p className="text-xs text-skin-muted mb-1">Materialer</p>
                                                    <p className="font-medium text-skin-base-text truncate">
                                                        {entry.customMaterials.map(m => m.name).join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => prepareInvoice(entry.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                                            >
                                                <FileText size={16} />
                                                <span>PDF</span>
                                            </button>
                                            <button
                                                onClick={() => onEdit(entry)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-skin-base-text bg-skin-base hover:bg-skin-border rounded border border-skin-border transition-colors"
                                            >
                                                <Pencil size={16} />
                                                <span>{t('btnEdit')}</span>
                                            </button>
                                            <button
                                                onClick={() => onDelete(entry.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                <span>{t('btnDelete')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }


            {/* INVOICE NUMBER MODAL */}
            {
                showInvoiceModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-skin-card rounded-lg shadow-xl p-6 w-full max-w-sm border border-skin-border">
                            <h3 className="text-lg font-bold text-skin-base-text mb-4">PDF Invoice</h3>
                            <label className="block text-sm font-medium text-skin-muted mb-2">Invoice Number</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded border border-skin-border bg-skin-input text-skin-base-text font-mono text-lg mb-4 focus:ring-2 focus:ring-primary outline-none"
                                value={invoiceNumInput}
                                onChange={(e) => setInvoiceNumInput(e.target.value)}
                            />

                            <div className="border-t border-skin-border pt-4 mb-4">
                                <h4 className="font-bold text-sm text-skin-base-text mb-3">{t('lblCustomerDetails')}</h4>

                                <div className="mb-3">
                                    <label className="block text-xs uppercase text-skin-muted mb-1">{t('lblSelectCust')}</label>
                                    <select
                                        className="w-full p-2 rounded border border-skin-border bg-skin-input text-skin-base-text"
                                        onChange={(e) => {
                                            const custId = e.target.value;
                                            if (!custId) return;
                                            const cust = customers.find(c => c.id === custId);
                                            if (cust) {
                                                setCustomerDetails({
                                                    name: cust.name || '',
                                                    address: cust.address || '',
                                                    zipCity: cust.zipCity || '',
                                                    ref: cust.ref || ''
                                                });
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="">-- {t('lblSelectCust')} --</option>
                                        {customers && [...customers].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        placeholder={t('lblCustName')}
                                        className="w-full p-2 text-sm rounded border border-skin-border bg-skin-input text-skin-base-text"
                                        value={customerDetails.name} onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                    />
                                    <input
                                        placeholder={t('lblCustAddr')}
                                        className="w-full p-2 text-sm rounded border border-skin-border bg-skin-input text-skin-base-text"
                                        value={customerDetails.address} onChange={e => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                                    />
                                    <input
                                        placeholder={t('lblCustZipCity')}
                                        className="w-full p-2 text-sm rounded border border-skin-border bg-skin-input text-skin-base-text"
                                        value={customerDetails.zipCity} onChange={e => setCustomerDetails({ ...customerDetails, zipCity: e.target.value })}
                                    />
                                    <input
                                        placeholder={t('lblCustRef')}
                                        className="w-full p-2 text-sm rounded border border-skin-border bg-skin-input text-skin-base-text"
                                        value={customerDetails.ref} onChange={e => setCustomerDetails({ ...customerDetails, ref: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowInvoiceModal(false)}
                                    className="px-4 py-2 rounded text-skin-base-text hover:bg-skin-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmGenerateInvoice}
                                    className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-hover font-medium"
                                >
                                    Generate PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                selectedIds.length > 0 && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-skin-card p-1 rounded-full shadow-xl border border-skin-border animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <button
                            onClick={() => prepareInvoice()}
                            className="bg-primary text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-primary-hover transition-colors font-medium text-lg shadow-sm"
                        >
                            <FileText size={24} />
                            Generating Merged Invoice ({selectedIds.length})
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default History;

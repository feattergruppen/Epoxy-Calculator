import React from 'react';
import { Trash2, FileText, TrendingUp, Package, DollarSign } from 'lucide-react';
import { generateInvoice } from '../utils/pdfGenerator';

const History = ({ entries, onDelete, t, settings }) => {

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
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(projectStats).map(([name, stats]) => (
                    <div key={name} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 border-b pb-2 mb-2 truncate" title={name}>{name}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('histCount')}</span>
                                <span className="font-mono">{stats.count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('histMat')}</span>
                                <span className="font-mono">{(stats.material / 1000).toFixed(1)} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('histCost')}</span>
                                <span className="font-mono">{stats.cost.toFixed(0)} {cur}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-600 font-bold">{t('histSales')}</span>
                                <span className="font-mono font-bold text-green-600">{stats.sales.toFixed(0)} {cur}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">{t('histTableDate')}</th>
                                <th className="p-4 font-semibold text-gray-600">{t('histTableProject')}</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">{t('histTableMat')}</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">{t('histTableTime')}</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">{t('histTableCost')} ({cur})</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">{t('histTableSales')} ({cur})</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">{t('histTableAction')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400">
                                        {t('histNoData')}
                                    </td>
                                </tr>
                            ) : (
                                entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600 text-sm whitespace-nowrap">{entry.date}</td>
                                        <td className="p-4 font-medium text-gray-900">{entry.projectName}</td>
                                        <td className="p-4 text-right font-mono text-sm text-gray-600">
                                            {((parseFloat(entry.amount1to1) || 0) + (parseFloat(entry.amount2to1) || 0))}
                                        </td>
                                        <td className="p-4 text-right font-mono text-sm text-gray-600">{entry.time}</td>
                                        <td className="p-4 text-right font-mono text-sm text-gray-600">
                                            {entry.results?.total.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right font-mono text-sm font-bold text-green-600">
                                            {entry.results?.sales.toFixed(2)}
                                        </td>
                                        <td className="p-4 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => generateInvoice(entry, settings)}
                                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title={t('pdfBtn')}
                                            >
                                                <FileText size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(entry.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;

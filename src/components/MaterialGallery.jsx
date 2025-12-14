import React, { useState } from 'react';
import { Layers, Image as ImageIcon, X, ChevronDown, ChevronRight } from 'lucide-react';

const MaterialGallery = ({ materials, categories, t, currency }) => {
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [collapsedCategories, setCollapsedCategories] = useState({});

    const toggleCategory = (category) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* HEADER */}
            <section className="bg-skin-card p-6 rounded-xl shadow-sm border border-skin-border">
                <h2 className="text-xl font-bold flex items-center gap-2 text-skin-base-text">
                    <Layers className="text-primary" /> {t('tabMaterials')}
                </h2>
            </section>

            {/* GALLERY GRID */}
            {materials.length > 0 ? (
                <div className="space-y-12">
                    {categories.map(category => {
                        const catMaterials = materials.filter(m => m.category === category);
                        if (catMaterials.length === 0) return null;

                        const isCollapsed = collapsedCategories[category];

                        return (
                            <section key={category} className="space-y-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer border-b pb-2 border-skin-border group"
                                    onClick={() => toggleCategory(category)}
                                >
                                    {isCollapsed ? <ChevronRight size={20} className="text-skin-muted group-hover:text-primary" /> : <ChevronDown size={20} className="text-skin-muted group-hover:text-primary" />}
                                    <h3 className="text-xl font-semibold text-skin-base-text select-none">
                                        {category} ({catMaterials.length})
                                    </h3>
                                </div>
                                {!isCollapsed && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                                        {catMaterials.map(mat => (
                                            <div
                                                key={mat.id}
                                                className="bg-skin-card rounded-xl shadow-sm border border-skin-border overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                                                onClick={() => (mat.images?.length > 0 || mat.image) && setSelectedMaterial(mat)}
                                            >
                                                {/* IMAGE AREA */}
                                                <div className="h-48 bg-skin-base flex items-center justify-center overflow-hidden border-b border-skin-border relative">
                                                    {(mat.images && mat.images.length > 0) || mat.image ? (
                                                        <div className="w-full h-full relative">
                                                            <img
                                                                src={mat.images && mat.images.length > 0 ? mat.images[0] : mat.image}
                                                                alt={mat.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            {mat.images && mat.images.length > 1 && (
                                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                                                                    <Layers size={12} /> +{mat.images.length - 1}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-skin-muted flex flex-col items-center gap-2">
                                                            <ImageIcon size={48} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* CONTENT AREA */}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-bold text-lg text-skin-base-text">{mat.name}</h3>
                                                        {mat.cost && (
                                                            <span className="bg-skin-accent text-primary text-xs font-mono font-bold px-2 py-1 rounded-md border border-skin-border">
                                                                {mat.cost} {currency}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {mat.note && (
                                                        <div className="bg-skin-accent border border-skin-border rounded-md p-3 mt-2 flex-1">
                                                            <p className="text-sm text-skin-base-text whitespace-pre-wrap leading-relaxed">{mat.note}</p>
                                                        </div>
                                                    )}

                                                    {!mat.note && (
                                                        <div className="mt-2 text-sm text-skin-muted italic">
                                                            - {t('setColorNote')} -
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                    {/* Items without valid category (fallback) */}
                    {materials.filter(m => !categories.includes(m.category)).length > 0 && (
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 pl-2 border-gray-200">
                                {t('otherCategory') || 'Andet'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {materials.filter(m => !categories.includes(m.category)).map(mat => (
                                    <div key={mat.id} className="bg-skin-card rounded-xl shadow-sm border border-skin-border p-4">
                                        <p className="font-bold text-skin-base-text">{mat.name}</p>
                                        <p className="text-xs text-danger">Invalid Category: {mat.category}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 text-skin-muted">
                    <Layers size={64} className="mx-auto mb-4 opacity-50" />
                    <p>{t('galleryNoMaterials') || 'Ingen materialer fundet.'}</p>
                </div>
            )}

            {/* FULL SCREEN MODAL */}
            {selectedMaterial && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedMaterial(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"
                        onClick={() => setSelectedMaterial(null)}
                    >
                        <X size={32} />
                    </button>

                    <div className="w-full max-w-6xl h-full flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

                        {/* Header Info */}
                        <div className="text-center text-white mb-6 pt-4 flex-shrink-0">
                            <h3 className="text-3xl font-bold">{selectedMaterial.name}</h3>
                            <p className="text-gray-400 uppercase tracking-widest text-sm mt-1">
                                {selectedMaterial.category}
                            </p>
                        </div>

                        {/* Scrollable Gallery */}
                        <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide">
                            <div className="flex flex-wrap justify-center gap-4">
                                {(selectedMaterial.images && selectedMaterial.images.length > 0
                                    ? selectedMaterial.images
                                    : [selectedMaterial.image]).map((img, idx) => (
                                        <div key={idx} className="max-w-[80vw] md:max-w-2xl">
                                            <img
                                                src={img}
                                                alt={`${selectedMaterial.name} ${idx + 1}`}
                                                className="w-full h-auto rounded-lg shadow-2xl border-2 border-white/10"
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialGallery;

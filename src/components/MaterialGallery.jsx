import React, { useState } from 'react';
import { Layers, Image as ImageIcon, X } from 'lucide-react';

const MaterialGallery = ({ materials, categories, t }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* HEADER */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Layers className="text-indigo-600" /> {t('tabMaterials')}
                </h2>
            </section>

            {/* GALLERY GRID */}
            {materials.length > 0 ? (
                <div className="space-y-12">
                    {categories.map(category => {
                        const catMaterials = materials.filter(m => m.category === category);
                        if (catMaterials.length === 0) return null;

                        return (
                            <section key={category} className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 pl-2 border-gray-200">
                                    {category} ({catMaterials.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {catMaterials.map(mat => (
                                        <div
                                            key={mat.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                                            onClick={() => mat.image && setSelectedImage(mat)}
                                        >
                                            {/* IMAGE AREA */}
                                            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100 relative">
                                                {mat.image ? (
                                                    <img
                                                        src={mat.image}
                                                        alt={mat.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="text-gray-300 flex flex-col items-center gap-2">
                                                        <ImageIcon size={48} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* CONTENT AREA */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-lg text-gray-900">{mat.name}</h3>
                                                    {mat.cost && (
                                                        <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2 py-1 rounded-md border border-indigo-100">
                                                            {mat.cost} kr
                                                        </span>
                                                    )}
                                                </div>

                                                {mat.note && (
                                                    <div className="bg-amber-50 border border-amber-100 rounded-md p-3 mt-2 flex-1">
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{mat.note}</p>
                                                    </div>
                                                )}

                                                {!mat.note && (
                                                    <div className="mt-2 text-sm text-gray-400 italic">
                                                        - {t('setColorNote')} -
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                    <div key={mat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                        <p className="font-bold">{mat.name}</p>
                                        <p className="text-xs text-red-400">Invalid Category: {mat.category}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400">
                    <Layers size={64} className="mx-auto mb-4 opacity-50" />
                    <p>{t('galleryNoMaterials') || 'Ingen materialer fundet.'}</p>
                </div>
            )}

            {/* FULL SCREEN MODAL */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>

                    <div className="max-w-5xl max-h-screen w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={selectedImage.image}
                            alt={selectedImage.name}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border-4 border-white/20"
                        />
                        <div className="mt-4 text-center text-white">
                            <h3 className="text-2xl font-bold">{selectedImage.name}</h3>
                            <p className="text-gray-300 uppercase tracking-widest text-sm mt-1">
                                {selectedImage.category}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialGallery;

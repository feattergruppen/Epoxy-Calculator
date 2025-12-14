import React, { useState } from 'react';
import { Palette, Image as ImageIcon, X, ChevronDown, ChevronRight } from 'lucide-react';

const ColorGallery = ({ colors, categories, t, currency }) => {
    const [selectedImage, setSelectedImage] = useState(null);
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
                    <Palette className="text-primary" /> {t('galleryTitle')}
                </h2>
            </section>

            {/* GALLERY GRID */}
            {colors.length > 0 ? (
                <div className="space-y-12">
                    {categories.map(type => {
                        const typeColors = colors.filter(c => c.type === type);
                        // Handle legacy mapping for display title if needed, otherwise use type name
                        const title = type === 'pulver' ? t('typePowder') :
                            type === 'flydende' ? t('typeLiquid') :
                                type === 'alcohol' ? t('typeAlcohol') : type;

                        // Only show category if it has colors OR if we want to show empty categories (let's only show if has colors to keep it clean)
                        if (typeColors.length === 0) return null;

                        const isCollapsed = collapsedCategories[type];

                        return (
                            <section key={type} className="space-y-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer border-b pb-2 border-skin-border group"
                                    onClick={() => toggleCategory(type)}
                                >
                                    {isCollapsed ? <ChevronRight size={20} className="text-skin-muted group-hover:text-primary" /> : <ChevronDown size={20} className="text-skin-muted group-hover:text-primary" />}
                                    <h3 className="text-xl font-semibold text-skin-base-text select-none">
                                        {title} ({typeColors.length})
                                    </h3>
                                </div>
                                {!isCollapsed && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                                        {typeColors.map(color => (
                                            <div
                                                key={color.id}
                                                className="bg-skin-card rounded-xl shadow-sm border border-skin-border overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                                                onClick={() => color.image && setSelectedImage(color)}
                                            >
                                                {/* IMAGE AREA */}
                                                <div className="h-48 bg-skin-base flex items-center justify-center overflow-hidden border-b border-skin-border relative">
                                                    {color.image ? (
                                                        <img
                                                            src={color.image}
                                                            alt={color.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="text-skin-muted flex flex-col items-center gap-2">
                                                            <ImageIcon size={48} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* CONTENT AREA */}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-bold text-lg text-skin-base-text">{color.name}</h3>
                                                        {color.cost && (
                                                            <span className="bg-skin-accent text-primary text-xs font-mono font-bold px-2 py-1 rounded-md border border-skin-border">
                                                                {color.cost} {currency}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {color.note && (
                                                        <div className="bg-skin-accent border border-skin-border rounded-md p-3 mt-2 flex-1">
                                                            <p className="text-sm text-skin-base-text whitespace-pre-wrap leading-relaxed">{color.note}</p>
                                                        </div>
                                                    )}

                                                    {!color.note && (
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
                </div>
            ) : (
                <div className="text-center py-20 text-skin-muted">
                    <Palette size={64} className="mx-auto mb-4 opacity-50" />
                    <p>{t('galleryNoColors')}</p>
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
                                {selectedImage.type === 'pulver' ? t('typePowder') :
                                    selectedImage.type === 'flydende' ? t('typeLiquid') :
                                        selectedImage.type === 'alcohol' ? t('typeAlcohol') : selectedImage.type}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorGallery;

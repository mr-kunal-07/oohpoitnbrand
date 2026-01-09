import { useState, useEffect } from 'react';
import { Camera, X, Download, Share2, ZoomIn, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const AuditPhotos = ({ campaign = {} }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const photos = campaign?.auditPhotos || campaign?.photos || [];
    const hasPhotos = photos.length > 0;

    const openImage = (photo, index) => {
        setSelectedImage(photo?.url || photo);
        setSelectedIndex(index);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        const newIndex = direction === 'next'
            ? (selectedIndex + 1) % photos.length
            : (selectedIndex - 1 + photos.length) % photos.length;
        setSelectedIndex(newIndex);
        setSelectedImage(photos[newIndex]?.url || photos[newIndex]);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-photo-${selectedIndex + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Audit Photo',
                    text: `Audit Photo #${selectedIndex + 1}`,
                    url: selectedImage,
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        } else {
            navigator.clipboard.writeText(selectedImage);
            alert('Image URL copied to clipboard!');
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (!selectedImage) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') navigateImage('prev');
            if (e.key === 'ArrowRight') navigateImage('next');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, selectedIndex, photos.length]);

    return (
        <>
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row px-6 py-4 sm:items-center sm:justify-between gap-3 mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                            <Camera className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">Audit Photos</h3>

                        </div>
                    </div>

                    {hasPhotos && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-semibold rounded-lg border border-purple-200">
                            {photos.length} Total
                        </span>
                    )}
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {hasPhotos ? (
                        photos.map((photo, i) => (
                            <div
                                key={i}
                                onClick={() => openImage(photo, i)}
                                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-slate-200 hover:border-purple-400 transition-all hover:shadow-lg"
                            >
                                <img
                                    src={photo?.url || photo}
                                    alt={`Audit ${i + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                                    <div className="flex items-center gap-2 text-white text-xs font-medium">
                                        <ZoomIn className="w-3 h-3" />
                                        <span>View</span>
                                    </div>
                                </div>

                                {/* Photo number */}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-700 text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                                    #{i + 1}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Placeholder cards
                        Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-slate-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300"
                            >
                                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500 font-medium">No Photo</span>
                            </div>
                        ))
                    )}
                </div>

                {hasPhotos && photos.length > 6 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-center text-sm text-slate-600">
                            Showing {Math.min(photos.length, 12)} of {photos.length} photos
                        </p>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={closeModal}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between  bg-white rounded-t-xl px-4 py-3 shadow-lg">
                            <div className="flex items-center gap-3">
                                <Camera className="w-5 h-5 text-purple-600" />
                                <div>
                                    <h3 className="text-slate-900 font-semibold">Audit Photo #{selectedIndex + 1}</h3>
                                    <p className="text-xs text-slate-600">{selectedIndex + 1} of {photos.length}</p>
                                </div>
                            </div>

                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Image Container */}
                        <div className="relative flex-1 bg-slate-100  overflow-hidden flex items-center justify-center">
                            <img
                                src={selectedImage}
                                alt={`Audit Photo ${selectedIndex + 1}`}
                                className="max-w-full max-h-[70vh] object-contain"
                            />

                            {/* Navigation Arrows */}
                            {photos.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateImage('prev');
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-700 transition-all hover:scale-110 shadow-lg"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateImage('next');
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-700 transition-all hover:scale-110 shadow-lg"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3  bg-white rounded-b-xl px-4 py-3 shadow-lg">
                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share</span>
                            </button>

                            <button
                                onClick={() => window.open(selectedImage, '_blank')}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium border border-slate-300"
                                aria-label="Open in new tab"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuditPhotos;
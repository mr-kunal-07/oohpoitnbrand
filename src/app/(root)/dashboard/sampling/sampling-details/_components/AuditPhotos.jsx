import { useState, useEffect } from 'react';
import { Camera, X, Download, Share2, ZoomIn, ExternalLink, ChevronLeft, ChevronRight, MapPin, Clock, Calendar } from 'lucide-react';

const AuditPhotos = ({ campaign = {} }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Handle both array and object formats for auditPhotos
    const getPhotosArray = () => {
        const auditPhotos = campaign?.auditPhotos;

        // If auditPhotos is an array, return it
        if (Array.isArray(auditPhotos)) {
            return auditPhotos;
        }

        // If auditPhotos is an object with a url property, convert to array
        if (auditPhotos && typeof auditPhotos === 'object' && auditPhotos.url) {
            return [auditPhotos];
        }

        // Fallback to campaign.photos if available
        if (Array.isArray(campaign?.photos)) {
            return campaign.photos;
        }

        return [];
    };

    const photos = getPhotosArray();
    const hasPhotos = photos.length > 0;

    const openImage = (photo, index) => {
        setSelectedImage(photo);
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
        setSelectedImage(photos[newIndex]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Time not available';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatLocation = (location) => {
        if (!location) return 'Location not available';
        if (typeof location === 'string') return location;

        const { address, city, state, country, latitude, longitude } = location;

        if (address) {
            return `${address}${city ? ', ' + city : ''}${state ? ', ' + state : ''}`;
        }

        if (city && state) {
            return `${city}, ${state}${country ? ', ' + country : ''}`;
        }

        if (latitude && longitude) {
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }

        return 'Location not available';
    };

    const handleDownload = async () => {
        try {
            const imageUrl = selectedImage?.url || selectedImage;
            const response = await fetch(imageUrl);
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
        const imageUrl = selectedImage?.url || selectedImage;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Audit Photo',
                    text: `Audit Photo #${selectedIndex + 1}`,
                    url: imageUrl,
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        } else {
            navigator.clipboard.writeText(imageUrl);
            alert('Image URL copied to clipboard!');
        }
    };

    const openGoogleMaps = (location) => {
        if (!location) return;

        let mapsUrl;
        if (location.latitude && location.longitude) {
            mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        } else if (typeof location === 'string') {
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        } else if (location.address) {
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatLocation(location))}`;
        }

        if (mapsUrl) {
            window.open(mapsUrl, '_blank');
        }
    };

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
            <div className="mb-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row px-4 sm:px-6 py-3 sm:py-4 sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-lg sm:rounded-t-xl">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                        <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">Audit Photos</h3>
                    </div>

                    {hasPhotos && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs sm:text-sm font-semibold rounded-lg border border-purple-200 self-start sm:self-auto">
                            {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
                        </span>
                    )}
                </div>

                {/* Photo Grid */}
                <div className="p-3 sm:p-4 md:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                    {hasPhotos ? (
                        photos.map((photo, i) => (
                            <div
                                key={i}
                                onClick={() => openImage(photo, i)}
                                className="group relative rounded-lg overflow-hidden cursor-pointer border-2 border-slate-200 hover:border-purple-400 transition-all hover:shadow-lg"
                            >
                                {/* Image */}
                                <div className="aspect-square">
                                    <img
                                        src={photo?.url || photo}
                                        alt={`Audit ${i + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-2 sm:pb-3 px-2">
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-white text-xs font-medium mb-1 sm:mb-2">
                                        <ZoomIn className="w-3 h-3" />
                                        <span className="hidden sm:inline">View Details</span>
                                        <span className="sm:hidden">View</span>
                                    </div>
                                </div>

                                {/* Photo number */}
                                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-white/90 backdrop-blur-sm text-slate-700 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium shadow-sm">
                                    #{i + 1}
                                </div>

                                {/* Location & Time Preview - Hidden on mobile, shown on hover on desktop */}
                                <div className="hidden sm:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {photo?.capturedAt && (
                                        <div className="flex items-center gap-1 text-white text-xs mb-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTime(photo.capturedAt)}</span>
                                        </div>
                                    )}
                                    {photo?.location && (
                                        <div className="flex items-center gap-1 text-white text-xs truncate">
                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{formatLocation(photo.location)}</span>
                                        </div>
                                    )}
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
                                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mb-1 sm:mb-2" />
                                <span className="text-xs text-slate-500 font-medium">No Photo</span>
                            </div>
                        ))
                    )}
                </div>

                {hasPhotos && photos.length > 6 && (
                    <div className="px-4 sm:px-6 pb-3 sm:pb-4 pt-2 border-t border-slate-200">
                        <p className="text-center text-xs sm:text-sm text-slate-600">
                            Showing {Math.min(photos.length, 12)} of {photos.length} photos
                        </p>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
                    onClick={closeModal}
                >
                    <div
                        className="relative max-w-6xl w-full max-h-[95vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-white rounded-t-lg sm:rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                <div>
                                    <h3 className="text-sm sm:text-base text-slate-900 font-semibold">Audit Photo #{selectedIndex + 1}</h3>
                                    <p className="text-xs text-slate-600">{selectedIndex + 1} of {photos.length}</p>
                                </div>
                            </div>

                            <button
                                onClick={closeModal}
                                className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Image Container */}
                        <div className="relative flex-1 bg-slate-100 overflow-hidden flex items-center justify-center min-h-0">
                            <img
                                src={selectedImage?.url || selectedImage}
                                alt={`Audit Photo ${selectedIndex + 1}`}
                                className="max-w-full max-h-[50vh] sm:max-h-[65vh] object-contain"
                            />

                            {/* Navigation Arrows */}
                            {photos.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateImage('prev');
                                        }}
                                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-700 transition-all hover:scale-110 shadow-lg"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateImage('next');
                                        }}
                                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-700 transition-all hover:scale-110 shadow-lg"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Metadata Section */}
                        <div className="bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 border-t border-slate-200 max-h-40 sm:max-h-none overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                                {/* Date & Time */}
                                <div className="flex items-start gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg border border-slate-200">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Date & Time</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900">
                                            {formatDate(selectedImage?.capturedAt)}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-700 flex items-center gap-1.5 mt-1">
                                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                                            {formatTime(selectedImage?.capturedAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg border border-slate-200">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Location</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 break-words">
                                            {formatLocation(selectedImage?.location)}
                                        </p>
                                        {selectedImage?.location && (
                                            <button
                                                onClick={() => openGoogleMaps(selectedImage.location)}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View on Maps
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional metadata if available */}
                            {(selectedImage?.uploadedBy || selectedImage?.notes) && (
                                <div className="mt-2 sm:mt-3 bg-white p-2 sm:p-3 rounded-lg border border-slate-200">
                                    {selectedImage?.uploadedBy && (
                                        <p className="text-xs text-slate-600 mb-1">
                                            <span className="font-medium">Uploaded by:</span> {selectedImage.uploadedBy}
                                        </p>
                                    )}
                                    {selectedImage?.notes && (
                                        <p className="text-xs text-slate-600">
                                            <span className="font-medium">Notes:</span> {selectedImage.notes}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-b-lg sm:rounded-b-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg">
                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm text-sm"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden xs:inline">Download</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm text-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden xs:inline">Share</span>
                            </button>

                            <button
                                onClick={() => window.open(selectedImage?.url || selectedImage, '_blank')}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium border border-slate-300"
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
}

export default AuditPhotos;
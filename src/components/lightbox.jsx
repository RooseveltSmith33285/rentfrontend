// Create a new file: ImageLightbox.jsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const ImageLightbox = ({ images, isOpen, onClose, startIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-full transition-all shadow-lg"
      >
        <X className="w-8 h-8 text-white" strokeWidth={2} />
      </button>

      {/* Zoom Toggle */}
      <button
        onClick={() => setIsZoomed(!isZoomed)}
        className="absolute top-4 right-20 z-50 w-12 h-12 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-full transition-all shadow-lg"
      >
        {isZoomed ? (
          <ZoomOut className="w-6 h-6 text-white" strokeWidth={2} />
        ) : (
          <ZoomIn className="w-6 h-6 text-white" strokeWidth={2} />
        )}
      </button>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-full transition-all shadow-lg"
        >
          <ChevronLeft className="w-8 h-8 text-white" strokeWidth={2.5} />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-full transition-all shadow-lg"
        >
          <ChevronRight className="w-8 h-8 text-white" strokeWidth={2.5} />
        </button>
      )}

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].label}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-move' : 'scale-100'
          }`}
          draggable={false}
        />
      </div>

      {/* Image Counter & Label */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-6 py-3 rounded-full">
        <p className="text-lg font-semibold">{images[currentIndex].label}</p>
        {images.length > 1 && (
          <p className="text-sm text-center mt-1">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-3 rounded-2xl">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsZoomed(false);
              }}
              className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                idx === currentIndex ? 'ring-4 ring-white scale-110' : 'opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
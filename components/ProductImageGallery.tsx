"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          onClick={() => setIsZoomed(!isZoomed)}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsZoomed(!isZoomed)}
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSelectedImageIndex(index);
                setIsZoomed(false);
              }}
              className={`relative aspect-square overflow-hidden rounded-md bg-muted border-2 transition-all ${
                selectedImageIndex === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-transparent hover:border-primary/50"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


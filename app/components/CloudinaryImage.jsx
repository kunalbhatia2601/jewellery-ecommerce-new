"use client";
import { CldImage } from 'next-cloudinary';

export default function CloudinaryImage({ src, alt, width, height, ...props }) {
    return (
        <CldImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            {...props}
        />
    );
}
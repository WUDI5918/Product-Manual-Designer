
import React, { useRef } from 'react';

interface ImageUploaderProps {
  src: string;
  alt: string;
  onImageChange: (base64: string) => void;
  className?: string;
  containerClassName?: string;
  isEditable?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ src, alt, onImageChange, className, containerClassName, isEditable = true }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (isEditable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative group ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={`${className} ${isEditable ? 'cursor-pointer' : ''}`}
        onClick={handleImageClick}
      />
      {isEditable && (
         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300" onClick={handleImageClick}>
             <i className="fas fa-camera text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
         </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={!isEditable}
      />
    </div>
  );
};

export default ImageUploader;

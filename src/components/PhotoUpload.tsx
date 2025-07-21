import { useRef, useState } from 'react';

interface PhotoUploadProps {
  onPhotosSelected: (photos: File[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ onPhotosSelected, maxPhotos = 5 }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + selectedPhotos.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    const newPhotos = [...selectedPhotos, ...imageFiles];
    setSelectedPhotos(newPhotos);

    // Create preview URLs
    const newUrls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newUrls]);

    onPhotosSelected(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = selectedPhotos.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the removed URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedPhotos(newPhotos);
    setPreviewUrls(newUrls);
    onPhotosSelected(newPhotos);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="photo-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div className="photo-upload-area">
        {selectedPhotos.length === 0 ? (
          <div className="upload-prompt" onClick={triggerFileSelect}>
            <div className="upload-icon">📷</div>
            <p>Tap to add photos</p>
            <p className="upload-hint">Upload up to {maxPhotos} photos</p>
          </div>
        ) : (
          <div className="photo-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="photo-preview">
                <img src={url} alt={`Preview ${index + 1}`} />
                <button
                  onClick={() => removePhoto(index)}
                  className="remove-photo"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            
            {selectedPhotos.length < maxPhotos && (
              <div className="add-more-photos" onClick={triggerFileSelect}>
                <div className="add-icon">+</div>
                <p>Add more</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedPhotos.length > 0 && (
        <div className="photo-info">
          <p>{selectedPhotos.length}/{maxPhotos} photos selected</p>
        </div>
      )}
    </div>
  );
}
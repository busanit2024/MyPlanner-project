import React, { useState, useRef } from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
`;

const ImageBox = styled.div`
  border: 2px dashed var(--light-gray);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
  }
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 16px;
`;

const PreviewItem = styled.div`
  position: relative;
  
  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const UploadButton = styled.button`
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  width: 100%;
  cursor: pointer;

  &:disabled {
    background-color:var(--light-gray);
    cursor: not-allowed;
  }
`;

const ImageUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedImages([]);
    setPreviews([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (selectedImages.length > 0) {
      onUpload(selectedImages);
      resetState();
      onClose();
    }
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleModalClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>이미지 업로드</h2>
          <CloseButton onClick={handleModalClose}>&times;</CloseButton>
        </ModalHeader>

        <ImageBox onClick={handleAreaClick}>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          {previews.length > 0 ? (
            <PreviewContainer>
              {previews.map((preview, index) => (
                <PreviewItem key={index}>
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <RemoveButton onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}>
                    ×
                  </RemoveButton>
                </PreviewItem>
              ))}
            </PreviewContainer>
          ) : (
            <p>클릭하여 이미지를 선택하거나<br />이미지를 여기로 드래그하세요</p>
          )}
        </ImageBox>

        <UploadButton 
          onClick={handleUploadClick}
          disabled={selectedImages.length === 0}
        >
          {selectedImages.length > 0 ? `${selectedImages.length}개 이미지 업로드` : '업로드'}
        </UploadButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ImageUploadModal;
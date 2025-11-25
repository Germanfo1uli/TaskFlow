import { useState, useRef } from 'react';
import { CreateProjectFormData, Project, CropArea } from '../types/types';

export const useCreateProject = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createProject = async (formData: CreateProjectFormData): Promise<Project> => {
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            let imageUrl: string | null = null;
            if (formData.image && formData.crop) {
                imageUrl = await cropImage(formData.image, formData.crop);
            } else if (formData.image) {
                imageUrl = URL.createObjectURL(formData.image);
            }

            const project: Project = {
                id: Math.random().toString(36).substr(2, 9),
                name: formData.name,
                description: formData.description,
                image: imageUrl,
                createdAt: new Date()
            };

            return project;
        } finally {
            setIsLoading(false);
        }
    };

    const cropImage = (file: File, crop: CropArea): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d')!;


                    const outputSize = 200;
                    canvas.width = outputSize;
                    canvas.height = outputSize;


                    const safeX = Math.max(0, Math.min(crop.x, img.naturalWidth - crop.width));
                    const safeY = Math.max(0, Math.min(crop.y, img.naturalHeight - crop.height));
                    const safeWidth = Math.min(crop.width, img.naturalWidth - safeX);
                    const safeHeight = Math.min(crop.height, img.naturalHeight - safeY);

                    if (safeWidth <= 0 || safeHeight <= 0) {
                        reject(new Error('Invalid crop area'));
                        return;
                    }


                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d')!;
                    tempCanvas.width = safeWidth;
                    tempCanvas.height = safeHeight;


                    tempCtx.drawImage(
                        img,
                        safeX, safeY, safeWidth, safeHeight,
                        0, 0, safeWidth, safeHeight
                    );


                    ctx.drawImage(
                        tempCanvas,
                        0, 0, safeWidth, safeHeight,
                        0, 0, outputSize, outputSize
                    );

                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    return {
        createProject,
        isLoading
    };
};

export const useImageUpload = () => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [cropArea, setCropArea] = useState<CropArea | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const handleImageSelect = (file: File) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setIsCropping(true);
        setCropArea(null);
    };

    const setCrop = (crop: CropArea) => {
        setCropArea(crop);
    };

    const confirmCrop = () => {
        setIsCropping(false);
    };

    const cancelCrop = () => {
        setIsCropping(false);
        setCropArea(null);

        if (selectedFile && !previewUrl) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        }
    };

    const clearImage = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setCropArea(null);
        setIsCropping(false);
    };

    return {
        previewUrl,
        selectedFile,
        cropArea,
        isCropping,
        handleImageSelect,
        setCrop,
        confirmCrop,
        cancelCrop,
        clearImage
    };
};
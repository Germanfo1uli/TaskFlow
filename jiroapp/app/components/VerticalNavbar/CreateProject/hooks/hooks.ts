import { useState } from 'react';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import { CreateProjectFormData, Project, CropArea } from '../types/types';

export const useCreateProject = () => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadProjectAvatar = async (
        projectId: string,
        imageFile: File,
        crop?: CropArea
    ): Promise<boolean> => {
        try {
            let fileToUpload = imageFile;

            if (crop) {
                fileToUpload = await cropImageFile(imageFile, crop);
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);

            await api.post(`/projects/${projectId}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return true;
        } catch (error) {
            console.error('Failed to upload project avatar:', error);
            return false;
        }
    };

    const cropImageFile = (file: File, crop: CropArea): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d')!;

                    canvas.width = crop.width;
                    canvas.height = crop.height;

                    const safeX = Math.max(0, Math.min(crop.x, img.naturalWidth - crop.width));
                    const safeY = Math.max(0, Math.min(crop.y, img.naturalHeight - crop.height));
                    const safeWidth = Math.min(crop.width, img.naturalWidth - safeX);
                    const safeHeight = Math.min(crop.height, img.naturalHeight - safeY);

                    ctx.drawImage(img, safeX, safeY, safeWidth, safeHeight, 0, 0, safeWidth, safeHeight);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: file.type }));
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    }, file.type, 0.9);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
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

                    tempCtx.drawImage(img, safeX, safeY, safeWidth, safeHeight, 0, 0, safeWidth, safeHeight);
                    ctx.drawImage(tempCanvas, 0, 0, safeWidth, safeHeight, 0, 0, outputSize, outputSize);

                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const createProject = async (formData: CreateProjectFormData): Promise<Project> => {
        setIsLoading(true);

        try {
            const projectPayload = {
                name: formData.name,
                description: formData.description || '',
            };

            const response = await api.post('/projects', projectPayload);
            const backendProject = response.data;

            let imageUrl: string | null = null;
            if (formData.image) {
                const uploadSuccess = await uploadProjectAvatar(
                    backendProject.id.toString(),
                    formData.image,
                    formData.crop
                );

                if (uploadSuccess && formData.crop) {
                    imageUrl = await cropImage(formData.image, formData.crop);
                } else if (formData.image) {
                    imageUrl = URL.createObjectURL(formData.image);
                }
            }

            const projectKey = formData.name
                .toUpperCase()
                .split(/\s+/)
                .map(word => word.charAt(0))
                .join('')
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 10) || 'PRJ';

            const project: Project = {
                id: backendProject.id.toString(),
                name: backendProject.name,
                key: projectKey,
                description: backendProject.description || '',
                image: imageUrl,
                createdAt: new Date(),
                members: 1,
                tasks: 0,
                progress: 0,
                tags: ['Новый проект', 'Планирование'],
                owner: {
                    id: 'current-user-id',
                    name: 'Вы',
                    avatar: 'https://ui-avatars.com/api/?name=Вы&background=3d6bb3&color=fff'
                }
            };

            return project;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
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
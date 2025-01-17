import {useEffect, useState} from "react";

export const useGetImage = () => {
    const [image, setImage] = useState<HTMLImageElement | null>(null); // Подложка
    // Загружаем подложку
    useEffect(() => {
        const loadImage = () => {
            const img = new Image();
            img.src = "/ex1.svg"; // Путь к подложке
            img.onload = () => setImage(img);
        };
        loadImage();
    }, []);

    return {image}
}
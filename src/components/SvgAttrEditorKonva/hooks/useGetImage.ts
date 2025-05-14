import {useEffect, useState} from "react";

export const useGetImage = () => {
    const [image, setImage] = useState<HTMLImageElement | null>(null); // Подложка
    // Загружаем подложку
    useEffect(() => {
        const loadImage = () => {
            const img = new Image();
            img.src = "/Стадион_Екатеринбург_Арена.svg"; // Путь к подложке
            // img.src = "/Лужники.svg"; // Путь к подложке
            img.onload = () => setImage(img);
        };
        loadImage();
    }, []);

    return {image}
}
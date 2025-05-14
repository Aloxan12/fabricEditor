import React, {useEffect, useRef} from "react";
import konva from "konva";

// Константы для зума
const MIN_SCALE = 0.1;  // Минимальный масштаб (10%)
const MAX_SCALE = 10;   // Максимальный масштаб (1000%)
const SCALE_MULTIPLIER = 1.1;

export const useInitKonvaEffect = (
    image: HTMLImageElement | null,
    stageRef: React.MutableRefObject<konva.Stage | null>,
    imageRef: React.RefObject<konva.Image>
) => {
    // Сохраняем информацию о том, была ли выполнена инициализация
    const initializedRef = useRef(false);

    useEffect(() => {
        if (image && stageRef.current && imageRef.current && !initializedRef.current) {
            const stage = stageRef.current;

            // Получаем размеры сцены и изображения
            const stageWidth = stage.width();
            const stageHeight = stage.height();
            const imageWidth = image.width;
            const imageHeight = image.height;

            // Вычисляем начальный масштаб, чтобы изображение полностью поместилось в контейнер
            // с небольшим отступом для удобства (благодаря SCALE_MULTIPLIER)
            const scaleX = stageWidth / imageWidth / SCALE_MULTIPLIER;
            const scaleY = stageHeight / imageHeight / SCALE_MULTIPLIER;

            // Используем минимальный масштаб, чтобы поместилось по обоим измерениям
            const initialScale = Math.min(scaleX, scaleY);

            // Ограничиваем начальный масштаб
            const boundedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, initialScale));

            // Применяем масштаб
            stage.scale({ x: boundedScale, y: boundedScale });

            // Центрируем изображение
            const scaledImageWidth = imageWidth * boundedScale;
            const scaledImageHeight = imageHeight * boundedScale;

            stage.position({
                x: Math.max(0, (stageWidth - scaledImageWidth) / 2),
                y: Math.max(0, (stageHeight - scaledImageHeight) / 2)
            });

            stage.batchDraw();

            // Отмечаем, что инициализация выполнена
            initializedRef.current = true;
        }
    }, [image, imageRef, stageRef]);

    // Переинициализация при изменении размера окна
    useEffect(() => {
        const handleResize = () => {
            // Сбрасываем флаг инициализации при изменении размера окна
            if (initializedRef.current) {
                initializedRef.current = false;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
};
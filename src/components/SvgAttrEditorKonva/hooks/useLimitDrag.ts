import React, {useCallback} from "react";
import konva from "konva";

export const useLimitDrag = (
    stageRef: React.MutableRefObject<konva.Stage | null>,
    imageRef: React.RefObject<konva.Image>
) => {
    const limitDrag = useCallback(() => {
        if (!stageRef.current || !imageRef.current) return;

        const stage = stageRef.current;
        const image = imageRef.current;

        // Получаем размеры сцены и изображения
        const stageWidth = stage.width();
        const stageHeight = stage.height();
        const imageWidth = image.width() * stage.scaleX();
        const imageHeight = image.height() * stage.scaleY();

        // Получаем текущую позицию
        let x = stage.x();
        let y = stage.y();

        // Для небольших изображений центрируем их
        if (imageWidth < stageWidth) {
            x = (stageWidth - imageWidth) / 2;
        } else {
            // Ограничиваем горизонтальное перемещение
            const minX = stageWidth - imageWidth;
            x = Math.max(minX, Math.min(0, x));
        }

        if (imageHeight < stageHeight) {
            y = (stageHeight - imageHeight) / 2;
        } else {
            // Ограничиваем вертикальное перемещение
            const minY = stageHeight - imageHeight;
            y = Math.max(minY, Math.min(0, y));
        }

        // Применяем новую позицию
        stage.position({ x, y });
    }, [imageRef, stageRef]);

    return { limitDrag };
};
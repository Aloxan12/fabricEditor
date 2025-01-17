import React, {useEffect} from "react";
import konva from "konva";

export const useInitKonvaEffect = (image: HTMLImageElement | null,  stageRef: React.MutableRefObject<konva.Stage | null>,  imageRef: React.RefObject<konva.Image> ) => {
    useEffect(() => {
        if (image && stageRef.current && imageRef.current) {
            const stage = stageRef.current;
            const imageWidth = imageRef.current.width();
            const imageHeight = imageRef.current.height();
            const maxScaleX = 800 / imageWidth; // Максимальный масштаб по оси X
            const maxScaleY = 600 / imageHeight; // Максимальный масштаб по оси Y
            const initialScale = Math.min(maxScaleX, maxScaleY); // Максимальный зум
            stage.scale({ x: initialScale, y: initialScale });
            stage.batchDraw(); // Обновляем stage
        }
    }, [image, imageRef, stageRef]);
}
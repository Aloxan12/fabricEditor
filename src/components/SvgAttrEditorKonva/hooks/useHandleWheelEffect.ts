import React, {useCallback, useEffect} from "react";
import konva from "konva";

export const useHandleWheelEffect = (stageRef: React.MutableRefObject<konva.Stage | null>,  imageRef: React.RefObject<konva.Image>, image: HTMLImageElement | null ) =>{
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();
            const stage = stageRef.current;
            if(stage && imageRef.current){
                const scaleBy = 1.1;
                const oldScale = stage.scaleX();
                const pointer = stage.getPointerPosition();

                const mousePointTo = {
                    x: ((pointer?.x || 0) - stage.x()) / oldScale,
                    y: ((pointer?.y || 0) - stage.y()) / oldScale,
                };

                const newScale = e.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

                // Ограничиваем зум, чтобы не выйти за пределы подложки
                const imageWidth = imageRef.current.width();
                const imageHeight = imageRef.current.height();

                const maxScaleX = 600 / imageWidth; // Максимальный масштаб по оси X
                const maxScaleY = 400 / imageHeight; // Максимальный масштаб по оси Y

                // Ожидаем что не будет превышать размеров изображения
                const newScaleClamped = Math.max(newScale, maxScaleX, maxScaleY);

                stage.scale({ x: newScaleClamped, y: newScaleClamped });

                const newPos = {
                    x: (pointer?.x || 0) - mousePointTo.x * newScaleClamped,
                    y: (pointer?.y || 0) - mousePointTo.y * newScaleClamped,
                };
                stage.position(newPos);
                stage.batchDraw();
            }
        },
        [image]
    );

    useEffect(() => {
        if(stageRef.current){
            const stage = stageRef.current;
            stage.content.addEventListener("wheel", handleWheel);
            return () => stage.content.removeEventListener("wheel", handleWheel);
        }
    }, [handleWheel, stageRef]);

}
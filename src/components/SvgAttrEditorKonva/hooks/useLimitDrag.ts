import {useCallback} from "react";

export const useLimitDrag = (stageRef: any, imageRef: any )=>{
    const limitDrag = useCallback(() => {
        const stage = stageRef.current;
        const imageWidth = imageRef.current.width();
        const imageHeight = imageRef.current.height();
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        let x = stage.x();
        let y = stage.y();

        // Ограничиваем перетаскивание по оси X
        const maxX = stageWidth - imageWidth * stage.scaleX(); // Предел для оси X
        const minX = 0; // Предел для оси X
        if (x > minX) x = minX;
        if (x < maxX) x = maxX;

        // Ограничиваем перетаскивание по оси Y
        const maxY = stageHeight - imageHeight * stage.scaleY(); // Предел для оси Y
        const minY = 0; // Предел для оси Y
        if (y > minY) y = minY;
        if (y < maxY) y = maxY;

        stage.position({ x, y });
        stage.batchDraw();
    }, []);

    return { limitDrag }
}
import React, {useCallback, useEffect, useRef} from "react";
import Konva from "konva";

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const SCALE_BY = 1.1;

export const useHandleWheelEffect = (
    stageRef: React.MutableRefObject<Konva.Stage | null>,
    imageRef: React.RefObject<Konva.Image>,
    image: HTMLImageElement | null
) => {
    const currentScaleRef = useRef<number>(1);
    const wheelingRef = useRef<boolean>(false);
    const wheelTimer = useRef<number | null>(null);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage || !imageRef.current || !image) return;

        const stageWidth = stage.width();
        const stageHeight = stage.height();
        const imageWidth = image.width;
        const imageHeight = image.height;

        const initialScale = Math.min(stageWidth / imageWidth, stageHeight / imageHeight);
        currentScaleRef.current = initialScale;

        const x = (stageWidth - imageWidth * initialScale) / 2;
        const y = (stageHeight - imageHeight * initialScale) / 2;

        stage.scale({ x: initialScale, y: initialScale });
        stage.position({ x, y });
        stage.batchDraw();
    }, [image]);

    const zoomTo = useCallback(
        (scale: number, pointer: { x: number; y: number }) => {
            const stage = stageRef.current;
            if (!stage || !imageRef.current || !image) return;

            const oldScale = currentScaleRef.current;
            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
            currentScaleRef.current = newScale;

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };

            const stageWidth = stage.width();
            const stageHeight = stage.height();
            const scaledImgWidth = image.width * newScale;
            const scaledImgHeight = image.height * newScale;

            let finalX = newPos.x;
            let finalY = newPos.y;

            if (scaledImgWidth <= stageWidth) {
                finalX = (stageWidth - scaledImgWidth) / 2;
            } else {
                const minX = stageWidth - scaledImgWidth;
                const maxX = 0;
                finalX = Math.min(maxX, Math.max(minX, finalX));
            }

            if (scaledImgHeight <= stageHeight) {
                finalY = (stageHeight - scaledImgHeight) / 2;
            } else {
                const minY = stageHeight - scaledImgHeight;
                const maxY = 0;
                finalY = Math.min(maxY, Math.max(minY, finalY));
            }

            stage.to({
                scaleX: newScale,
                scaleY: newScale,
                x: finalX,
                y: finalY,
                duration: 0.3,
                easing: Konva.Easings.EaseOut,
            });
        },
        [image]
    );

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();

            const stage = stageRef.current;
            if (!stage || !imageRef.current || !image) return;
            if (wheelingRef.current) return;

            const pointer = stage.getPointerPosition();
            if (!pointer || (pointer.x === 0 && pointer.y === 0)) return;

            wheelingRef.current = true;

            if (wheelTimer.current !== null) {
                window.clearTimeout(wheelTimer.current);
            }

            const oldScale = currentScaleRef.current;
            const direction = e.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

            zoomTo(newScale, pointer);

            wheelTimer.current = window.setTimeout(() => {
                wheelingRef.current = false;
            }, 50);
        },
        [zoomTo, image]
    );

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage || !image) return;

        stage.content.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            stage.content.removeEventListener("wheel", handleWheel);
            if (wheelTimer.current !== null) {
                window.clearTimeout(wheelTimer.current);
            }
        };
    }, [handleWheel, image]);

    return { currentScale: currentScaleRef.current, zoomTo };
};
import React, {useCallback, useEffect, useRef} from "react";
import konva from "konva";

const MIN_SCALE = 0.1;  // Минимальный масштаб (10%)
const MAX_SCALE = 10;   // Максимальный масштаб (1000%)
const SCALE_BY = 1.1;   // Коэффициент масштабирования при каждом шаге зума

export const useHandleWheelEffect = (
    stageRef: React.MutableRefObject<konva.Stage | null>,
    imageRef: React.RefObject<konva.Image>,
    image: HTMLImageElement | null
) => {
    // Сохраняем текущий масштаб
    const currentScaleRef = useRef<number>(1);
    // Отслеживаем, находится ли колесо в движении (для предотвращения множественных событий)
    const wheelingRef = useRef<boolean>(false);
    // Таймер для debounce колеса
    const wheelTimer = useRef<number | null>(null);

    // Функция для плавного зумирования в указанную точку
    const zoomTo = useCallback((scale: number, pointer: {x: number, y: number}) => {
        const stage = stageRef.current;
        if (!stage || !imageRef.current || !image) return;

        const oldScale = currentScaleRef.current;

        // Позиция указателя относительно сцены в исходных координатах
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // Ограничиваем масштаб
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

        // Сохраняем новый масштаб
        currentScaleRef.current = newScale;

        // Вычисляем новую позицию с учетом указателя
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        // Применяем одновременно масштаб и позицию для плавности
        const width = stage.width();
        const height = stage.height();
        const scaledImgWidth = image.width * newScale;
        const scaledImgHeight = image.height * newScale;

        // Корректируем позицию, чтобы не выходить за границы
        let finalX = newPos.x;
        let finalY = newPos.y;

        // Для маленьких изображений - центрируем
        if (scaledImgWidth < width) {
            finalX = (width - scaledImgWidth) / 2;
        } else {
            // Иначе ограничиваем перемещение
            finalX = Math.min(0, Math.max(width - scaledImgWidth, finalX));
        }

        if (scaledImgHeight < height) {
            finalY = (height - scaledImgHeight) / 2;
        } else {
            finalY = Math.min(0, Math.max(height - scaledImgHeight, finalY));
        }

        // Применяем анимированное изменение для плавности
        stage.to({
            scaleX: newScale,
            scaleY: newScale,
            x: finalX,
            y: finalY,
            duration: 0.1, // Короткая анимация для плавности
            easing: konva.Easings.EaseOut
        });
    }, [image]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        const stage = stageRef.current;
        if (!stage || !imageRef.current || !image) return;

        if (wheelingRef.current) return; // Пропускаем события, если уже обрабатываем колесо
        wheelingRef.current = true;

        // Очищаем предыдущий таймер
        if (wheelTimer.current !== null) {
            window.clearTimeout(wheelTimer.current);
        }

        // Получаем текущий масштаб
        const oldScale = currentScaleRef.current;

        // Позиция указателя
        const pointer = stage.getPointerPosition();
        if (!pointer) {
            wheelingRef.current = false;
            return;
        }

        // Определяем направление и рассчитываем новый масштаб
        const direction = e.deltaY > 0 ? -1 : 1;
        const  newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

        // Зумируем к точке указателя
        zoomTo(newScale, pointer);

        // Устанавливаем timeout для разблокировки обработчика колеса
        wheelTimer.current = window.setTimeout(() => {
            wheelingRef.current = false;
        }, 50); // Задержка для предотвращения слишком частого зума

    }, [zoomTo, image]);

    // Применяем обработчик колесика мыши
    useEffect(() => {
        if (!stageRef.current) return;

        const stage = stageRef.current;
        stage.content.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            stage.content.removeEventListener("wheel", handleWheel);
            if (wheelTimer.current !== null) {
                window.clearTimeout(wheelTimer.current);
            }
        };
    }, [handleWheel, stageRef]);

    // Экспортируем функцию zoomTo для использования извне
    return { currentScale: currentScaleRef.current, zoomTo };
};

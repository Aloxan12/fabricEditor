import {memo, useCallback, useEffect, useRef, useState} from "react";
import {Image as ImageKonva, Layer, Stage} from "react-konva";
import konva from "konva";
import {useLimitDrag} from "./hooks/useLimitDrag.ts";
import {useHandleWheelEffect} from "./hooks/useHandleWheelEffect.ts";
import {SeatData} from "./Dto.ts";
import {useInitKonvaEffect} from "./hooks/useInitKonvaEffect.ts";
import {PlacesIds} from "./SvgAttrEditorKonvaWrap.tsx";
import _ from 'lodash';

const categoryColors:{[key: string]: string} = {
    '1': "#907c21",
    '2': "#d3d8b3",
    '3': "#ce16e2",
    '4': "#436a63",
    '5': "#6c33c9",
    '6': "#5757c6",
    '7': "#2d0aff",
    '8': "#d52846",
    '9': "#8c056f",
    '10': "#14228d",
    '11': "#288c22",
    '12': "#24474f",
    '13': "#32d84a",
    '14': "#4729f4",
    '15': "#1b6462",
    '16': "#c4442d",
    '17': "#fb0a35",
    '18': "#156dc7",
    '19': "#c6a505",
    '20': "#264e07"
}

// Создаем пространственный индекс для быстрого поиска ближайших мест
class SpatialIndex {
    private grid: Map<string, SeatData[]> = new Map();
    private cellSize: number;

    constructor(cellSize: number = 20) {
        this.cellSize = cellSize;
    }

    // Добавляем место в индекс
    add(seat: SeatData): void {
        const cellKey = this.getCellKey(seat.coodrinates.x, seat.coodrinates.y);
        if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, []);
        }
        this.grid.get(cellKey)!.push(seat);
    }

    // Строим индекс из массива мест
    buildIndex(seats: SeatData[]): void {
        this.grid.clear();
        for (const seat of seats) {
            this.add(seat);
        }
    }

    // Получаем ключ ячейки по координатам
    private getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX}:${cellY}`;
    }

    // Получаем все соседние ячейки для точки
    private getNeighborCells(x: number, y: number): string[] {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);

        // Получаем текущую ячейку и 8 соседних
        const neighbors: string[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                neighbors.push(`${cellX + dx}:${cellY + dy}`);
            }
        }
        return neighbors;
    }

    // Находим ближайшее место к точке
    findNearest(x: number, y: number, threshold: number = 15): SeatData | null {
        let nearestSeat: SeatData | null = null;
        let minDistance = threshold;

        // Получаем соседние ячейки
        const neighborCells = this.getNeighborCells(x, y);

        // Проверяем все места в соседних ячейках
        for (const cellKey of neighborCells) {
            const cellSeats = this.grid.get(cellKey);
            if (!cellSeats) continue;

            for (const seat of cellSeats) {
                const dx = seat.coodrinates.x - x;
                const dy = seat.coodrinates.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestSeat = seat;
                }
            }
        }

        return nearestSeat;
    }
}

interface SvgAttrEditorKonvaProps{
    places: SeatData[]
    onSeatClick?: (value: SeatData)=> void
    onSeatHover?: (value: SeatData)=> void
    onSeatLeave?: ()=> void
    image: HTMLImageElement | null
    selectedPlaces: PlacesIds
    hoveredPlaces: PlacesIds
    containerWidth?: number // Фиксированная ширина контейнера
    containerHeight?: number // Фиксированная высота контейнера (опционально)
    activeTab?: string // Фиксированная высота контейнера (опционально)
}

export const SvgAttrEditorKonva = memo(({
                                            places,
                                            onSeatClick,
                                            image,
                                            onSeatLeave,
                                            selectedPlaces,
                                            hoveredPlaces,
                                            onSeatHover,
                                            containerWidth = 800, // Значение по умолчанию
                                            containerHeight = 600, // Значение по умолчанию
                                            activeTab
                                        }:SvgAttrEditorKonvaProps) => {
    const stageRef = useRef<konva.Stage | null>(null);
    const imageRef = useRef<konva.Image>(null);
    const seatsLayerRef = useRef<konva.Layer | null>(null);
    const spatialIndexRef = useRef<SpatialIndex>(new SpatialIndex());
    const { limitDrag } = useLimitDrag(stageRef, imageRef);
    const [lastHoveredSeat, setLastHoveredSeat] = useState<string | null>(null);

    // Состояние для отслеживания видимой области
    const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });

    // Используем фиксированные размеры для Stage
    const [stageSize, setStageSize] = useState({
        width: containerWidth,
        height: containerHeight
    });

    // Обновляем размеры Stage, если изменились контейнерные размеры
    useEffect(() => {
        setStageSize({
            width: containerWidth,
            height: containerHeight
        });
    }, [containerWidth, containerHeight]);

    // Обновляем пространственный индекс при изменении мест
    useEffect(() => {
        spatialIndexRef.current.buildIndex(places);
    }, [places]);

    // Оптимизированная визуализация только видимых мест
    const getVisibleSeats = useCallback(() => {
        if (!stageRef.current) return places;

        const stage = stageRef.current;
        const transform = stage.getAbsoluteTransform().copy().invert();

        // Определяем границы видимой области
        const topLeft = transform.point({ x: 0, y: 0 });
        const bottomRight = transform.point({
            x: stageSize.width,
            y: stageSize.height
        });

        // Добавляем запас, чтобы избежать появления/исчезновения мест на границе
        const margin = 50;

        // Фильтруем только видимые места
        return places.filter(seat => {
            return seat.coodrinates.x >= topLeft.x - margin &&
                seat.coodrinates.x <= bottomRight.x + margin &&
                seat.coodrinates.y >= topLeft.y - margin &&
                seat.coodrinates.y <= bottomRight.y + margin;
        });
    }, [places, stageSize]);

    // Отслеживаем изменение масштаба и позиции сцены
    useEffect(() => {
        if (!stageRef.current) return;

        const stage = stageRef.current;

        const updateViewport = () => {
            const scale = stage.scaleX();
            const x = stage.x();
            const y = stage.y();

            setViewport({ x, y, scale });
        };

        stage.on('dragmove', updateViewport);
        stage.on('wheel', updateViewport);

        return () => {
            stage.off('dragmove', updateViewport);
            stage.off('wheel', updateViewport);
        };
    }, []);

    // Эффект для оптимизированного рендеринга мест
    useEffect(() => {
        if (!seatsLayerRef.current) return;

        const layer = seatsLayerRef.current;
        const visibleSeats = getVisibleSeats();

        // Очищаем слой
        layer.destroyChildren();

        // Группируем места по категориям
        const categorizedPlaces: {[categoryId: string]: SeatData[]} = {};

        visibleSeats.forEach(place => {
            const categoryId = place.categoryId.toString();
            if (!categorizedPlaces[categoryId]) {
                categorizedPlaces[categoryId] = [];
            }
            categorizedPlaces[categoryId].push(place);
        });

        // Создаем подгруппы для каждой категории
        Object.entries(categorizedPlaces).forEach(([categoryId, placesInCategory]) => {
            const color = categoryColors[categoryId] || 'black';

            const batchShape = new konva.Shape({
                sceneFunc: (context, shape) => {
                    context.beginPath();

                    placesInCategory.forEach(place => {
                        const isSelected = !!selectedPlaces[place.seatId];
                        const isHovered = !!hoveredPlaces[place.seatId];

                        // Увеличиваем радиус для лучшего поиска
                        const radius = isHovered || isSelected ? 5 : 3;
                        const fillColor = isSelected ? 'blue' : color;

                        context.fillStyle = fillColor;
                        context.beginPath();
                        context.arc(place.coodrinates.x, place.coodrinates.y, radius, 0, Math.PI * 2);
                        context.closePath();
                        context.fill();

                        // Для наведенных мест добавляем обводку для лучшей видимости
                        if (isHovered) {
                            context.beginPath();
                            context.arc(place.coodrinates.x, place.coodrinates.y, radius, 0, Math.PI * 2);
                            context.closePath();
                        }
                    });

                    context.fillStrokeShape(shape);
                }
            });

            layer.add(batchShape);
        });

        layer.batchDraw();
    }, [places, selectedPlaces, hoveredPlaces, viewport, getVisibleSeats, activeTab]);

    useHandleWheelEffect(stageRef, imageRef, image);
    useInitKonvaEffect(image, stageRef, imageRef);

    // Создаем новый дебаунсер при изменении activeTab
    const debouncedHoverCheck = useRef<_.DebouncedFunc<(x: number, y: number) => void>>();

    // Обновляем дебаунсер при изменении activeTab
    useEffect(() => {
        debouncedHoverCheck.current = _.debounce((x: number, y: number) => {
            const nearestSeat = spatialIndexRef.current.findNearest(x, y, 15);

            if (nearestSeat) {
                if (lastHoveredSeat !== nearestSeat.seatId) {
                    setLastHoveredSeat(nearestSeat.seatId);
                    onSeatHover?.(nearestSeat);
                }
            } else if (lastHoveredSeat !== null) {
                setLastHoveredSeat(null);
                onSeatLeave?.();
            }
        }, 10);

        // Очистка дебаунсера при размонтировании
        return () => {
            debouncedHoverCheck.current?.cancel();
        };
    }, [onSeatHover, onSeatLeave, lastHoveredSeat, activeTab]);

    // При изменении activeTab сбрасываем текущий ховер
    useEffect(() => {
        // Сброс ховера при смене вкладки
        if (lastHoveredSeat !== null) {
            setLastHoveredSeat(null);
            onSeatLeave?.();
        }

        // Если курсор находится над сценой, переинициализируем ховер
        if (stageRef.current) {
            const stage = stageRef.current;
            const pointerPosition = stage.getPointerPosition();

            if (pointerPosition) {
                const transform = stage.getAbsoluteTransform().copy().invert();
                const pos = transform.point(pointerPosition);

                // Используем setTimeout, чтобы дать время на обновление hoveredPlaces
                setTimeout(() => {
                    debouncedHoverCheck.current?.(pos.x, pos.y);
                }, 50);
            }
        }
    }, [activeTab, onSeatLeave]);

    // Оптимизированный обработчик движения мыши с учетом activeTab
    const handleMouseMove = useCallback((e: konva.KonvaEventObject<MouseEvent>) => {
        if (!stageRef.current || !debouncedHoverCheck.current) return;

        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();

        if (!pointerPosition) return;

        // Учитываем масштаб и сдвиг сцены для корректных координат
        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(pointerPosition);

        // Используем дебаунсированную функцию для проверки ховера
        debouncedHoverCheck.current(pos.x, pos.y);
    }, []);

    const handleMouseOut = useCallback(() => {
        debouncedHoverCheck.current?.cancel(); // Отменяем отложенные проверки
        if (lastHoveredSeat !== null) {
            setLastHoveredSeat(null);
            onSeatLeave?.();
        }
    }, [onSeatLeave, lastHoveredSeat]);

    // Оптимизированный обработчик клика
    const handleClick = useCallback((e: konva.KonvaEventObject<MouseEvent>) => {
        if (!stageRef.current) return;

        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();

        if (!pointerPosition) return;

        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(pointerPosition);

        // Используем пространственный индекс для поиска места
        const nearestSeat = spatialIndexRef.current.findNearest(pos.x, pos.y, 15);

        if (nearestSeat && onSeatClick) {
            onSeatClick(nearestSeat);
        }
    }, [onSeatClick]);

    // Обработчик для информации о производительности (опционально)
    const [fps, setFps] = useState(0);
    const lastFrameTime = useRef(performance.now());
    const frameCount = useRef(0);

    useEffect(() => {
        const updateFps = () => {
            const now = performance.now();
            frameCount.current++;

            if (now - lastFrameTime.current >= 1000) {
                setFps(frameCount.current);
                frameCount.current = 0;
                lastFrameTime.current = now;
            }

            requestAnimationFrame(updateFps);
        };

        const animationFrame = requestAnimationFrame(updateFps);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    // Стиль для контейнера с фиксированными размерами
    const containerStyle = {
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        overflow: 'hidden',
        position: 'relative' as const
    };

    return (
        <div style={containerStyle}>
            <Stage
                width={containerWidth}
                height={containerHeight}
                draggable
                ref={stageRef}
                onDragMove={limitDrag}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
                onClick={handleClick}
            >
                <Layer listening={false}>
                    {image && <ImageKonva
                        x={0}
                        y={0}
                        image={image}
                        ref={imageRef}
                        width={image.width}
                        height={image.height}
                    />}
                </Layer>
                <Layer
                    ref={seatsLayerRef}
                    listening={false}
                />
            </Stage>
            {/* Опциональный индикатор FPS для отладки производительности */}
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px 10px' }}>
                FPS: {fps} | Видимых мест: {getVisibleSeats().length} из {places.length}
            </div>
        </div>
    );
});
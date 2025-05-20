import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
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
class SpatialIndex {
    private grid: Map<string, SeatData[]> = new Map();
    private cellSize: number;
    private nearestCache: Map<string, SeatData | null> = new Map();
    private lastCacheClean: number = Date.now();
    private cacheLifetime: number = 1000; // 1 секунда жизни кэша

    constructor(cellSize: number = 20) {
        this.cellSize = cellSize;
    }

    add(seat: SeatData): void {
        const cellKey = this.getCellKey(seat.coodrinates.x, seat.coodrinates.y);
        if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, []);
        }
        this.grid.get(cellKey)!.push(seat);
    }

    buildIndex(seats: SeatData[]): void {
        this.grid.clear();
        this.clearCache();
        for (const seat of seats) {
            this.add(seat);
        }
    }

    clearCache(): void {
        this.nearestCache.clear();
        this.lastCacheClean = Date.now();
    }

    private getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX}:${cellY}`;
    }

    private getCacheKey(x: number, y: number, threshold: number): string {
        const roundedX = Math.round(x);
        const roundedY = Math.round(y);
        return `${roundedX}:${roundedY}:${threshold}`;
    }

    private getNeighborCells(x: number, y: number): string[] {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);

        const neighbors: string[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                neighbors.push(`${cellX + dx}:${cellY + dy}`);
            }
        }
        return neighbors;
    }

    findNearest(x: number, y: number, threshold: number = 15): SeatData | null {
        // Проверяем, не пора ли очистить кэш
        const now = Date.now();
        if (now - this.lastCacheClean > this.cacheLifetime) {
            this.clearCache();
        }

        const cacheKey = this.getCacheKey(x, y, threshold);
        if (this.nearestCache.has(cacheKey)) {
            return this.nearestCache.get(cacheKey)!;
        }

        let nearestSeat: SeatData | null = null;
        let minDistance = threshold;

        const neighborCells = this.getNeighborCells(x, y);

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

        this.nearestCache.set(cacheKey, nearestSeat);
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
    containerWidth?: number
    containerHeight?: number
    activeTab?: string
}

export const SvgAttrEditorKonva = memo(({
                                            places,
                                            onSeatClick,
                                            image,
                                            onSeatLeave,
                                            selectedPlaces,
                                            hoveredPlaces,
                                            onSeatHover,
                                            containerWidth = 800,
                                            containerHeight = 600,
                                            activeTab
                                        }:SvgAttrEditorKonvaProps) => {
    const stageRef = useRef<konva.Stage | null>(null);
    const imageRef = useRef<konva.Image>(null);
    const seatsLayerRef = useRef<konva.Layer | null>(null);
    const visibleSeatsLayerRef = useRef<SeatData[]>([]);
    const spatialIndexRef = useRef<SpatialIndex>(new SpatialIndex());
    const { limitDrag } = useLimitDrag(stageRef, imageRef);
    const [lastHoveredSeat, setLastHoveredSeat] = useState<string | null>(null);
    const previousRenderTimeRef = useRef<number>(0);
    const isRenderingRef = useRef<boolean>(false);
    const renderRequestedRef = useRef<boolean>(false);

    const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });

    const [stageSize, setStageSize] = useState({
        width: containerWidth,
        height: containerHeight
    });

    useEffect(() => {
        setStageSize({
            width: containerWidth,
            height: containerHeight
        });
    }, [containerWidth, containerHeight]);

    useEffect(() => {
        spatialIndexRef.current.buildIndex(places);
    }, [places]);

    const selectedPlacesLookup = useMemo(() => {
        return new Set(Object.keys(selectedPlaces));
    }, [selectedPlaces]);

    const hoveredPlacesLookup = useMemo(() => {
        return new Set(Object.keys(hoveredPlaces));
    }, [hoveredPlaces]);

    const getVisibleSeats = useCallback(() => {
        if (!stageRef.current) return places;

        const stage = stageRef.current;
        const transform = stage.getAbsoluteTransform().copy().invert();

        const topLeft = transform.point({ x: 0, y: 0 });
        const bottomRight = transform.point({
            x: stageSize.width,
            y: stageSize.height
        });

        const margin = 50;

        return places.filter(seat => {
            return seat.coodrinates.x >= topLeft.x - margin &&
                seat.coodrinates.x <= bottomRight.x + margin &&
                seat.coodrinates.y >= topLeft.y - margin &&
                seat.coodrinates.y <= bottomRight.y + margin;
        });
    }, [places, stageSize]);

    const renderSeats = useCallback(() => {
        if (!seatsLayerRef.current || isRenderingRef.current) {
            if (isRenderingRef.current) {
                renderRequestedRef.current = true;
            }
            return;
        }

        const now = performance.now();
        if (now - previousRenderTimeRef.current < 16) {
            return;
        }

        isRenderingRef.current = true;
        renderRequestedRef.current = false;
        previousRenderTimeRef.current = now;

        const layer = seatsLayerRef.current;
        const visibleSeats = getVisibleSeats();
        visibleSeatsLayerRef.current = visibleSeats;

        layer.destroyChildren();

        const categorizedPlaces: {[categoryId: string]: SeatData[]} = {};

        visibleSeats.forEach(place => {
            const categoryId = place.categoryId.toString();
            if (!categorizedPlaces[categoryId]) {
                categorizedPlaces[categoryId] = [];
            }
            categorizedPlaces[categoryId].push(place);
        });

        Object.entries(categorizedPlaces).forEach(([categoryId, placesInCategory]) => {
            const color = categoryColors[categoryId] || 'black';

            const batchShape = new konva.Shape({
                sceneFunc: (context, shape) => {
                    context.beginPath();

                    placesInCategory.forEach(place => {
                        const isSelected = selectedPlacesLookup.has(place.seatId);
                        const isHovered = hoveredPlacesLookup.has(place.seatId);

                        const radius = isHovered || isSelected ? 4 : 3;
                        const fillColor = isSelected ? 'blue' : color;

                        context.fillStyle = fillColor;
                        context.beginPath();
                        context.arc(place.coodrinates.x, place.coodrinates.y, radius, 0, Math.PI * 2);
                        context.closePath();
                        context.fill();

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

        requestAnimationFrame(() => {
            isRenderingRef.current = false;
            if (renderRequestedRef.current) {
                renderSeats();
            }
        });
    }, [getVisibleSeats, selectedPlacesLookup, hoveredPlacesLookup]);

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

    useEffect(() => {
        renderSeats();
    }, [places, selectedPlacesLookup, hoveredPlacesLookup, viewport, renderSeats, activeTab]);

    useHandleWheelEffect(stageRef, imageRef, image);
    useInitKonvaEffect(image, stageRef, imageRef);

    const debouncedHoverCheck = useRef<_.DebouncedFunc<(x: number, y: number) => void>>();

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
        }, 5);

        return () => {
            debouncedHoverCheck.current?.cancel();
        };
    }, [onSeatHover, onSeatLeave, lastHoveredSeat, activeTab]);

    useEffect(() => {
        spatialIndexRef.current.clearCache();

        if (lastHoveredSeat !== null) {
            setLastHoveredSeat(null);
            onSeatLeave?.();
        }

        if (stageRef.current) {
            const stage = stageRef.current;
            const pointerPosition = stage.getPointerPosition();

            if (pointerPosition) {
                const transform = stage.getAbsoluteTransform().copy().invert();
                const pos = transform.point(pointerPosition);

                setTimeout(() => {
                    debouncedHoverCheck.current?.(pos.x, pos.y);
                }, 20);
            }
        }
    }, [activeTab, onSeatLeave]);

    const handleMouseMove = useCallback(() => {
        if (!stageRef.current || !debouncedHoverCheck.current) return;

        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();

        if (!pointerPosition) return;

        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(pointerPosition);

        debouncedHoverCheck.current(pos.x, pos.y);
    }, []);

    const handleMouseOut = useCallback(() => {
        debouncedHoverCheck.current?.cancel();
        if (lastHoveredSeat !== null) {
            setLastHoveredSeat(null);
            onSeatLeave?.();
        }
    }, [onSeatLeave, lastHoveredSeat]);

    const handleClick = useCallback(() => {
        if (!stageRef.current) return;

        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();

        if (!pointerPosition) return;

        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(pointerPosition);

        const nearestSeat = spatialIndexRef.current.findNearest(pos.x, pos.y, 15);

        if (nearestSeat && onSeatClick) {
            onSeatClick(nearestSeat);
        }
    }, [onSeatClick]);

    const [fps, setFps] = useState(0);
    const lastFrameTime = useRef(performance.now());
    const frameCount = useRef(0);

    useEffect(() => {
        let animationFrameId: number;
        const frames: number[] = [];
        const maxFrames = 30;

        const updateFps = () => {
            const now = performance.now();
            const elapsed = now - lastFrameTime.current;

            frames.push(elapsed);
            if (frames.length > maxFrames) {
                frames.shift();
            }

            frameCount.current++;

            if (now - lastFrameTime.current >= 100) {
                const avgFrameTime = frames.reduce((sum, time) => sum + time, 0) / frames.length || 16.7;
                setFps(Math.round(1000 / avgFrameTime));

                frameCount.current = 0;
                lastFrameTime.current = now;
            }

            animationFrameId = requestAnimationFrame(updateFps);
        };

        animationFrameId = requestAnimationFrame(updateFps);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

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
                listening={true}
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
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px 10px' }}>
                FPS: {fps} | Видимых мест: {visibleSeatsLayerRef.current.length} из {places.length}
            </div>
        </div>
    );
});
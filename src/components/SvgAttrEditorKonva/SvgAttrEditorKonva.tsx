import {memo, ReactNode, useCallback, useMemo, useRef} from "react";
import {Circle, FastLayer, Image as ImageKonva, Layer, Stage} from "react-konva";
import konva from "konva";
import {useLimitDrag} from "./hooks/useLimitDrag.ts";
import {useHandleWheelEffect} from "./hooks/useHandleWheelEffect.ts";
import {SeatData} from "./Dto.ts";
import {useInitKonvaEffect} from "./hooks/useInitKonvaEffect.ts";
import {PlacesIds} from "./SvgAttrEditorKonvaWrap.tsx";

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

interface SvgAttrEditorKonvaProps{
    places: SeatData[]
    onSeatClick?: (value: SeatData)=> void
    onSeatHover?: (value: SeatData)=> void
    onSeatLeave?: ()=> void
    image: HTMLImageElement | null
    selectedPlaces: PlacesIds
    hoveredPlaces: PlacesIds;
}

export const SvgAttrEditorKonva = memo(({places, onSeatClick, image,onSeatLeave, selectedPlaces, hoveredPlaces, onSeatHover}:SvgAttrEditorKonvaProps) => {
    const stageRef = useRef<konva.Stage | null>(null);
    const imageRef = useRef<konva.Image>(null);
    const { limitDrag } = useLimitDrag(stageRef, imageRef)

    useHandleWheelEffect(stageRef, imageRef, image)
    useInitKonvaEffect(image, stageRef, imageRef);

    const onSeatClickHandler = useCallback((value:SeatData )=>()=>onSeatClick?.(value),[onSeatClick])
    const onMouseEnterHandler = useCallback((value: SeatData) => () => onSeatHover?.(value), [onSeatHover]);
    const onMouseLeaveHandler = useCallback(() => onSeatLeave?.(), [onSeatLeave]);
    const placesRender: ReactNode = useMemo(() => places.map((place) => (
        <Circle
            key={place.seatId}
            x={place.coodrinates.x}
            y={place.coodrinates.y}
            radius={hoveredPlaces[place.seatId] ? 5 : 3}
            fill={selectedPlaces[place.seatId] ? 'blue' : (categoryColors[`${place.categoryId}`]) || 'black'}
            onClick={onSeatClickHandler(place)}
            onMouseEnter={onMouseEnterHandler(place)}
            onMouseLeave={onMouseLeaveHandler}
        />
    )), [places, hoveredPlaces, selectedPlaces, onSeatClickHandler, onMouseEnterHandler, onMouseLeaveHandler])

    return (
        <Stage width={800} height={400} draggable ref={stageRef} onDragMove={limitDrag}>
            <FastLayer>
                {image && <ImageKonva
                    x={0}
                    y={0}
                    image={image}
                    ref={imageRef}
                    width={image.width}
                    height={image.height}
                />}
            </FastLayer>
            <Layer width={image?.width || 800} height={image?.height || 400}>
                {/* Подложка */}

                {/* Места */}
                {placesRender}
            </Layer>
        </Stage>
    );
})
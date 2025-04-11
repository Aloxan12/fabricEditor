import {memo, ReactNode, useCallback, useMemo, useRef} from "react";
import {Container, Sprite, Stage, StageRef,} from "react-pixi-fiber";
import {useLimitDrag} from "./hooks/useLimitDrag.ts";
import {SeatData} from "./Dto.ts";
import {PlacesIds} from "./SvgAttrEditorKonvaWrap.tsx";
import * as PIXI from "pixi.js";

// Маппинг категорий на цвета
const categoryColors: { [key: string]: string } = {
    "1": "#907c21",
    "2": "#d3d8b3",
    "3": "#ce16e2",
    "4": "#436a63",
    "5": "#6c33c9",
    "6": "#5757c6",
    "7": "#2d0aff",
    "8": "#d52846",
    "9": "#8c056f",
    "10": "#14228d",
    "11": "#288c22",
    "12": "#24474f",
    "13": "#32d84a",
    "14": "#4729f4",
    "15": "#1b6462",
    "16": "#c4442d",
    "17": "#fb0a35",
    "18": "#156dc7",
    "19": "#c6a505",
    "20": "#264e07",
};

interface SvgAttrEditorKonvaProps {
    places: SeatData[];
    onSeatClick?: (value: SeatData) => void;
    onSeatHover?: (value: SeatData) => void;
    onSeatLeave?: () => void;
    image: HTMLImageElement | null;
    selectedPlaces: PlacesIds;
    hoveredPlaces: PlacesIds;
}

export const SvgAttrEditorPixiJs = memo(
    ({
         places,
         onSeatClick,
         image,
         onSeatLeave,
         selectedPlaces,
         hoveredPlaces,
         onSeatHover,
     }: SvgAttrEditorKonvaProps) => {
        const stageRef = useRef<StageRef | null>(null);
        const imageRef = useRef<Sprite | null>(null);

        const { limitDrag } = useLimitDrag(stageRef, imageRef);

        // useHandleWheelEffect(stageRef, imageRef, image);

        const onSeatClickHandler = useCallback(
            (value: SeatData) => () => onSeatClick?.(value),
            [onSeatClick]
        );
        const onMouseEnterHandler = useCallback(
            (value: SeatData) => () => onSeatHover?.(value),
            [onSeatHover]
        );
        const onMouseLeaveHandler = useCallback(() => onSeatLeave?.(), [onSeatLeave]);

        const placesRender: ReactNode = useMemo(
            () =>
                places.map((place) => (
                    <Sprite
                        key={place.seatId}
                        x={place.coodrinates.x}
                        y={place.coodrinates.y}
                        width={6}
                        height={6}
                        interactive={true}
                        buttonMode={true}
                        texture={PIXI.Texture.WHITE} // Можно заменить на кастомное изображение
                        tint={
                            selectedPlaces[place.seatId]
                                ? 0x0000ff // Синий для выбранных мест
                                : parseInt(categoryColors[`${place.categoryId}`].replace("#", "0x"))
                        }
                        blendMode={PIXI.BLEND_MODES.NORMAL}
                        pointerdown={onSeatClickHandler(place)}
                        pointerover={onMouseEnterHandler(place)}
                        pointerout={onMouseLeaveHandler}
                    />
                )),
            [
                places,
                hoveredPlaces,
                selectedPlaces,
                onSeatClickHandler,
                onMouseEnterHandler,
                onMouseLeaveHandler,
            ]
        );

        return (
            <Stage
                options={{
                    width: 1000,
                    height: 500,
                    backgroundColor: 0xeeeeee, // Цвет фона
                    resolution: window.devicePixelRatio, // Устанавливаем разрешение
                }}
                ref={stageRef}
                interactive={true}
            >
                {image && (
                    <Container x={0} y={0}>
                        <Sprite
                            x={0}
                            y={0}
                            texture={PIXI.Texture.from(image)}
                            ref={imageRef}
                            width={image.width}
                            height={image.height}
                        />
                        {placesRender}
                    </Container>
                )}
            </Stage>
        );
    }
);
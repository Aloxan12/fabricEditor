import React, {useRef, useState} from "react";
import './SvgAttrEditor.css'

interface SvgZoomPanWrapperProps {
    width?: number; // Ширина контейнера
    height?: number; // Высота контейнера
    svgWidth: number; // Размеры исходного SVG
    svgHeight: number;
    children: React.ReactNode; // SVG-контент
}

export const SvgZoomPanWrapper: React.FC<SvgZoomPanWrapperProps> = ({
                                                                 width = 500,
                                                                 height = 500,
                                                                 svgWidth,
                                                                 svgHeight,
                                                                 children,
                                                             }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const [viewBox, setViewBox] = useState<[number, number, number, number]>([
        0,
        0,
        svgWidth,
        svgHeight,
    ]);
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.stopPropagation();
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const svgElement = svgRef.current;

        if (!svgElement) return;

        const rect = svgElement.getBoundingClientRect();

        // Координаты курсора мыши относительно SVG
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        // Преобразуем координаты курсора в координаты viewBox
        const relativeX = (cursorX / rect.width) * viewBox[2] + viewBox[0];
        const relativeY = (cursorY / rect.height) * viewBox[3] + viewBox[1];

        const [x, y, width, height] = viewBox;

        // Новые размеры для зумирования
        const newWidth = width * zoomFactor;
        const newHeight = height * zoomFactor;

        // Ограничение минимального и максимального зума
        if (newWidth < 10 || newWidth > svgWidth * 2) return;

        // Рассчитываем смещение viewBox так, чтобы центр зума совпадал с позицией мыши
        const newX = relativeX - ((relativeX - x) / width) * newWidth;
        const newY = relativeY - ((relativeY - y) / height) * newHeight;

        setViewBox([
            Math.max(0, Math.min(svgWidth - newWidth, newX)), // не выходить за границы по X
            Math.max(0, Math.min(svgHeight - newHeight, newY)), // не выходить за границы по Y
            newWidth,
            newHeight,
        ]);
    };

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        e.preventDefault(); // Отключить прокрутку страницы
        e.stopPropagation();
        setIsDragging(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isDragging || !startPoint) return;

        const dx = (startPoint.x - e.clientX) * (viewBox[2] / svgRef.current!.clientWidth);
        const dy = (startPoint.y - e.clientY) * (viewBox[3] / svgRef.current!.clientHeight);

        setViewBox((prev) => {
            const [x, y, width, height] = prev;

            return [
                Math.max(0, Math.min(svgWidth - width, x + dx)), // ограничение по горизонтали
                Math.max(0, Math.min(svgHeight - height, y + dy)), // ограничение по вертикали
                width,
                height,
            ];
        });

        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setStartPoint(null);
    };

    return (
        <div className='close-scroll'>
            <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={viewBox.join(" ")}
                width={width}
                height={height}
                style={{
                    border: "1px solid black",
                    'overflow': "auto",
                    'overscrollBehaviorY': "contain",
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {children}
            </svg>
        </div>
    );
};
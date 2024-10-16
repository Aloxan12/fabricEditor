import {useEffect, useRef, useState} from "react";
import * as d3 from 'd3';

export const SvgCanvas =  () => {
    const svgRef = useRef(null); // ссылка на SVG холст
    const [circles, setCircles] = useState([]); // состояние для хранения кругов

    // Обработка кликов по SVG для добавления кругов
    const handleSvgClick = (event) => {
        const { clientX, clientY } = event;
        const svg = svgRef.current;
        const point = svg.createSVGPoint(); // создание точки в координатах SVG
        point.x = clientX;
        point.y = clientY;

        const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse()); // преобразуем координаты в систему SVG

        // Добавляем новый круг в список
        const newCircle = {
            cx: svgPoint.x,
            cy: svgPoint.y,
            r: 20,
            fill: 'blue',
        };

        setCircles([...circles, newCircle]);
    };

    // Используем D3.js для работы с кругами при каждом рендере
    useEffect(() => {
        const svg = d3.select(svgRef.current);

        // Обновляем круги на основе данных
        svg.selectAll('circle')
            .data(circles)
            .join(
                enter => enter.append('circle')
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr('r', d => d.r)
                    .attr('fill', d => d.fill),
                update => update
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy),
                exit => exit.remove()
            );
    }, [circles]); // срабатывает каждый раз, когда изменяется массив кругов

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        // Добавление зума
        const zoomHandler = d3.zoom()
            .scaleExtent([1, 10]) // Ограничение масштаба
            .on('zoom', (event) => {
                svg.attr('transform', event.transform); // Применение трансформации
            });

        svg.call(zoomHandler); // Применяем обработчик зума

        // Обновляем круги на основе данных
        svg.selectAll('circle')
            .data(circles)
            .join(
                enter => enter.append('circle')
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr('r', d => d.r)
                    .attr('fill', d => d.fill),
                update => update
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy),
                exit => exit.remove()
            );
    }, [circles]);

    return (
        <div>
            <h3>Click on the canvas to add circles:</h3>
            <svg
                ref={svgRef}
                width="600"
                height="600"
                style={{ border: '1px solid black', borderRadius: '8px', backgroundColor: '#fff'}}
                onClick={handleSvgClick}
            >
            </svg>
        </div>
    );
};
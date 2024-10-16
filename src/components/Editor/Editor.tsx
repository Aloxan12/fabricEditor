import './Editor.css';
import {MouseEvent, useEffect, useRef, useState} from "react";
import * as d3 from 'd3';

interface Circle {
    id: number;
    cx: number;
    cy: number;
    r: number;
    fill: string;
}

interface Point {
    x: number;
    y: number;
}

interface SelectionRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

enum EditMenuType {
    'choose' = 'choose',
    'circle' = 'circle'
}

export const Editor = () => {
    const [currentTub, setCurrentTub] = useState<EditMenuType>(EditMenuType.choose)
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [circles, setCircles] = useState([])
    const [selectedCircle, setSelectedCircle] = useState(null);
    const [selectedCircles, setSelectedCircles] = useState<number[]>([]);
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [startPoint, setStartPoint] = useState<Point>({x: 0, y: 0});


    const addCircle = (event) => {
        const {clientX, clientY} = event;
        const svg = svgRef.current;
        const point = svg?.createSVGPoint();
        point.x = clientX;
        point.y = clientY;

        const svgPoint = point.matrixTransform(svg?.getScreenCTM().inverse());

        // Добавляем новый круг в список
        const newCircle = {
            id: circles.length,
            cx: svgPoint.x,
            cy: svgPoint.y,
            r: 14,
            fill: 'blue',
        };

        setCircles([...circles, newCircle]);
    }

    const chooseCircle = (event, circle) => {
        event.stopPropagation();
        setSelectedCircle(circle.id);
        setSelectedCircles([])
    };

    const handleSvgClick = (event) => {
        if (currentTub === EditMenuType.choose) {
            setSelectedCircle(null);
        }
        if (currentTub === EditMenuType.circle) {
            addCircle(event)
        }
    };


    const handleSvgMouseDown = (event: MouseEvent<SVGSVGElement>) => {
        if (currentTub === EditMenuType.choose) {
            const {clientX, clientY} = event;
            const svg = svgRef.current;
            if (!svg) return;

            const point = svg.createSVGPoint();
            point.x = clientX;
            point.y = clientY;
            const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

            setStartPoint(svgPoint);
            setIsSelecting(true);
        }
    };


    const handleSvgMouseMove = (event: MouseEvent<SVGSVGElement>) => {
        if (isSelecting) {
            const {clientX, clientY} = event;
            const svg = svgRef.current;
            if (!svg) return;

            const point = svg.createSVGPoint();
            point.x = clientX;
            point.y = clientY;
            const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

            const x = Math.min(startPoint.x, svgPoint.x);
            const y = Math.min(startPoint.y, svgPoint.y);
            const width = Math.abs(startPoint.x - svgPoint.x);
            const height = Math.abs(startPoint.y - svgPoint.y);

            setSelectionRect({x, y, width, height});

            const selected = circles.filter(circle =>
                circle.cx >= x &&
                circle.cx <= x + width &&
                circle.cy >= y &&
                circle.cy <= y + height
            ).map(circle => circle.id);

            setSelectedCircles(selected);
        }
    };

    const handleSvgMouseUp = () => {
        setIsSelecting(false);
        setSelectionRect(null);
    };

    const calculateGroupBounds = (selectedCircles: Circle[]) => {
        const minX = Math.min(...selectedCircles.map(c => c.cx - c.r));
        const minY = Math.min(...selectedCircles.map(c => c.cy - c.r));
        const maxX = Math.max(...selectedCircles.map(c => c.cx + c.r));
        const maxY = Math.max(...selectedCircles.map(c => c.cy + c.r));
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };


    useEffect(() => {
        const svg = d3.select(svgRef.current);

        svg.selectAll('circle')
            .data(circles)
            .join(
                enter => enter.append('circle')
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr('r', d => d.r)
                    .attr('seat', (_, i) => `место-${i}`)
                    .attr('fill', d => d.fill)
                    .attr('stroke', d => (selectedCircle === d.id ? 'red' : 'none'))
                    .attr('stroke-width', d => (selectedCircle === d.id ? 2 : 0))
                    .on('click', (event, d) => chooseCircle(event, d))
                    .call(
                        d3.drag().on('drag', function (event, d) {
                            d3.select(this)
                                .attr('cx', event.x)
                                .attr('cy', event.y);
                            setCircles(prevCircles =>
                                prevCircles.map(circle =>
                                    circle.id === d.id
                                        ? {...circle, cx: event.x, cy: event.y}
                                        : circle
                                )
                            );
                        })
                    ),
                update => update
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr('fill', d => d.fill)
                    .attr('stroke', d => (selectedCircle === d.id ? 'red' : 'none'))
                    .attr('stroke-width', d => (selectedCircle === d.id ? 2 : 0)),
                exit => exit.remove()
            );

        if (selectedCircles.length > 0) {
            const groupBounds = calculateGroupBounds(circles.filter(circle => selectedCircles.includes(circle.id)));

            svg.selectAll('rect.group-bounds').remove(); // Удаляем предыдущую рамку
            svg.append('rect')
                .attr('class', 'group-bounds')
                .attr('x', groupBounds.x)
                .attr('y', groupBounds.y)
                .attr('width', groupBounds.width)
                .attr('height', groupBounds.height)
                .attr('fill', 'rgba(66,68,90,0)')
                .attr('stroke', 'green')
                .attr('stroke-dasharray', '4')
                .attr('stroke-width', 2)
                // .on('click', (event, d) => event.stopPropagation())
                .call(
                    d3.drag()
                        .on('start', function (event) {
                            const initialX = parseFloat(d3.select(this).attr('x'));
                            const initialY = parseFloat(d3.select(this).attr('y'));

                            this._initialX = initialX;
                            this._initialY = initialY;

                            this._initialCircles = selectedCircles.map(circleId => {
                                const circle = circles.find(c => c.id === circleId);
                                return {id: circle.id, cx: circle.cx, cy: circle.cy};
                            });

                            this._offsetX = event.x - initialX;
                            this._offsetY = event.y - initialY;
                        })
                        .on('drag', function (event) {
                            const newX = event.x - this._offsetX;
                            const newY = event.y - this._offsetY;

                            d3.select(this)
                                .attr('x', newX)
                                .attr('y', newY);

                            setCircles(prevCircles =>
                                prevCircles.map(circle => {
                                    const isInclude = selectedCircles.includes(circle.id);
                                    if (isInclude) {
                                        const deltaX = newX - this._initialX;
                                        const deltaY = newY - this._initialY;
                                        return {
                                            ...circle,
                                            cx: this._initialCircles.find(c => c.id === circle.id).cx + deltaX,
                                            cy: this._initialCircles.find(c => c.id === circle.id).cy + deltaY
                                        };
                                    }
                                    return circle;
                                })
                            );
                        })
                ),
                exit => exit.remove()
        } else {
            svg.selectAll('rect.group-bounds').remove();
        }

        // Добавление выделяющего прямоугольника
        if (selectionRect) {
            svg.selectAll('rect.selection').remove();
            svg.append('rect')
                .attr('class', 'selection')
                .attr('x', selectionRect.x)
                .attr('y', selectionRect.y)
                .attr('width', selectionRect.width)
                .attr('height', selectionRect.height)
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-dasharray', '4')
        } else {
            svg.selectAll('rect.selection').remove();
        }

    }, [circles, selectedCircle, selectionRect]);

    return (
        <div className='page'>
            <div>d3 editor</div>
            <div className='wrapper'>
                <svg
                    ref={svgRef}
                    style={{
                        width: '500px',
                        height: '500px',
                        border: '1px solid black',
                        borderRadius: '8px',
                        backgroundColor: '#fff'
                    }}
                    onClick={handleSvgClick}
                    onMouseDown={handleSvgMouseDown}
                    onMouseMove={handleSvgMouseMove}
                    onMouseUp={handleSvgMouseUp}
                >
                </svg>
                <EditMenu currentTub={currentTub} setCurrentTub={setCurrentTub}/>
            </div>
        </div>

    );
}

const editMenuData = [EditMenuType.choose, EditMenuType.circle]

interface EditMenuProps {
    currentTub: EditMenuType
    setCurrentTub: (value: EditMenuType) => void
}

const EditMenu = ({currentTub, setCurrentTub}: EditMenuProps) => {
    const setCurrentTubHandler = (value: EditMenuType) => () => setCurrentTub(value)
    return <div className='menu-wrap'>
        {editMenuData.map(editMenu => <div key={editMenu} onClick={setCurrentTubHandler(editMenu)}
                                           className={currentTub === editMenu ? 'active item' : 'item'}>{editMenu}</div>)}
    </div>
}
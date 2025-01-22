import {useEffect, useRef, useState} from 'react';
import {Circle, Layer, Path, Rect, Stage, Transformer} from 'react-konva';

export const CanvasSvgEditor = () => {
    const [shapes, setShapes] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const transformerRef = useRef<any>(null);
    const layerRef = useRef<any>(null);

    useEffect(() => {
        if (transformerRef.current && selectedId) {
            const selectedNode = layerRef.current.findOne(`#${selectedId}`);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            }
        } else {
            transformerRef.current.nodes([]);
        }
    }, [selectedId]);

    const addRectangle = () => {
        const id = `rect-${shapes.length}`;
        setShapes([
            ...shapes,
            { id, type: 'rect', x: 50, y: 50, width: 100, height: 100, fill: 'blue' },
        ]);
    };

    const addCircle = () => {
        const id = `circle-${shapes.length}`;
        setShapes([
            ...shapes,
            { id, type: 'circle', x: 150, y: 150, radius: 50, fill: 'green' },
        ]);
    };

    const addPath = () => {
        const id = `path-${shapes.length}`;
        setShapes([
            ...shapes,
            {
                id,
                type: 'path',
                x: 100,
                y: 100,
                data: 'M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80',
                stroke: 'black',
                strokeWidth: 2,
            },
        ]);
    };

    const handleDragMove = (e: any, id: string) => {
        const newShapes = shapes.map((shape) =>
            shape.id === id
                ? { ...shape, x: e.target.x(), y: e.target.y() }
                : shape
        );
        setShapes(newShapes);
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
    };

    const handleTransform = (e: any, id: string) => {
        const node = e.target;
        const newShapes = shapes.map((shape) => {
            if (shape.id === id) {
                if (shape.type === 'rect') {
                    return {
                        ...shape,
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, node.width() * node.scaleX()),
                        height: Math.max(5, node.height() * node.scaleY()),
                        scaleX: 1,
                        scaleY: 1,
                    };
                }
                if (shape.type === 'circle') {
                    return {
                        ...shape,
                        x: node.x(),
                        y: node.y(),
                        radius: Math.max(5, node.radius() * node.scaleX()),
                        scaleX: 1,
                        scaleY: 1,
                    };
                }
                return shape;
            }
            return shape;
        });
        setShapes(newShapes);
    };

    return (
        <div>
            <button onClick={addRectangle}>Add Rectangle</button>
            <button onClick={addCircle}>Add Circle</button>
            <button onClick={addPath}>Add Path</button>
            <Stage
                width={800}
                height={600}
                style={{ border: '1px solid black' }}
                onMouseDown={(e) => {
                    // Deselect when clicking outside
                    if (e.target === e.target.getStage()) {
                        setSelectedId(null);
                    }
                }}
            >
                <Layer ref={layerRef}>
                    {shapes.map((shape) => {
                        if (shape.type === 'rect') {
                            return (
                                <Rect
                                    key={shape.id}
                                    id={shape.id}
                                    x={shape.x}
                                    y={shape.y}
                                    width={shape.width}
                                    height={shape.height}
                                    fill={shape.fill}
                                    draggable
                                    onDragMove={(e) => handleDragMove(e, shape.id)}
                                    onClick={() => handleSelect(shape.id)}
                                    onTransformEnd={(e) => handleTransform(e, shape.id)}
                                />
                            );
                        }
                        if (shape.type === 'circle') {
                            return (
                                <Circle
                                    key={shape.id}
                                    id={shape.id}
                                    x={shape.x}
                                    y={shape.y}
                                    radius={shape.radius}
                                    fill={shape.fill}
                                    draggable
                                    onDragMove={(e) => handleDragMove(e, shape.id)}
                                    onClick={() => handleSelect(shape.id)}
                                    onTransformEnd={(e) => handleTransform(e, shape.id)}
                                />
                            );
                        }
                        if (shape.type === 'path') {
                            return (
                                <Path
                                    key={shape.id}
                                    id={shape.id}
                                    x={shape.x}
                                    y={shape.y}
                                    data={shape.data}
                                    stroke={shape.stroke}
                                    strokeWidth={shape.strokeWidth}
                                    draggable
                                    onDragMove={(e) => handleDragMove(e, shape.id)}
                                    onClick={() => handleSelect(shape.id)}
                                />
                            );
                        }
                        return null;
                    })}
                    <Transformer ref={transformerRef} />
                </Layer>
            </Stage>
        </div>
    );
};
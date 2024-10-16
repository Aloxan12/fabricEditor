import {Canvas, Line} from "fabric";
import {IconButton} from 'blocksin-system'
import {useEffect, useState} from "react";

interface AddLineProps{
    canvas: Canvas | null
}

export const AddLine = ({canvas}:AddLineProps) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoints, setStartPoints] = useState<{ x: number, y: number } | null>(null);
    const [linePreview, setLinePreview] = useState<Line | null>(null);

    useEffect(() => {
        if (canvas) {
            const handleMouseDown = (options: any) => {
                if (!isDrawing) return;

                const pointer = canvas.getPointer(options.e);

                if (!startPoints) {
                    setStartPoints({ x: pointer.x, y: pointer.y });
                    const newLine = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                        stroke: 'blue',
                        strokeWidth: 2,
                        selectable: false,
                        evented: false,
                    });
                    setLinePreview(newLine);
                    canvas.add(newLine);
                } else {
                    const newLine = new Line([startPoints.x, startPoints.y, pointer.x, pointer.y], {
                        stroke: 'black',
                        strokeWidth: 2,
                    });
                    canvas.add(newLine);

                    if (linePreview) {
                        canvas.remove(linePreview);
                    }
                    setLinePreview(null);
                    setStartPoints(null);
                    // setIsDrawing(false);
                }
                canvas.renderAll();
            };

            const handleMouseMove = (options: any) => {
                if (!isDrawing || !startPoints || !linePreview) return;

                const pointer = canvas.getPointer(options.e);

                linePreview.set({
                    x2: pointer.x,
                    y2: pointer.y,
                });
                canvas.renderAll();
            };

            canvas.on('mouse:down', handleMouseDown);
            canvas.on('mouse:move', handleMouseMove);

            return () => {
                canvas.off('mouse:down', handleMouseDown);
                canvas.off('mouse:move', handleMouseMove);
            };
        }
    }, [isDrawing, startPoints, linePreview, canvas]);

    const toggleLineMode = () => {
        setIsDrawing((prev) => !prev);
        setStartPoints(null);
    };


    return (
        <IconButton onClick={toggleLineMode} size="big" variant="ghost">
            {isDrawing ? 'Stop Line' : 'Draw Line'}
        </IconButton>
    );
}
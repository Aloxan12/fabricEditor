import {useEffect, useState} from 'react';
import {Canvas, Path} from 'fabric';

interface AddCurvedLineProps {
    canvas: Canvas | null;
}

export const AddCurvedLine = ({ canvas }: AddCurvedLineProps) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoints, setStartPoints] = useState<{ x: number; y: number } | null>(null);
    const [curvePreview, setCurvePreview] = useState<Path | null>(null);

    useEffect(() => {
        if (canvas) {
            const handleMouseDown = (options: any) => {
                if (!isDrawing) return;

                const pointer = canvas.getPointer(options.e);

                if (!startPoints) {
                    // Первая точка
                    setStartPoints({ x: pointer.x, y: pointer.y });

                    // Инициализация превью полукруга
                    const pathString = `M ${pointer.x} ${pointer.y} Q ${pointer.x + 100} ${pointer.y - 100} ${pointer.x + 200} ${pointer.y}`;
                    const newCurve = new Path(pathString, {
                        stroke: 'blue',
                        strokeWidth: 2,
                        fill: '',
                        selectable: false,
                        evented: false,
                    });
                    setCurvePreview(newCurve);
                    canvas.add(newCurve);
                } else {
                    // Вторая точка
                    const pointerEnd = canvas.getPointer(options.e);
                    const pathString = `M ${startPoints.x} ${startPoints.y} Q ${pointerEnd.x} ${pointerEnd.y - 100} ${pointerEnd.x + 100} ${pointerEnd.y}`;
                    const newCurve = new Path(pathString, {
                        stroke: 'black',
                        strokeWidth: 2,
                    });
                    canvas.add(newCurve);

                    // Очистка превью и сброс точек
                    if (curvePreview) {
                        canvas.remove(curvePreview);
                    }
                    setCurvePreview(null);
                    setStartPoints(null);
                    setIsDrawing(false); // Завершение рисования линии
                }
                canvas.renderAll();
            };

            const handleMouseMove = (options: any) => {
                if (!isDrawing || !startPoints || !curvePreview) return;

                const pointer = canvas.getPointer(options.e);
                // Обновляем путь полукруга при движении мыши
                const pathString = `M ${startPoints.x} ${startPoints.y} Q ${pointer.x} ${pointer.y - 100} ${pointer.x + 100} ${pointer.y}`;
                curvePreview.set({ path: pathString });
                canvas.renderAll();
            };

            canvas.on('mouse:down', handleMouseDown);
            canvas.on('mouse:move', handleMouseMove);

            return () => {
                // Чистим обработчики, когда компонент размонтируется или isDrawing изменяется
                canvas.off('mouse:down', handleMouseDown);
                canvas.off('mouse:move', handleMouseMove);
            };
        }
    }, [isDrawing, startPoints, curvePreview, canvas]);

    const toggleLineMode = () => {
        setIsDrawing((prev) => !prev);
        setStartPoints(null); // Сброс начальных точек при включении режима рисования
    };

    return (
        <button onClick={toggleLineMode}>
            {isDrawing ? 'Stop Curve Drawing' : 'Draw Curve'}
        </button>
    );
};
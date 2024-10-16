import cls from './FabricjsEditor.module.scss'
import {useEffect, useRef, useState} from "react";
import {Canvas, Circle, Line, Path, Rect} from 'fabric';
import {IconButton} from 'blocksin-system'
import {CircleIcon, SquareIcon} from 'sebikostudio-icons'
import {Settings} from "./Settings/Settings";


export const FabricJsEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [canvas, setCanvas] = useState<Canvas | null>(null)
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [linePreview, setLinePreview] = useState<Line | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (canvasRef?.current) {
            const initCanvas = new Canvas(canvasRef!.current!, {
                width: 500,
                height: 500,
            })
            initCanvas.backgroundColor = '#fff'
            initCanvas.renderAll()

            setCanvas(initCanvas)

            return () => {
                initCanvas.dispose()
            }
        }
    }, []);

    const addRectangle = ()=>{
       if(canvas){
           const rect = new Rect({
               top: 100,
               left: 50,
               width: 100,
               height: 60,
               fill: '#D84D42'
           })
           canvas.add(rect)
       }
    }

    const addPath = ()=> {
        if(canvas) {
            const pathData = 'M 100 100 C 200 200, 300 100, 400 200';
            const path = new Path(pathData, {
                left: 0,
                top: 0,
                strokeWidth: 3,
                stroke: 'blue',
                fill: '',
            });
            canvas.add(path);
        }
    };

    const addCircle = ()=>{
        if(canvas){
            const circle = new Circle({
                top: 150,
                left: 150,
                radius: 50,
                fill: '#F59D42'
            })
            canvas.add(circle)
        }
    }

    const startDrawing = () => {
        if (canvas) {
            canvas.isDrawingMode = true;
            // canvas.freeDrawingBrush = new PencilBrush(canvas);
            // canvas.freeDrawingBrush.color = 'blue'; // Установите цвет кисти
            // canvas.freeDrawingBrush.width = 5; // Установите ширину кисти
            //
            // canvas.on('mouse:up', () => {
            //     canvas.isDrawingMode = false;
            // });
        }
    };

    const drawLinePreview = (event: any) => {
        if (isDrawing && startPoint && canvas) {
            canvas.isDrawingMode = true;
            const pointer = canvas!.getPointer(event.e);
            if (linePreview) {
                // Обновление конечной точки линии-превью
                linePreview.set({
                    x2: pointer.x,
                    y2: pointer.y,
                });
                canvas?.renderAll();
            }
        }
    };

    const finishDrawing = (event: any) => {
        if (isDrawing && startPoint) {
            const pointer = canvas!.getPointer(event.e);
            const line = new Line(
                [startPoint.x, startPoint.y, pointer.x, pointer.y],
                {
                    stroke: "blue",
                    strokeWidth: 2,
                }
            );

            canvas?.add(line); // Добавляем линию на холст
            canvas?.remove(linePreview!); // Убираем линию-превью
            setLinePreview(null); // Сбрасываем превью
            setIsDrawing(false); // Завершаем рисование
            setStartPoint(null); // Сбрасываем начальную точку
        }
    };

    return (
        <div className={cls.page}>
            <div>title FabricJsEditor</div>
            <div className={cls.canvasWrap}>
                <div className={cls.toolbar}>
                    <IconButton onClick={addRectangle} size='medium' variant='ghost'>
                        <SquareIcon />
                    </IconButton>
                    <IconButton onClick={addCircle} size='medium' variant='ghost'>
                        <CircleIcon  />
                    </IconButton>
                    <IconButton onClick={addPath} size='medium' variant='ghost'>
                        path
                    </IconButton>
                    <IconButton onClick={startDrawing} size='medium' variant='ghost'>
                        pan
                    </IconButton>
                    <IconButton onClick={startDrawing} size='medium' variant='ghost'>
                        line
                    </IconButton>
                </div>
                <canvas id='canvas' ref={canvasRef}/>
                <Settings canvas={canvas}
                          onMouseMove={drawLinePreview}
                          onMouseUp={finishDrawing}/>
            </div>
        </div>
    );
}
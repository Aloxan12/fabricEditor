import cls from './FabricjsEditor.module.scss'
import {useEffect, useRef, useState} from "react";
import {Canvas, Circle, Rect} from 'fabric';
import {IconButton} from 'blocksin-system'
import {CircleIcon, SquareIcon} from 'sebikostudio-icons'


export const FabricJsEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [canvas, setCanvas] = useState<Canvas | null>(null)

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
                </div>
                <canvas id='canvas' ref={canvasRef}/>
            </div>
        </div>
    );
}
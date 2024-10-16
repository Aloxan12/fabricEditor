import {MutableRefObject, useEffect, useState} from "react";
import {Canvas} from "fabric";

export const useGetCanvas = (canvasRef: MutableRefObject<HTMLCanvasElement | null>)=>{
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

    return canvas
}
import cls from './FabricjsEditor.module.scss'
import {useRef} from "react";
import {Canvas} from 'fabric';
import {Settings} from "./Settings/Settings";
import {useGetCanvas} from "./hooks/useGetCanvas";
import {Toolbar} from "./Toolbar/Toolbar";


export const FabricJsEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvas: Canvas | null = useGetCanvas(canvasRef)

    return (
        <div className={cls.page}>
            <div>title FabricJsEditor</div>
            <div className={cls.canvasWrap}>
                <Toolbar canvas={canvas} />
                <canvas id='canvas' ref={canvasRef}/>
                <Settings canvas={canvas} />
            </div>
        </div>
    );
}
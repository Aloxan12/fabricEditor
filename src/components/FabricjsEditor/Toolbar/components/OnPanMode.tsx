import {IconButton} from 'blocksin-system'
import {Canvas, PencilBrush} from "fabric";

interface OnPanModeProps{
    canvas: Canvas | null
}

export const OnPanMode = ({canvas}:OnPanModeProps)=>{

    const startDrawing = () => {
        if (canvas) {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new PencilBrush(canvas);
            canvas.freeDrawingBrush.color = 'blue'; // Установите цвет кисти
            canvas.freeDrawingBrush.width = 5; // Установите ширину кисти

            canvas.on('mouse:up', () => {
                canvas.isDrawingMode = false;
            });
        }
    };
    return <IconButton onClick={startDrawing} size='medium' variant='ghost'>
       pen
    </IconButton>
}
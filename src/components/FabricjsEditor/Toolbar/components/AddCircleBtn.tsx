import {Canvas, Circle} from "fabric";

interface AddCircleBtnProps{
    canvas: Canvas | null
}

export const AddCircleBtn = ({canvas}:AddCircleBtnProps)=>{

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

    return <button onClick={addCircle}>
        круг
    </button>
}
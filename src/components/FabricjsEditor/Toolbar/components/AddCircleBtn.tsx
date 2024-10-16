import {CircleIcon} from 'sebikostudio-icons'
import {IconButton} from 'blocksin-system'
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

    return <IconButton onClick={addCircle} size='big' variant='ghost'>
        <CircleIcon  />
    </IconButton>
}
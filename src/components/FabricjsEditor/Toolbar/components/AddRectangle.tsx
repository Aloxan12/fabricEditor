import {SquareIcon} from 'sebikostudio-icons'
import {IconButton} from 'blocksin-system'
import {Canvas, Rect} from "fabric";

interface AddRectangleProps{
    canvas: Canvas | null
}

export const AddRectangle = ({canvas}:AddRectangleProps) => {

    const addRectangle = ()=>{
        if(canvas){
            const rect = new Rect({
                top: 100,
                left: 50,
                width: 100,
                height: 60,
                fill: '#D84D42',
                cornerSize:5,
            })
            canvas.add(rect)
        }
    }

    return (
        <IconButton onClick={addRectangle} size='big' variant='ghost'>
            <SquareIcon />
        </IconButton>
    );
}
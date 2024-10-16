import {useEffect, useState} from "react";
import {Canvas} from "fabric";
import cls from './Settings.module.scss'
import {Input} from 'blocksin-system'

interface SettingsProps{
    canvas: Canvas | null
}

export const Settings = ({canvas}:SettingsProps) => {
    const [selectedObject, setSelectedObject] = useState(null)
    const [width, setWidth] = useState<string | number>('')
    const [height, setHeight] = useState<string | number>('')
    const [diameter, setDiameter] = useState<string | number>('')
    const [color, setColor] = useState<string>('')


    const handleObjectSelection = (object: any)=>{
        if(!object) return null
        setSelectedObject(object)
        if(object.type === 'rect'){
            setWidth(Math.round(object.width * object.scaleX))
            setHeight(Math.round(object.height * object.scaleY))
            setColor(object.fill)
            setDiameter('')
        }else if(object.type === 'circle'){
            setColor(object.fill)
            setDiameter(Math.round(object.radius * 2 * object.scaleX))
            setWidth('')
            setHeight('')
        }
    }

    const clearSettings = ()=>{
        setColor('')
        setDiameter('')
        setWidth('')
        setHeight('')
    }

    useEffect(()=>{
        if(canvas){
            canvas.on('selection:created', (event)=>{
                handleObjectSelection(event.selected[0])
            })
            canvas.on('selection:updated', (event)=>{
                handleObjectSelection(event.selected[0])
            })
            canvas.on('selection:cleared', ()=>{
                setSelectedObject(null)
                clearSettings()
            })
            canvas.on('object:modified', (event)=>{
                handleObjectSelection(event.target)
            })
            canvas.on('object:scaling', (event)=>{
                handleObjectSelection(event.target)
            })
        }
    },[canvas])


    const handleWidthChange = (e: any)=>{
        const value = e.target.value.replace(/,/g, '')
        const initValue = parseInt(value, 10)
        setWidth(initValue)
        if(selectedObject && selectedObject.type === 'rect' && initValue >=0 && canvas){
            selectedObject.set({width: initValue / selectedObject.scaleX})
            canvas.renderAll()
        }

    }
    const handleHeightChange = (e: any)=>{
        const value = e.target.value.replace(/,/g, '')
        const initValue = parseInt(value, 10)
        setHeight(initValue)
        if(selectedObject && selectedObject.type === 'rect' && initValue >=0 && canvas){
            selectedObject.set({height: initValue / selectedObject.scaleY})
            canvas.renderAll()
        }

    }
    const handleDiameterChange = (e: any)=>{
        const value = e.target.value.replace(/,/g, '')
        const initValue = parseInt(value, 10)
        setDiameter(initValue)
        if(selectedObject && selectedObject.type === 'circle' && initValue >=0 && canvas){
            selectedObject.set({radius: initValue / 2 / selectedObject.scaleX})
            canvas.renderAll()
        }
    }
    const handleColorChange = (e: any)=>{
        const value = e.target.value
        setColor(value)
        if(selectedObject && canvas){
            selectedObject.set({fill: value})
            canvas.renderAll()
        }
    }

    return (
        <div className={cls.setting}>
            {selectedObject && selectedObject.type === 'rect' && (
                <>
                    <Input fluid label='Width' value={width} onChange={handleWidthChange} />
                    <Input fluid label='Height' value={height} onChange={handleHeightChange} />
                    <Input fluid label='Color' type='color' value={color} onChange={handleColorChange} />
                </>
            )}
            {selectedObject && selectedObject.type === 'circle' && (
                <>
                    <Input fluid label='Diameter' value={diameter} onChange={handleDiameterChange} />
                    <Input fluid label='Color' type='color' value={color} onChange={handleColorChange} />
                </>
            )}
        </div>
    );
}
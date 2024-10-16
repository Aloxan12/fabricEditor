import {Canvas} from 'fabric';
import cls from "./Toolbar.module.scss";
import {AddCircleBtn} from "./components/AddCircleBtn";
import {OnPanMode} from "./components/OnPanMode";
import {AddRectangle} from "./components/AddRectangle";
import {AddLine} from "./components/AddLine";
import {AddCurvedLine} from "./components/AddCurvedLine";

interface ToolbarProps{
    canvas: Canvas | null
}

export const Toolbar = ({canvas}:ToolbarProps) => {


    return (
        <div className={cls.toolbar}>
            <AddRectangle canvas={canvas} />
            <AddCircleBtn canvas={canvas} />
            <OnPanMode canvas={canvas} />
            <AddLine canvas={canvas} />
            <AddCurvedLine canvas={canvas} />
        </div>
    );
}
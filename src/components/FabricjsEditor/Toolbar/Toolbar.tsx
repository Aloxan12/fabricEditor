import {Canvas} from 'fabric';
import cls from "./Toolbar.module.scss";
import {AddCircleBtn} from "./components/AddCircleBtn";
import {OnPanMode} from "./components/OnPanMode";
import {AddRectangle} from "./components/AddRectangle";

interface ToolbarProps{
    canvas: Canvas | null
}

export const Toolbar = ({canvas}:ToolbarProps) => {

    return (
        <div className={cls.toolbar}>
            <AddRectangle canvas={canvas} />
            <AddCircleBtn canvas={canvas} />
            <OnPanMode canvas={canvas} />
        </div>
    );
}
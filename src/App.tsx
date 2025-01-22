import './App.css'
import {useState} from 'react'
// @ts-ignore
import {AppCheckbox} from 'todoList/components'
// @ts-ignore
import TodoList from 'todoList/TodoList'
import {Editor} from "./components/Editor/Editor";
import {FabricJsEditor} from "./components/FabricjsEditor/FabricjsEditor";
import {SvgAttrEditorKonvaWrap} from "./components/SvgAttrEditorKonva/SvgAttrEditorKonvaWrap.tsx";

function App() {
    const [value, setValue] = useState(false)
    return (
        <div className='wrap'>
            <div>main</div>
            <SvgAttrEditorKonvaWrap />
            {/*<SvgAttrEditor svg={Svg}/>*/}
            <FabricJsEditor/>
            <AppCheckbox text={'check'}
                         value={value}
                         onChange={setValue}
                         id={1} />
            <TodoList/>
            <Editor/>
        </div>
    )
}

export default App
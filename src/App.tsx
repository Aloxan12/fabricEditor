import './App.css'
import {useState} from 'react'
// @ts-ignore
import {AppCheckbox} from 'todoList/components'
// @ts-ignore
import TodoList from 'todoList/TodoList'
import {Editor} from "./components/Editor/Editor";
import {FabricJsEditor} from "./components/FabricjsEditor/FabricjsEditor";
import {SvgAttrEditor} from "./components/SvgAttrEditor/SvgAttrEditor.tsx";
import {ReactComponent as Svg} from './it.svg';

function App() {
    const [value, setValue] = useState(false)
    return (
        <div className='wrap'>
            <div>main</div>
            <SvgAttrEditor svg={Svg}/>
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
import './App.css'
import {useState} from 'react'
import {AppCheckbox} from 'todoList/components'
import TodoList from 'todoList/TodoList'
import {Editor} from "./components/Editor/Editor";
import {FabricJsEditor} from "./components/FabricjsEditor/FabricjsEditor";

function App() {
    const [value, setValue] = useState(false)
    return (
        <div>
            <div>main</div>
            <FabricJsEditor/>
            <AppCheckbox text={'check'}
                         value={value}
                         onChange={setValue}
                         id={1}/>
            <TodoList/>
            <Editor/>
        </div>
    )
}

export default App

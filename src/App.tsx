import './App.css'
import { useState} from 'react'
import {AppCheckbox} from 'todoList/components'
import TodoList from 'todoList/TodoList'
import {Editor} from "./components/Editor/Editor";

function App() {
    const [value, setValue] = useState(false)
  return (
    <div>
      <div>main</div>
        <Editor />
        {/*<Suspense fallback='Loader'>*/}
        <AppCheckbox text={'check'}
                     value={value}
                     onChange={setValue}
                     id={1} />
        <TodoList />
        {/*</Suspense>*/}
    </div>
  )
}

export default App

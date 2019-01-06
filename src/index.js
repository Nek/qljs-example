import { mount } from 'qljs'
import './App.css'
import TodoList from './components/TodoList'
import './parsers'
import remoteHandler from './remoteHandler'

let state = {
  loading: true,
  todos: {},
  areas: {},
}

mount({
  state,
  remoteHandler,
})({
  component: TodoList,
  element: document.getElementById('root'),
})

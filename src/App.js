import React, { useState } from 'react'
import './App.css'
import { createInstance, getQuery, mount, query, transact } from './ql'

const Todo = query([['title', {}], ['done', {}], ['id', {}]], props => {
  const { title } = props
  return (
    <li>
      {title}
      {<button onClick={() => transact(props, [['todo/delete']])}>x</button>}
    </li>
  )
})

const TodoList = query([['todos', {}, ...getQuery(Todo)]], props => {
  const [title, setTitle] = useState('')
  return (
    <div>
      <input onChange={e => setTitle(e.target.value)} value={title} />
      <button
        onClick={() => {
          transact(props, [['todo/new', { title }]])
          setTitle('')
        }}>
        Add
      </button>
      <ul>{props.todos.map(todo => createInstance(Todo, todo))}</ul>
    </div>
  )
})

let state = {
  todos: {
    0: { title: 'Buy milk', done: false },
    1: { title: 'Do dishes', done: true },
  },
}

const remoteHandler = (query, callback) => {
  console.log(query)
}

mount({
  component: TodoList,
  element: document.getElementById('root'),
  state,
  remoteHandler,
})

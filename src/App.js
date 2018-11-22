import React, { useState } from 'react'
import uuid from 'uuid'
import './App.css'
import {
  createInstance,
  getQuery,
  parseChildren,
  parseChildrenRemote,
  parsers,
  mount,
  query,
  transact,
} from './ql'

const { read, mutate, remote } = parsers

read['title'] = (term, { id }, state) => {
  return state.todos[id] && state.todos[id].title
}

read['done'] = (term, { id }, state) => {
  return state.todos[id] && state.todos[id].done
}

read['id'] = (term, { id }, state) => {
  return state.todos[id] && id
}

read['todos'] = (term, env, state) => {
  const [, { id }] = term
  if (id) {
    return parseChildren(term, { ...env, id })
  } else {
    const res = Object.keys(state.todos).map(id =>
      parseChildren(term, { ...env, id }),
    )
    return res
  }
}

mutate['todo/delete'] = (term, { id }, state) => {
  const newTodos = { ...state.todos }
  delete newTodos[id]
  state.todos = newTodos
}

mutate['todo/new'] = ([key, { title }], {}, state) => {
  state.todos = { ...state.todos, [uuid()]: { title, done: false } }
}

remote['todo/new'] = (queryTerm, state) => {
  return queryTerm
}

remote['todo/delete'] = (queryTerm, state) => {
  return queryTerm
}

remote['title'] = (queryTerm, state) => {
  return queryTerm
}

remote['done'] = (queryTerm, state) => {
  return queryTerm
}

remote['id'] = (queryTerm, state) => {
  return queryTerm
}

remote['todos'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

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

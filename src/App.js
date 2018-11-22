import React from 'react'
import {
  parseChildren,
  registerQuery,
  parseQueryIntoMap,
  getQuery,
  transact,
  parsers,
} from './ql'
import createMultimethod from './multimethod'
import './App.css'

import uuid from 'uuid'

function createInstance(Component, atts) {
  const { env, query } = atts
  return React.createElement(Component, { ...atts, env, query, key: env.id })
}

const { read, mutate } = parsers

read['title'] = (term, { id }) => {
  return state.todos[id].title
}
read['done'] = (term, { id }) => {
  return state.todos[id].done
}
read['todos'] = (term, env) => {
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

mutate['todo/delete'] = (term, { id }) => {
  const newTodos = { ...state.todos }
  delete newTodos[id]
  state = { ...state, todos: newTodos }
}
mutate['todo/add'] = ([key, { title }]) => {
  state = {
    ...state,
    todos: { ...state.todos, [uuid()]: { title, done: false } },
  }
}

const Todo = registerQuery([['title'], ['done']], props => {
  const { title, done } = props
  return (
    <li>
      {title}
      {<button onClick={() => transact(props, [['todo/delete']])}>x</button>}
    </li>
  )
})

const TodoList = registerQuery([['todos', {}, ...getQuery(Todo)]], props => {
  return (
    <div>
      <button onClick={() => transact(props, [['todo/add', { title: '123' }]])}>
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

const App = () => {
  const atts = parseQueryIntoMap(getQuery(TodoList), {})
  return createInstance(TodoList, atts)
}

export default App

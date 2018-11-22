import React from 'react'
import uuid from 'uuid'
import './App.css'
import {
  createInstance,
  getQuery,
  parseChildren,
  parseChildrenRemote,
  parsers,
  QL,
  query,
  transact,
} from './ql'

const { read, mutate, remote } = parsers

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

remote['todos'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

remote['todo/add'] = (queryTerm, state) => {
  return queryTerm
}

const Todo = query([['title'], ['done']], props => {
  const { title } = props
  return (
    <li>
      {title}
      {<button onClick={() => transact(props, [['todo/delete']])}>x</button>}
    </li>
  )
})

const TodoList = query([['todos', {}, ...getQuery(Todo)]], props => {
  return (
    <div>
      <button
        onClick={() =>
          transact(props, [
            ['todo/add', { title: '123' }],
            ['todo/add', { title: '123' }],
          ])
        }>
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

export default QL(TodoList)

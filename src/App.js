import React from 'react'
import {
  parseChildren,
  registerQuery,
  parseQueryIntoMap,
  getQuery,
  transact,
} from './ql'
import createMultimethod from './multimethod'
import './App.css'

function createInstance(Component, atts) {
  const { env, query } = atts
  return React.createElement(Component, { ...atts, env, query, key: env.id })
}

const read = createMultimethod()

read['title'] = (term, { id }, state) => {
  return state.todos[id].title
}
read['done'] = (term, { id }, state) => {
  return state.todos[id].done
}
read['todos'] = (term, env, state) => {
  const [, { id }] = term
  if (id) {
    return parseChildren(state, { read, mutate }, term, { ...env, id })
  } else {
    const res = Object.keys(state.todos).map(id =>
      parseChildren(state, { read, mutate }, term, { ...env, id }),
    )
    return res
  }
}

const mutate = createMultimethod()
mutate['todo/delete'] = (term, { id }) => {
  const newTodos = { ...state.todos }
  delete newTodos[id]
  state = { ...state, todos: newTodos }
}
// (defmethod mutate :todo/delete!
//   [query-term {:keys [todo-id] :as env} state-atom]
//   (swap! state-atom update :todo/by-id dissoc todo-id))

const Todo = registerQuery([['title'], ['done']], props => {
  const { title, done } = props
  return (
    <li>
      {title}
      {
        <button
          onClick={() =>
            transact(state, { read, mutate }, props, [['todo/delete']])
          }>
          x
        </button>
      }
    </li>
  )
})

const TodoList = registerQuery([['todos', {}, ...getQuery(Todo)]], props => {
  return <ul>{props.todos.map(todo => createInstance(Todo, todo))}</ul>
})

let state = {
  todos: {
    0: { title: 'Buy milk', done: false },
    1: { title: 'Do dishes', done: true },
  },
}

const App = () => {
  const atts = parseQueryIntoMap(
    state,
    { read, mutate },
    getQuery(TodoList),
    {},
  )
  return createInstance(TodoList, atts)
}

export default App

import React from 'react'
import * as atom from '@thi.ng/atom'
import {
  parseChildren,
  registerQuery,
  parseQueryIntoMap,
  getQuery,
  dispatch,
} from './ql'
import createMultimethod from './multimethod'
import './App.css'

function createInstance(Component, atts) {
  const { env, query } = atts
  return React.createElement(Component, { ...atts, env, query, key: env.id })
}

const read = createMultimethod()

read.title = (term, { id }, state) => {
  return state.todos[id].title
}
read.done = (term, { id }, state) => {
  return state.todos[id].done
}
read.todos = (term, env, state) => {
  const [, { id }] = term
  if (id) {
    return parseChildren(state, { read }, term, { ...env, id })
  } else {
    const res = Object.keys(state.todos).map(id =>
      parseChildren(state, { read }, term, { ...env, id }),
    )
    return res
  }
}

const mutate = createMultimethod()
mutate['todo/delete'] = (term, { id }, state) => {
  delete state.todos[id]
}

// (defmethod mutate :todo/delete!
//   [query-term {:keys [todo-id] :as env} state-atom]
//   (swap! state-atom update :todo/by-id dissoc todo-id))

const Todo = registerQuery([['title'], ['done']], ({ title, done }) => (
  <li>
    {title}
    {<button onClick={() => dispatch(this, ['todo/delete'])}>x</button>}
  </li>
))

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
  const atts = parseQueryIntoMap(state, { read }, getQuery(TodoList), {})
  return createInstance(TodoList, atts)
}

export default App

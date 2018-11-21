import React from 'react'
import { parseChildren, registerQuery, parseQueryIntoMap, getQuery } from './ql'
import createMultimethod from './multimethod'
import './App.css'

function createInstance(Component, atts) {
  const { env, query } = atts
  return React.createElement(Component, { atts, env, query })
}

const dispatch = ([first]) => first
const noMatch = term => {
  throw new Error('No match for ' + term)
}
const read = createMultimethod(dispatch, noMatch)

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

const mutate = createMultimethod(dispatch, noMatch)

const Todo = registerQuery(
  [['title'], ['done']],
  ({ atts: { title, done } }) => (
    <li>
      {title} {done ? 'v' : 'o'}
    </li>
  ),
)

const TodoList = registerQuery([['todos', {}, ...getQuery(Todo)]], props => {
  const todos = props.atts.todos
  return <ul>{todos.map(todo => createInstance(Todo, todo))}</ul>
})

const state = {
  todos: {
    0: { title: 'Buy milk', done: false },
    1: { title: 'Do dishes', done: true },
  },
}

const App = () => {
  const atts = parseQueryIntoMap(state, { read }, getQuery(TodoList), {})
  console.log(atts)
  return createInstance(TodoList, atts)
}

export default App

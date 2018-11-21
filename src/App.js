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

read.name = (term, { personId }, state) => {
  return state.todos[personId].name
}
read.age = (term, { personId }, state) => {
  return state.todos[personId].age
}
read.todos = (term, env, state) => {
  const [, { personId }] = term
  if (personId) {
    return parseChildren(state, { read }, term, { ...env, personId })
  } else {
    const res = Object.keys(state.todos).map(personId =>
      parseChildren(state, { read }, term, { ...env, personId }),
    )
    return res
  }
}

const Todo = registerQuery([['name'], ['age']], ({ atts: { name, age } }) => (
  <li>
    {name} {age}
  </li>
))

const TodoList = registerQuery([['todos', {}, ...getQuery(Todo)]], props => {
  const todos = props.atts.todos
  return <ol>{todos.map(todo => createInstance(Todo, todo))}</ol>
})

const state = {
  todos: {
    0: { name: 'Nik', age: 37 },
    1: { name: 'Alya', age: 32 },
  },
}

const App = () => {
  const atts = parseQueryIntoMap(state, { read }, getQuery(TodoList), {})
  console.log(atts)
  return createInstance(TodoList, atts)
}

export default App

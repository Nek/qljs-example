import React, { useState } from 'react'
import './App.css'

import uuid from 'uuid/v4'

const registry = new Map()

const query = q => comp => {
  registry.set(comp, { query: q })
  return comp
}

const state = {
  'app/todos': {
    0: { 'todo/text': 'First' },
    1: { 'todo/text': 'Second' },
    2: { 'todo/text': 'Third' },
  },
}

const parse = q => {
  switch (q) {
    case 'app/todos':
      return {
        todos: Object.entries(state[q]).map(([id, data]) => ({
          text: data['todo/text'],
          id,
        })),
      }
    case 'todo/text':
      return { text: state[q] }
    default: {
    }
  }
}

const TextItem = ({ text }) => {
  return <li>{text}</li>
}

const Todo = query('todo/text')(TextItem)

const Todos = query('app/todos')(({ todos }) => {
  return (
    <ol>
      {Object.values(todos).map(({ text }) => (
        <li>{text}</li>
      ))}
    </ol>
  )
})

const render = Comp => {
  const props = parse(registry.get(Comp).query)
  debugger
  return <Comp {...props} />
}

const App = () => {
  return render(Todos)
}

export default App

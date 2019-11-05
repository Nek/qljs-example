import React, { useEffect, useState } from 'react'
import './parsers'
import { mount, component, transact, multimethod, render } from 'qljs'
import uuid from 'uuid'
import './App.css'

const Todo = component([['todoId'], ['text']], ctx => {
  const { text, transact } = ctx
  return (
    <li>
      {text}
      {
        <button
          onClick={() => {
            transact([['todo/delete']])
          }}>
          x
        </button>
      }
    </li>
  )
})

Todo.displayName = 'Todo'

const Area = component([['areaId'], ['areaTitle'], ['todos', Todo]], ctx => {
  const { areaTitle, todos } = ctx
  return (
    <ul>
      <label key="label">{areaTitle}</label>
      <div>{render(todos, Todo)}</div>
    </ul>
  )
})

Area.displayName = 'Area'

const AreaOption = component([['areaId'], ['areaTitle']], ctx => {
  const { areaId, areaTitle } = ctx
  return <option value={areaId}>{areaTitle}</option>
})

AreaOption.displayName = 'AreaOption'

const TodoList = component(
  [['areas', {}, Area, AreaOption], ['loading']],
  ctx => {
    const { areas, loading, transact } = ctx

    useEffect(() => {
      transact([['app/init']])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [text, setText] = useState('')
    const [area, setArea] = useState(0)

    return (
      <div>
        {loading ? (
          <div key="loader">Loading...</div>
        ) : (
          <div key="todo-list">
            <input onChange={e => setText(e.target.value)} value={text} />
            <select
              onChange={e => {
                setArea(e.target.value)
              }}>
              {render(areas, AreaOption)}
            </select>
            <button
              onClick={() => {
                transact([
                  [
                    'todo/new',
                    {
                      area,
                      text,
                      id: uuid(),
                    },
                  ],
                ])
                setText('')
              }}>
              Add
            </button>
            <ul>{render(areas, Area)}</ul>
          </div>
        )}
      </div>
    )
  },
)

TodoList.displayName = 'TodoList'

let state = {
  loading: true,
  initialized: false,
  todos: {},
  areas: {},
}

const handleByTag = multimethod(
  tag => tag,
  'remote handler',
  () => Promise.resolve([]),
  () => Promise.resolve([]),
)

handleByTag['app/init'] = (tag, params, callback) => {
  return fetch('/todos')
    .then(response => response.json())
    .then(result => [result])
}

handleByTag['todo/new'] = (tag, params, callback) => {
  const { text, area } = params
  return fetch('/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ text, area }),
  })
    .then(response => response.json())
    .then(result => [result])
}

handleByTag['todo/delete'] = (tag, params, callback) => {
  const { todoId } = params
  return fetch(`/todos/${todoId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(result => [result])
}

const remoteHandler = (tag, params) => {
  return handleByTag(tag, params)
}

mount({
  state,
  remoteHandler,
  component: TodoList,
  element: document.getElementById('root'),
})

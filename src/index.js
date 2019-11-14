import React, { useEffect, useState } from 'react'
import './parsers'
import { init, component } from 'qljs'
import uuid from 'uuid'
import './App.css'

const Todo = component(['todoId', 'todoText'], props => {
  const { todoText, transact } = props
  return (
    <li>
      {todoText}
      {
        <button
          onClick={() => {
            transact([['todo_delete']])
          }}>
          x
        </button>
      }
    </li>
  )
})

Todo.displayName = 'Todo'

const Area = component(['areaId', 'areaTitle', ['areaTodos', Todo]], props => {
  const { areaTitle, areaTodos, render } = props
  return (
    <ul>
      <label key="label">{areaTitle}</label>
      <div>{render(areaTodos, Todo)}</div>
    </ul>
  )
})

Area.displayName = 'Area'

const AreaOption = component(['areaId', 'areaTitle'], props => {
  const { areaId, areaTitle } = props
  return <option value={areaId}>{areaTitle}</option>
})

AreaOption.displayName = 'AreaOption'

const TodoList = component(
  [['appAreas', Area, AreaOption], 'appLoading'],
  props => {
    const { appAreas, appLoading, transact, render } = props

    useEffect(() => {
      transact([['app_init']])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [text, setText] = useState('')
    const [area, setArea] = useState('0')

    return (
      <div>
        {appLoading ? (
          <div key="loader">Loading...</div>
        ) : (
          <div key="todo-list">
            <input onChange={e => setText(e.target.value)} value={text} />
            <select
              onChange={e => {
                setArea(e.target.value.toString())
              }}>
              {render(appAreas, AreaOption)}
            </select>
            <button
              onClick={() => {
                transact([
                  [
                    'todo_new',
                    {
                      area: area,
                      text,
                      id: uuid(),
                    },
                  ],
                ])
                setText('')
              }}>
              Add
            </button>
            <ul>{render(appAreas, Area)}</ul>
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
  todos: [],
  areas: [],
}

const sendMutate = (tag, params) =>
  fetch('/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([tag, params]),
  })
    .then(response => response.json())
    .then(result => [result])

const remoteHandler = (tag, params) => {
  const hasTag = new Set(['app_init', 'todo_new', 'todo_delete']).has(tag)

  if (typeof params === 'undefined') {
    return hasTag
  }

  return hasTag ? sendMutate(tag, params) : Promise.resolve([])
}

const mount = init({ state, remoteHandler })

mount({
  Component: TodoList,
  element: document.getElementById('root'),
})

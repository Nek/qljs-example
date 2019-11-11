import React, { useEffect, useState } from 'react'
import './parsers'
import { init, component, getQuery } from 'qljs'
import uuid from 'uuid'
import './App.css'

const Todo = component([['todoId', {}], ['text', {}]], props => {
  const { text, transact } = props
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

const Area = component(
  [['areaId', {}], ['areaTitle', {}], ['todos', {}, getQuery(Todo)]],
  props => {
    const { areaTitle, todos, render } = props
    return (
      <ul>
        <label key="label">{areaTitle}</label>
        <div>{render(todos, Todo)}</div>
      </ul>
    )
  },
)

Area.displayName = 'Area'

const AreaOption = component([['areaId', {}], ['areaTitle', {}]], props => {
  const { areaId, areaTitle } = props
  return <option value={areaId}>{areaTitle}</option>
})

AreaOption.displayName = 'AreaOption'

const TodoList = component(
  [['areas', {}, getQuery(Area), getQuery(AreaOption)], ['loading', {}]],
  props => {
    const { areas, loading, transact, render } = props

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

const remoteHandler = (tag, params) =>
  new Set(['app/init', 'todo/new', 'todo/delete']).has(tag)
    ? sendMutate(tag, params)
    : Promise.resolve([])

const mount = init({ state, remoteHandler })

mount({
  Component: TodoList,
  element: document.getElementById('root'),
})

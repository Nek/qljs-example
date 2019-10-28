import React, { useEffect, useState } from 'react'
import './parsers'
import { mount, query, transact, multimethod, map } from 'qljs'
import uuid from 'uuid'
import './App.css'

const Todo = query([['todoId'], ['text']])(ctx => {
  const { text } = ctx
  return (
    <li>
      {text}
      {
        <button
          onClick={() => {
            transact(ctx, [['todo/delete']])
          }}>
          x
        </button>
      }
    </li>
  )
})

Todo.displayName = 'Todo'

const Area = query([['areaId'], ['areaTitle'], ['todos', Todo]])(ctx => {
  const { areaTitle, todos } = ctx
  return (
    <ul>
      <label key="label">{areaTitle}</label>
      <div>{map(todos, Todo)}</div>
    </ul>
  )
})

Area.displayName = 'Area'

const AreaOption = query([['areaId'], ['areaTitle']])(ctx => {
  const { areaId, areaTitle } = ctx
  return <option value={areaId}>{areaTitle}</option>
})

AreaOption.displayName = 'AreaOption'

const TodoList = query([
  ['areas', {}, Area, AreaOption],
  ['loading'],
  ['initialized'],
])(ctx => {
  const { areas, loading, initialized } = ctx

  useEffect(() => {
    !initialized && transact(ctx, [['app/init']])
  }, [ctx, initialized])

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
            {map(areas, AreaOption)}
          </select>
          <button
            onClick={() => {
              transact(ctx, [
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
          <ul>{map(areas, Area)}</ul>
        </div>
      )}
    </div>
  )
})

TodoList.displayName = 'TodoList'

let state = {
  loading: true,
  initialized: false,
  todos: {},
  areas: {},
}

function compressTerm(term) {
  const compressInner = (term, res) => {
    if (term === undefined) {
      return res
    } else {
      res.tags.push(term[0])
      res.params.push(term[1])
      return compressInner(term[2], res)
    }
  }
  const { tags, params } = compressInner(term, { tags: [], params: [] })
  return [tags.reverse()[0], params.reduce((res, p) => ({ ...res, ...p }), {})]
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
}

const remoteHandler = query => {
  const [term] = query
  const [tag, params] = compressTerm(term)
  return handleByTag(tag, params)
}

mount({
  state,
  remoteHandler,
  component: TodoList,
  element: document.getElementById('root'),
})

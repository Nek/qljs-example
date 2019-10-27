import React, { useEffect, useState } from 'react'
import './parsers'
import { mount, query, transact, multimethod } from 'qljs'
import uuid from 'uuid'
import './App.css'

const Todo = query([['todoId'], ['text']])(props => {
  const { text } = props
  return (
    <li>
      {text}
      {
        <button
          onClick={() => {
            transact(props, [['todo/delete']])
          }}>
          x
        </button>
      }
    </li>
  )
})

Todo.displayName = 'Todo'

const Area = query([['areaId'], ['areaTitle'], ['todos', Todo]])(props => {
  return (
    <ul>
      <label key="label">{props.areaTitle}</label>
      <div>
        {props.todos.map(atts => (
          <Todo {...atts} />
        ))}
      </div>
    </ul>
  )
})

Area.displayName = 'Area'

const AreaOption = query([['areaId'], ['areaTitle']])(props => {
  return <option value={props.areaId}>{props.areaTitle}</option>
})

AreaOption.displayName = 'AreaOption'

const TodoList = query([
  ['areas', {}, Area, AreaOption],
  ['loading'],
  ['initialized'],
])(props => {
  useEffect(() => {
    !props.initialized && transact(props, [['app/init']])
  }, [props])

  const [text, setText] = useState('')
  const [area, setArea] = useState(0)

  return (
    <div>
      {props.loading ? (
        <div key="loader">Loading...</div>
      ) : (
        <div key="todo-list">
          <input onChange={e => setText(e.target.value)} value={text} />
          <select
            onChange={e => {
              setArea(e.target.value)
            }}>
            {props.areas.map(atts => (
              <AreaOption {...atts} />
            ))}
          </select>
          <button
            onClick={() => {
              transact(props, [
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
          <ul>
            {props.areas.map(atts => (
              <Area {...atts} />
            ))}
          </ul>
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

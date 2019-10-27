import React from 'react'
import './parsers'
import { mount, query, transact, multimethod, instance, getId } from 'qljs'
import uuid from 'uuid'

const Todo = query([['todoId'], ['text']], 'todoId')(props => {
  const { text, todoId } = props
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

const Area = query([['areaTitle'], ['todos', Todo]], 'areaId')(props => {
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

const AreaOption = query([['areaId'], ['areaTitle']], 'areaId')(props => {
  return <option value={props.areaId}>{props.areaTitle}</option>
})

AreaOption.displayName = 'AreaOption'

const TodoList = query([['areas', {}, Area, AreaOption], ['loading']])(
  class extends React.Component {
    componentDidMount() {
      transact(this.props, [['app/init']])
    }

    constructor(props) {
      super(props)
      this.state = {
        text: '',
        area: 0,
      }
    }

    render() {
      return (
        <div>
          {this.props.loading ? (
            <div key="loader">Loading...</div>
          ) : (
            <div key="todo-list" {...this.props}>
              <input
                onChange={e => this.setState({ text: e.target.value })}
                value={this.state.text}
              />
              <select
                onChange={e => {
                  return this.setState({ area: e.target.value })
                }}>
                {this.props.areas.map(atts => (
                  <AreaOption {...atts} />
                ))}
              </select>
              <button
                onClick={() => {
                  transact(this.props, [
                    [
                      'todo/new',
                      {
                        area: this.state.area,
                        text: this.state.text,
                        id: uuid(),
                      },
                    ],
                  ])
                  this.setState({ text: '' })
                }}>
                Add
              </button>
              <ul>
                {this.props.areas.map(atts => (
                  <Area {...atts} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }
  },
)

TodoList.displayName = 'TodoList'

let state = {
  loading: true,
  todos: {},
  areas: {},
}

const firstChild = term => {
  if (term) {
    const [, , fc = []] = term
    return fc
  }
  return []
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
})({
  component: TodoList,
  element: document.getElementById('root'),
})

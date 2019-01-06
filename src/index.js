import React from 'react'
import './parsers'
import { mount, query, transact, multimethod, instance } from 'qljs'
import uuid from 'uuid'
import './App.css'
import posed, { PoseGroup } from 'react-pose'

const Li = posed.li({
  enter: { opacity: 1 },
  exit: {
    opacity: 0,
  },
})

const Todo = query([['text'], ['todoId']], 'todoId')(props => {
  const { text, todoId } = props
  return (
    <Li {...props}>
      {text}
      {
        <button
          onClick={() => {
            transact(props, [['todo/delete']])
          }}>
          x
        </button>
      }
    </Li>
  )
})

Todo.displayName = 'Todo'

const Area = query([['todos', Todo], ['title']], 'areaId')(props => {
  return (
    <ul>
      <label key="label">{props.title}</label>
      <PoseGroup>{props.todos.map(instance(Todo))}</PoseGroup>
    </ul>
  )
})

Area.displayName = 'Area'

const AreaOption = query([['areaId'], ['title']], 'areaId')(props => {
  return <option value={props.areaId}>{props.title}</option>
})

AreaOption.displayName = 'AreaOption'

const TodoListDiv = posed.div({
  enter: { opacity: 1, delay: 300 },
  exit: { opacity: 0 },
})

const Loading = posed.div({
  enter: { opacity: 1 },
  exit: { opacity: 0 },
})

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
        <PoseGroup>
          {this.props.loading ? (
            <Loading key="loader">Loading...</Loading>
          ) : (
            <TodoListDiv key="todo-list" {...this.props}>
              <input
                onChange={e => this.setState({ text: e.target.value })}
                value={this.state.text}
              />
              <select
                onChange={e => {
                  return this.setState({ area: e.target.value })
                }}>
                {this.props.areas.map(instance(AreaOption))}
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
              <ul>{this.props.areas.map(instance(Area))}</ul>
            </TodoListDiv>
          )}
        </PoseGroup>
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

import React from 'react'
import { createInstance, mount, query, transact } from 'qljs'
import uuid from 'uuid'
import parsers from './parsers'
import './App.css'

const Todo = query([['text'], ['todoId']], props => {
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

const Area = query([['todos', Todo], ['title']], props => {
  return (
    <ul>
      <label>{props.title}</label>
      {props.todos.map(todo => createInstance(Todo, todo, todo.todoId))}
    </ul>
  )
})

const AreaOption = query([['areaId'], ['title']], props => {
  return <option value={props.areaId}>{props.title}</option>
})

const TodoList = query(
  [['areas', {}, Area, AreaOption]],
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
          <input
            onChange={e => this.setState({ text: e.target.value })}
            value={this.state.text}
          />
          <select
            onChange={e => {
              return this.setState({ area: e.target.value })
            }}>
            {this.props.areas.map(area => {
              return createInstance(AreaOption, area, area.areaId)
            })}
          </select>
          <button
            onClick={() => {
              transact(this.props, [
                [
                  'todo/new',
                  { area: this.state.area, text: this.state.text, id: uuid() },
                ],
              ])
              this.setState({ text: '' })
            }}>
            Add
          </button>
          <ul>
            {this.props.areas.map(area => {
              return createInstance(Area, area, area.areaId)
            })}
          </ul>
        </div>
      )
    }
  },
)

let state = {
  todos: {},
  areas: {},
}

const remoteHandler = ([[term, params]], callback) => {
  switch (term) {
    case 'app/init':
      fetch('http://localhost:3000/todos')
        .then(response => response.json())
        .then(result => {
          callback([result])
        })
      break
    case 'todo/new':
      const { text, area } = params
      fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ text, area }),
      })
        .then(response => response.json())
        .then(result => {
          callback([result])
        })
      break
    default:
      break
  }
}

mount({
  state,
  parsers,
  remoteHandler,
})({
  component: TodoList,
  element: document.getElementById('root'),
})

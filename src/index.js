import React from 'react'
import { createInstance, mount, query, transact } from 'qljs'
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

const Area = query([['todos', {}, Todo], ['title']], props => {
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
              console.log(e.currentTarget)
              return this.setState({ area: e.target.value })
            }}>
            {this.props.areas.map(area => {
              return createInstance(AreaOption, area, area.areaId)
            })}
          </select>
          <button
            onClick={() => {
              console.log(this.state.area)
              transact(this.props, [
                ['todo/new', { area: this.state.area, text: this.state.text }],
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
  todos: {
    0: { text: 'Buy milk', area: 0 },
    1: { text: 'Do dishes', area: 1 },
  },
  areas: {
    0: {
      title: 'Chores',
    },
    1: {
      title: 'Today',
    },
  },
}

const remoteHandler = (query, callback) => {
  console.log(query)
}

mount({
  state,
  parsers,
  remoteHandler,
})({
  component: TodoList,
  element: document.getElementById('root'),
})

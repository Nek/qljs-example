import React from 'react'
import { createInstance, getQuery, mount, query, transact } from 'qljs'
import parsers from './parsers'

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

const Area = query([['todos', {}, ...getQuery(Todo)], ['title']], props => {
  return (
    <ul>
      <label>{props.title}</label>
      {props.todos.map(todo => createInstance(Todo, todo, todo.todoId))}
    </ul>
  )
})

const TodoList = query(
  [['areas', {}, ...getQuery(Area)]],
  class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        title: '',
      }
    }
    render() {
      return (
        <div>
          <label>Title</label>
          <input
            onChange={e => this.setState({ title: e.target.value })}
            value={this.state.title}
          />
          <button
            onClick={() => {
              transact(this.props, [
                ['todo/new', { area: 0, title: this.state.title }],
              ])
              this.setState({ title: '' })
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

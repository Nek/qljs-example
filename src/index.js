import React from 'react'
import { createInstance, getQuery, mount, query, transact } from 'qljs'
import parsers from './parsers'

const Todo = query([['title']], props => {
  const { title } = props
  return (
    <li>
      {title}
      {<button onClick={() => transact(props, [['todo/delete']])}>x</button>}
    </li>
  )
})

const Area = query([['todos', {}, ...getQuery(Todo)]], props => {
  return (
    <ul>
      {props.todos.map(todo => createInstance(Todo, todo))}
      <button onClick={() => transact(props, [['area/delete']])}>x</button>
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
          <ul>{this.props.areas.map(area => createInstance(Area, area))}</ul>
        </div>
      )
    }
  },
)

let state = {
  areas: {
    0: {
      todos: {
        0: { title: 'Buy milk' },
        1: { title: 'Do dishes' },
      },
    },
  },
}

const remoteHandler = (query, callback) => {}

mount({
  state,
  parsers,
  remoteHandler,
})({
  component: TodoList,
  element: document.getElementById('root'),
})

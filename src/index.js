import React, { useState } from 'react'
import { createInstance, getQuery, mount, query, transact } from 'qljs'
import parsers from './parsers'

const Todo = query([['title', {}], ['done', {}], ['id', {}]], props => {
  const { title } = props
  return (
    <li>
      {title}
      {<button onClick={() => transact(props, [['todo/delete']])}>x</button>}
    </li>
  )
})

const TodoList = query(
  [['todos', {}, ...getQuery(Todo)]],
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
          <input
            onChange={e => this.setState({ title: e.target.value })}
            value={this.state.title}
          />
          <button
            onClick={() => {
              transact(this.props, [['todo/new', { title: this.state.title }]])
              this.setState({ title: '' })
            }}>
            Add
          </button>
          <ul>{this.props.todos.map(todo => createInstance(Todo, todo))}</ul>
        </div>
      )
    }
  },
)

let state = {
  todos: {
    0: { title: 'Buy milk', done: false },
    1: { title: 'Do dishes', done: true },
  },
}

const remoteHandler = (query, callback) => {
  console.log('remote')
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

import { instance, query, transact } from 'qljs'
import React from 'react'
import posed, { PoseGroup } from 'react-pose'
import uuid from 'uuid'
import Area from './Area'
import AreaOption from './AreaOption'

const Loading = posed.div({
  enter: { opacity: 1 },
  exit: { opacity: 0 },
})

const AnimatedTodoList = posed.div({
  enter: {
    opacity: 1,
    delay: 300,
  },
  exit: {
    opacity: 0,
  },
})

const TodoList = query([['areas', {}, Area, AreaOption], ['appLoading']])(
  class extends React.Component {
    componentDidMount() {
      transact(this.props, [['appInit']])
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
          {this.props.appLoading ? (
            <Loading key="loader">Loading...</Loading>
          ) : (
            <AnimatedTodoList key="todo-list" {...this.props}>
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
                      'todoNew',
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
            </AnimatedTodoList>
          )}
        </PoseGroup>
      )
    }
  },
)

TodoList.displayName = 'TodoList'

export default TodoList

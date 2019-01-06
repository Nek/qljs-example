import { query, transact } from 'qljs'
import React from 'react'
import posed from 'react-pose'

const Li = posed.li({
  enter: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
})

const Todo = query([['todoText'], ['todoId']], 'todoId')(props => {
  const { todoText, todoId } = props
  return (
    <Li {...props}>
      {todoText}
      {
        <button
          onClick={() => {
            transact(props, [['todoDelete']])
          }}>
          x
        </button>
      }
    </Li>
  )
})

Todo.displayName = 'Todo'

export default Todo

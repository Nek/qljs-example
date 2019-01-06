import { instance, query } from 'qljs'
import React from 'react'
import { PoseGroup } from 'react-pose'
import Todo from './Todo'

const Area = query([['todos', Todo], ['areaTitle']], 'areaId')(props => {
  return (
    <ul>
      <label key="label">{props.areaTitle}</label>
      <PoseGroup>{props.todos.map(instance(Todo))}</PoseGroup>
    </ul>
  )
})

Area.displayName = 'Area'

export default Area

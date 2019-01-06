import { query, transact } from 'qljs'
import React from 'react'

const AreaOption = query([['areaId'], ['areaTitle']], 'areaId')(props => {
  return <option value={props.areaId}>{props.areaTitle}</option>
})

AreaOption.displayName = 'AreaOption'

export default AreaOption

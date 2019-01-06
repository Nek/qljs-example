import { parseChildren, parseChildrenRemote, parsers } from 'qljs'
let { read, mutate, remote, sync } = parsers

// Areas

read['areaTitle'] = (term, { areaId }, state) => {
  return state.areas[areaId] && state.areas[areaId].title
}

read['areaId'] = (term, { areaId }, state) => {
  return state.areas[areaId] && areaId
}

read['areas'] = (term, env, state) => {
  const [, { areaId }] = term
  if (areaId) {
    return parseChildren(term, { ...env, areaId })
  } else {
    const res = Object.keys(state.areas).map(areaId => {
      const res = parseChildren(term, { ...env, areaId })
      return res
    })
    return res
  }
}

remote['areaTitle'] = (queryTerm, state) => {
  return queryTerm
}

remote['areas'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

mutate['areaDelete'] = (term, { areaId }, state) => {
  delete state.areas[areaId]
  state.todos = Object.entries(state.todos)
    .filter(([todoId, { area }]) => area === areaId)
    .reduce((res, [todoId, todo]) => ({ ...res, [todoId]: todo }), {})
  return state.areas
}

sync['areas'] = (queryTerm, result, env, state) => {}

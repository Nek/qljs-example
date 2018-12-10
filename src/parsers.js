import qljs, { parseChildren, parseChildrenRemote, multimethod } from 'qljs'
import uuid from 'uuid'

const first = a => a[0]

export const read = multimethod(first)

read['title'] = (term, { areaId, todoId: id }, state) => {
  const title =
    state.areas[areaId] &&
    state.areas[areaId].todos[id] &&
    state.areas[areaId].todos[id].title
  return title
}

read['todos'] = (term, env, state) => {
  const { areaId } = env
  const [, { todoId }] = term
  if (todoId) {
    return parseChildren(term, { ...env, todoId })
  } else {
    const res = state.areas[areaId]
      ? Object.keys(state.areas[areaId].todos).map(todoId =>
          parseChildren(term, { ...env, todoId }),
        )
      : []
    return res
  }
}

read['areas'] = (term, env, state) => {
  const [, { areaId }] = term
  if (areaId) {
    return parseChildren(term, { ...env, areaId })
  } else {
    const res = Object.keys(state.areas).map(areaId =>
      parseChildren(term, { ...env, areaId }),
    )
    return res
  }
}

export const mutate = multimethod(first)

mutate['todo/delete'] = (term, { areaId, todoId: id }, state) => {
  const newTodos = { ...state.areas[areaId].todos }
  delete newTodos[id]
  state.areas[areaId].todos = newTodos
}

mutate['area/delete'] = (term, { areaId }, state) => {
  const newAreas = { ...state.areas }
  delete newAreas[areaId]
  state.areas = newAreas
}

mutate['todo/new'] = ([key, { area: areaId, title }], env, state) => {
  state.areas[areaId] = {
    todos: { ...state.areas[areaId].todos, [uuid()]: { title } },
  }
}

export const remote = multimethod(first)

remote['todo/new'] = (queryTerm, state) => {
  return queryTerm
}

remote['todo/delete'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

remote['title'] = (queryTerm, state) => {
  return queryTerm
}

remote['todos'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

remote['areas'] = (queryTerm, state) => {
  return queryTerm
}

export const sync = multimethod(first)

sync['todos'] = (queryTerm, result, env, state) => {}

export default { read, mutate, remote, sync }

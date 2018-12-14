import { parseChildren, parseChildrenRemote, multimethod } from 'qljs'

const first = a => a[0]

export const read = multimethod(first)

read['text'] = (term, { todoId }, state) => {
  const text = state.todos[todoId] && state.todos[todoId].text
  return text
}

read['todoId'] = (term, { todoId: id }, state) => {
  const text = state.todos[id] && id
  return text
}

read['todos'] = (term, env, state) => {
  const { areaId } = env
  const [, { todoId }] = term
  if (todoId) {
    return parseChildren(term, { ...env, todoId })
  } else {
    const res = Object.entries(state.todos)
      .filter(([key, todo]) => {
        // areaId is string
        return todo.area == areaId
      })
      .map(([key, todo]) => {
        return parseChildren(term, { ...env, todoId: key })
      })
    return res
  }
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

read['title'] = (term, { areaId }, state) => {
  return state.areas[areaId] && state.areas[areaId].title
}

read['areaId'] = (term, { areaId }, state) => {
  return state.areas[areaId] && areaId
}

export const mutate = multimethod(first)

mutate['app/init'] = (term, env, state) => {
  return state
}

mutate['todo/delete'] = (term, { areaId, todoId }, state) => {
  const newTodos = { ...state.todos }
  delete newTodos[todoId]
  state.todos = newTodos
  return state
}

mutate['area/delete'] = (term, { areaId }, state) => {
  delete state.areas[areaId]
  state.todos = Object.entries(state.todos)
    .filter(([todoId, { area }]) => area === areaId)
    .reduce((res, [todoId, todo]) => ({ ...res, [todoId]: todo }), {})
  return state.areas
}

mutate['todo/new'] = ([key, { area, text, todoId }], env, state) => {
  state.todos[todoId] = { text, area }
  return state.todos
}

export const remote = multimethod(first)

remote['todo/new'] = (queryTerm, state) => {
  return queryTerm
}

remote['todo/delete'] = (queryTerm, state) => {
  return queryTerm
}

remote['title'] = (queryTerm, state) => {
  return queryTerm
}

remote['todos'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

remote['areas'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

remote['app/init'] = (queryTerm, state) => {
  return queryTerm
}

export const sync = multimethod(first)

sync['areas'] = (queryTerm, result, env, state) => {}

sync['todo/delete'] = (queryTerm, result, env, state) => {}

sync['app/init'] = (term, result, env, state) => {
  state.todos = result.todos
  state.areas = result.areas
}

sync['todo/new'] = ([tag, { todoId }], { id }, env, state) => {
  const todo = state.todos[todoId]
  delete state.todos[todoId]
  state.todos[id] = todo
}

export default { read, mutate, remote, sync }

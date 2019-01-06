import { parseChildren, parseChildrenRemote, parsers } from 'qljs'

let { read, mutate, remote, sync } = parsers

// Todos

read['todoText'] = (term, { todoId }, state) => {
  const text = state.todos[todoId] && state.todos[todoId].text
  return text
}

read['todoId'] = (term, { todoId: id }, state) => {
  return state.todos[id] && id
}

read['todos'] = (term, env, state) => {
  const { areaId } = env
  const [, { todoId }] = term
  if (todoId) {
    return parseChildren(term, { ...env, todoId })
  } else {
    const res = Object.entries(state.todos)
      .filter(([key, todo]) => {
        // areaId is a string
        return todo.area == areaId
      })
      .map(([key, todo]) => {
        return parseChildren(term, { ...env, todoId: key })
      })
    return res
  }
}

mutate['todoNew'] = ([key, { area, text, todoId }], env, state) => {
  state.todos[todoId] = { text, area }
  return state.todos
}

mutate['todoDelete'] = (term, { areaId, todoId }, state) => {
  const newTodos = { ...state.todos }
  delete newTodos[todoId]
  state.todos = newTodos
  return state
}

remote['todoNew'] = (queryTerm, state) => {
  return queryTerm
}

remote['todoDelete'] = (queryTerm, state) => {
  return queryTerm
}

remote['todos'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

sync['todoDelete'] = (queryTerm, result, env, state) => {}

sync['todoNew'] = ([tag, { todoId }], { id }, env, state) => {
  const todo = state.todos[todoId]
  delete state.todos[todoId]
  state.todos[id] = todo
}

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

// App

read['appLoading'] = (term, env, state) => {
  return state.loading
}

mutate['appInit'] = (term, env, state) => {
  state.loading = true
  return state
}

remote['appInit'] = (queryTerm, state) => {
  return queryTerm
}

sync['appInit'] = (term, result, env, state) => {
  delete state.loading
  state.todos = result.todos
  state.areas = result.areas
}

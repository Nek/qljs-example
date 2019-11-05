import {
  parseChildren,
  parseChildrenRemote,
  read,
  mutate,
  remote,
  sync,
} from 'qljs'

// query name
// environment
// state
read('text', (term, { todoId }, state) => {
  const text = state.todos[todoId] && state.todos[todoId].text
  return text
})
read('todoId', (term, { todoId: id }, state) => {
  return state.todos[id] && id
})

read('todos', (term, env, state) => {
  const { areaId } = env
  const [, { todoId }] = term
  if (todoId) {
    return parseChildren(term, { ...env, todoId })
  } else {
    const res = Object.entries(state.todos)
      .filter(([, todo]) => {
        // areaId is string
        return todo.area == areaId
      })
      .map(([key]) => {
        return parseChildren(term, { ...env, todoId: key })
      })
    return res
  }
})

read('areas', (term, env, state) => {
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
})

read('areaTitle', (term, { areaId }, state) => {
  return state.areas[areaId] && state.areas[areaId].title
})

read('areaId', (term, { areaId }, state) => {
  return state.areas[areaId] && areaId
})

read('loading', (term, env, state) => {
  return state.loading
})

mutate('app/init', (term, env, state) => {
  state.loading = true
  return state
})

mutate('todo/delete', (term, { areaId, todoId }, state) => {
  const newTodos = { ...state.todos }
  delete newTodos[todoId]
  state.todos = newTodos
  return state
})

mutate('area/delete', (term, { areaId }, state) => {
  delete state.areas[areaId]
  state.todos = Object.entries(state.todos)
    .filter(([todoId, { area }]) => area === areaId)
    .reduce((res, [todoId, todo]) => ({ ...res, [todoId]: todo }), {})
  return state.areas
})

mutate('todo/new', ([key, { area, text, todoId }], env, state) => {
  state.todos[todoId] = { text, area }
  return state.todos
})

remote('todo/new', (term, state) => {
  return term
})

remote('todo/delete', (term, state) => {
  return term
})

remote('todos', (term, state) => {
  return parseChildrenRemote(term)
})

remote('areas', (term, state) => {
  return parseChildrenRemote(term)
})

remote('app/init', (term, state) => {
  return term
})

sync('areas', (queryTerm, result, env, state) => {})

sync('todo/delete', (term, result, env, state) => {
  window.alert(JSON.stringify(term))
})

sync('app/init', (term, result, env, state) => {
  delete state.loading
  state.todos = result.todos
  state.areas = result.areas
})

sync('todo/new', ([tag, { todoId }], { id }, env, state) => {
  const todo = state.todos[todoId]
  delete state.todos[todoId]
  state.todos[id] = todo
})

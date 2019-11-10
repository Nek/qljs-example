import { parseChildren, parseChildrenRemote, parsers } from 'qljs'
const { read, mutate, remote, sync } = parsers
// query name
// environment
// state
read('text', (term, { todoId }, state) => {
  const todo = state.todos.find(({ id }) => id === todoId)
  const text = todo && todo.text
  return text
})
read('todoId', (term, { todoId }, state) => {
  const todo = state.todos.find(({ id }) => id === todoId)
  return todo && todoId
})

read('todos', (term, env, state) => {
  const { areaId } = env
  const [, { todoId }] = term

  if (todoId) {
    return parseChildren(term, { ...env, todoId })
  } else {
    const res = state.todos
      .filter(({ area: id }) => areaId == id)
      .map(({ id }) => parseChildren(term, { ...env, todoId: id }))
    return res
  }
})

read('areas', (term, env, state) => {
  const [, { areaId }] = term
  if (areaId) {
    return parseChildren(term, { ...env, areaId })
  } else {
    const res = state.areas.map(({ id }) => {
      const res = parseChildren(term, { ...env, areaId: id })
      return res
    })
    return res
  }
})

read('areaTitle', (term, { areaId }, state) => {
  const area = state.areas.find(({ id }) => id === areaId)
  return area && area.title
})

read('areaId', (term, { areaId }, state) => {
  const area = state.areas.find(({ id }) => id === areaId)

  return area && areaId
})

read('loading', (term, env, state) => {
  return state.loading
})

mutate('app/init', (term, env, state) => {
  state.loading = true
  return state
})

mutate('todo/delete', (term, { areaId, todoId }, state) => {
  const newTodos = [...state.todos.filter(({ id }) => id !== todoId)]
  state.todos = newTodos
  return { todoId }
})

mutate('area/delete', (term, { areaId }, state) => {
  delete state.areas[areaId]
  state.todos = Object.entries(state.todos)
    .filter(([todoId, { area }]) => area === areaId)
    .reduce((res, [todoId, todo]) => ({ ...res, [todoId]: todo }), {})
  return state
})

mutate('todo/new', ([key, { area, text, id }], env, state) => {
  const todo = state.todos.find(({ id: todoId }) => id === todoId)
  state.todos.push((todo && { ...todo, area, text }) || { id, text, area })
  return { id }
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

sync('areas', (term, result, env, state) => {})

sync('todo/delete', (term, result, env, state) => {
  window.alert(JSON.stringify(term))
})

sync('app/init', (term, result, env, state) => {
  delete state.loading
  state.todos = result.todos
  state.areas = result.areas
})

sync('todo/new', ([tag, { id: todoId }], { id }, env, state) => {
  const todo = state.todos.find(({ id }) => id === todoId)
  todo.id = id
})

import { parseChildren, parseChildrenRemote, parsers } from 'qljs'
const { read, mutate, remote, sync } = parsers
// query name
// environment
// state
read('todoText', (term, { todoId }, state) => {
  const todo = state.todos.find(({ id }) => id === todoId)
  const text = todo && todo.text
  return text
})
read('todoId', (term, { todoId }, state) => {
  const todo = state.todos.find(({ id }) => id === todoId)
  return todo && todoId
})

read('areaTodos', (term, env, state) => {
  const { areaId } = env
  const [, { todoId }] = term

  if (todoId) {
    return parseChildren(term, { ...env, todoId })
  } else {
    const res = state.todos
      .filter(({ area: id }) => {
        console.log(typeof areaId, typeof id)
        return areaId === id
      })
      .map(({ id }) => parseChildren(term, { ...env, todoId: id }))
    return res
  }
})

read('appAreas', (term, env, state) => {
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

read('appLoading', (term, env, state) => {
  return state.loading
})

mutate('app_init', (term, env, state) => {
  state.loading = true
  return state
})

mutate('todo_delete', (term, { areaId, todoId }, state) => {
  const newTodos = [...state.todos.filter(({ id }) => id !== todoId)]
  state.todos = newTodos
  return { todoId }
})

mutate('todo_new', ([key, { area, text, id }], env, state) => {
  const todo = state.todos.find(({ id: todoId }) => id === todoId)
  state.todos.push((todo && { ...todo, area, text }) || { id, text, area })
  return { id }
})

remote('todo_new', (term, state) => {
  return term
})

remote('todo_delete', (term, state) => {
  return term
})

remote('areaTodos', (term, state) => {
  return parseChildrenRemote(term)
})

remote('appAreas', (term, state) => {
  return parseChildrenRemote(term)
})

remote('app_init', (term, state) => {
  return term
})

sync('appAreas', (term, result, env, state) => {})

sync('todo_delete', (term, result, env, state) => {
  window.alert(JSON.stringify(term))
})

sync('app_init', (term, result, env, state) => {
  delete state.loading
  state.todos = result.todos
  state.areas = result.areas
})

sync('todo_new', ([tag, { id: todoId }], { id }, env, state) => {
  const todo = state.todos.find(({ id }) => id === todoId)
  todo.id = id
})

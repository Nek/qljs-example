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

// The name is slightly misleading. This is a parser for both todos and todo by id queries.
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

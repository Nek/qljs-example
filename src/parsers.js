import { parseChildren, parseChildrenRemote } from './ql'
import uuid from 'uuid'

import createMultimethod from './multimethod'

const first = ([f]) => f

export const read = createMultimethod(first)
export const mutate = createMultimethod(first)
export const remote = createMultimethod(first)

read['title'] = (term, { id }, state) => {
  return state.todos[id] && state.todos[id].title
}

read['done'] = (term, { id }, state) => {
  return state.todos[id] && state.todos[id].done
}

read['id'] = (term, { id }, state) => {
  return state.todos[id] && id
}

read['todos'] = (term, env, state) => {
  const [, { id }] = term
  if (id) {
    return parseChildren(term, { ...env, id })
  } else {
    const res = Object.keys(state.todos).map(id =>
      parseChildren(term, { ...env, id }),
    )
    return res
  }
}

mutate['todo/delete'] = (term, { id }, state) => {
  const newTodos = { ...state.todos }
  delete newTodos[id]
  state.todos = newTodos
}

mutate['todo/new'] = ([key, { title }], {}, state) => {
  state.todos = { ...state.todos, [uuid()]: { title, done: false } }
}

remote['todo/new'] = (queryTerm, state) => {
  return queryTerm
}

remote['todo/delete'] = (queryTerm, state) => {
  return queryTerm
}

remote['title'] = (queryTerm, state) => {
  return queryTerm
}

remote['done'] = (queryTerm, state) => {
  return queryTerm
}

remote['id'] = (queryTerm, state) => {
  return queryTerm
}

remote['todos'] = (queryTerm, state) => {
  return parseChildrenRemote(queryTerm)
}

import { parsers } from 'qljs'

let { read, mutate, remote, sync } = parsers

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

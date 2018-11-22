import React from 'react'
import ReactDOM from 'react-dom'
import createMultimethod from './multimethod'

const zip = (a1, a2) => a1.map((x, i) => [x, a2[i]])
const first = ([f]) => f

const read = createMultimethod(first)
const mutate = createMultimethod(first)
const remote = createMultimethod(first)

export const parsers = {
  read,
  mutate,
  remote,
}

const isMutationQuery = ([tag]) => {
  return mutate[tag] ? true : false
}

const registry = new Map()

export function query(query, key) {
  registry.set(key, query)
  return key
}

export function getQuery(key) {
  return registry.get(key)
}

export function clearRegistry() {
  registry.clear()
}

const parseQueryTerm = (queryTerm, env) => {
  const mutateFn = mutate[queryTerm[0]]
  if (mutateFn) {
    mutateFn(queryTerm, env)
  } else {
    return read(queryTerm, env)
  }
}

const parseQuery = (query, env) => {
  if (env === undefined) {
    return parseQuery(query, {})
  }
  return query.map(queryTerm => {
    return parseQueryTerm(queryTerm, env)
  })
}

export function parseQueryIntoMap(query, env) {
  const queryName = query.map(first)
  const queryResult = parseQuery(query, env)
  const atts = zip(queryName, queryResult).reduce(
    (res, [k, v]) => ({ ...res, [k]: v }),
    {},
  )

  return {
    env,
    query,
    ...atts,
  }
}

function parseQueryRemote(query) {
  return query.reduce((acc, item) => {
    const { remote } = parsers
    if (remote[first(item)]) {
      const v = remote(item, state)
      console.log(item[0], v)
      if (v) {
        return [...acc, v]
      } else {
        return acc
      }
    } else {
      return acc
    }
  }, [])
}

export function parseChildrenRemote([dispatchKey, params, ...chi]) {
  const chiRemote = parseQueryRemote(chi)
  return Array.isArray(chiRemote) && [...[dispatchKey, params], ...chiRemote]
}

function parseQueryTermSync(queryTerm, result, env) {
  const { sync } = parsers
  const syncFun = sync[queryTerm[0]]
  if (syncFun) {
    syncFun(queryTerm, result, env, state)
  } else {
    //TODO: Missing sync parser warning
  }
}

let handler = console.log

function performRemoteQuery(query) {
  if (Array.isArray(query) && remoteHandler) {
    remoteHandler(query, results => {
      zip(query, results).map(([k, v]) => parseQueryTermSync(k, v, {}))
      refresh(false)
    })
  }
}

function mapDelta(map1, map2) {
  return Object.entries(map2)
    .filter(([k, v]) => v !== map1[k])
    .reduce((res, [k, v]) => ({ ...res, [k]: v }), {})
}

export function loopRootQuery(queryTerm, env) {
  if (env) {
    const parentEnv = env.parentEnv
    const newEnv = { ...(parentEnv ? mapDelta(parentEnv, env) : env) }
    delete newEnv.parentEnv
    delete newEnv.queryKey
    return loopRootQuery([
      env.queryKey,
      newEnv,
      // Maybe needed to expand
      queryTerm,
    ])
  } else {
    return queryTerm
  }
}

export function makeRootQuery(env, query) {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, env.parentEnv)
  })
}

export function parseChildren(term, env) {
  const [, , ...query] = term
  const newEnv = { ...env, parentEnv: { ...env, queryKey: term[0] } }
  return parseQueryIntoMap(query, newEnv)
}

export function transact(props, query) {
  const { env, query: componentQuery } = props
  const rootQuery = makeRootQuery(env, [...query, ...componentQuery])
  parseQuery(rootQuery, env)
  const q = parseQueryRemote(rootQuery)
  performRemoteQuery(q)
  refresh(false)
}

export function createInstance(Component, atts) {
  const { env, query } = atts
  return React.createElement(Component, {
    ...atts,
    env,
    query,
    key: env.id ? env.id : '_',
  })
}

let refresh = isRemoteQuery => {
  const query = getQuery(Component)
  const atts = parseQueryIntoMap(query, {})
  if (isRemoteQuery) {
    performRemoteQuery(parseQueryRemote(query))
  }
  ReactDOM.render(createInstance(Component, atts), element)
}

let Component
let element
let state
let remoteHandler

export function mount({
  component,
  element: _el,
  state: _st,
  remoteHandler: _rh,
}) {
  Component = component
  element = _el
  state = _st
  remoteHandler = _rh
  refresh(true)
}

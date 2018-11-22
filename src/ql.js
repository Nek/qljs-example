import { rerender } from './index'

const registry = new Map()

export function registerQuery(query, key) {
  registry.set(key, query)
  return key
}

export function getQuery(key) {
  return registry.get(key)
}

export function clearRegistry() {
  registry.clear()
}

const parseQueryTerm = (state, { read, mutate }, queryTerm, env) => {
  const mutateFn = mutate[queryTerm[0]]
  if (mutateFn) {
    mutateFn(queryTerm, env, state)
    rerender()
  } else {
    return read(queryTerm, env, state)
  }
}

const parseQuery = (state, { read, mutate }, query, env) => {
  if (env === undefined) {
    return parseQuery(state, { read, mutate }, query, {})
  }
  return query.map(queryTerm => {
    return parseQueryTerm(state, { read, mutate }, queryTerm, env)
  })
}

const zip = (a1, a2) => a1.map((x, i) => [x, a2[i]])
const first = ([f]) => f

export function parseQueryIntoMap(state, { read, mutate }, query, env) {
  const queryName = query.map(first)
  const queryResult = parseQuery(state, { read, mutate }, query, env)
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

export function parseChildren(state, { read, mutate }, term, env) {
  const [, , ...query] = term
  const newEnv = { ...env, parentEnv: { ...env, queryKey: term[0] } }
  return parseQueryIntoMap(state, { read, mutate }, query, newEnv)
}

export function transact(state, parsers, props, query) {
  console.log('!')
  const { env, query: compQuery } = props
  const rootQuery = makeRootQuery(env, [...query, ...compQuery])
  parseQuery(state, parsers, rootQuery, env)
}

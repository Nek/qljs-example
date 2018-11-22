import { rerender } from './index'
import createMultimethod from './multimethod'

const read = createMultimethod()
const mutate = createMultimethod()

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

const parseQueryTerm = (queryTerm, env) => {
  const mutateFn = mutate[queryTerm[0]]
  if (mutateFn) {
    mutateFn(queryTerm, env)
    rerender()
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

const zip = (a1, a2) => a1.map((x, i) => [x, a2[i]])
const first = ([f]) => f

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
  const { env, query: compQuery } = props
  const rootQuery = makeRootQuery(env, query)
  parseQuery(rootQuery, env)
}

export const parsers = {
  read,
  mutate,
}

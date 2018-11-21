const registry = new Map()

export function registerQuery(key, query) {
  registry.set(key, query)
}

export function clearRegistry() {
  registry.clear()
}

const parseQueryTerm = (state, read, queryTerm, env) => {
  return read(queryTerm, env, state)
}

const parseQuery = (state, read, query, env) => {
  if (env === undefined) {
    return parseQuery(state, read, query, {})
  }
  return query.map((queryTerm) => parseQueryTerm(state, read, queryTerm, env))
}

const zip = (a1, a2) => a1.map((x, i) => [x, a2[i]]);
const first = ([f]) => f

export function parseQueryIntoMap(state, read, query, env) {
  const keys = query.map(first)
  const vals = parseQuery(state, read, query, env)
  const atts = zip(keys, vals).reduce(
    (res, [k,v]) => ({...res, [k]: v})
    ,{})

  return {
    env,
    query,
    atts
  }
}

export function parseChildren(state, read, term, env) {
  const [,,...query] = term
  const newEnv = {...env,
                     parentEnv:
                     {...env,
                      queryKey: term[0]}
                 }
  const res = parseQueryIntoMap(state, read, query, newEnv)
  return res
}

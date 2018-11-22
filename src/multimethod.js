const dispatch = ([first]) => first
const noMatch = term => {
  debugger
  throw new Error('No match for ' + term)
}

export default function createMultimethod() {
  const dict = {}
  if (typeof noMatch == 'function') {
    dict.noMatch = noMatch
  }

  return new Proxy(
    () => {
      throw new Error('No match')
    },
    {
      set(target, property, value) {
        dict[property] = value
        return true
      },
      get(target, property, receiver) {
        return dict[property]
      },
      apply(target, thisArg, args) {
        const value = dispatch.apply(null, args)
        const func =
          value && dict.hasOwnProperty(value)
            ? dict[value]
            : dict.hasOwnProperty('noMatch')
              ? dict['noMatch']
              : target
        return func.apply(thisArg, args)
      },
    },
  )
}

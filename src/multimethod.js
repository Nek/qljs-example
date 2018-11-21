export default function createMultimethod(dispatch, noMatch) {
  if (typeof dispatch !== 'function') {
    throw new TypeError('dispatch must be a function')
  }

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

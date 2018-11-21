import {getQuery, registerQuery, clearRegistry, parseQueryIntoMap, parseChildren} from './ql'


describe('ql', () => {
  it('returns itself for a primitive query', () => {
    expect(getQuery([['boxes']])).toEqual([['boxes']])
  })
  it('returns registered query for query key', () => {
    clearRegistry()
    const component = {}
    registerQuery(component, [['boxes']])
    expect(getQuery(component)).toEqual([['boxes']])
  })
  describe.only('parseQueryIntoMap', () => {
    const readName = (term, {personId}, state) => {
      return state.people[personId].name
    }

    const readAge = (term, {personId}, state) => {
      return state.people[personId].age
    }

    const readPeople = (term, env, state) => {
      const [, {personId}] = term
      if (personId) {
        return parseChildren(state, reader, term, {...env, personId})
      } else {
        const res = Object.keys(state.people)
              .map(personId => parseChildren(state, reader,term, {...env, personId}))
        return res
      }
    }
    
    const reader = (term, env, state) => {
      switch(term[0]) {
      case 'people':
        return readPeople(term, env, state)
      case 'name':
        return readName(term, env, state)
        case 'age':
        return readAge(term, env, state)
      default:
        throw new Error('No such term reader.')
      }
    }
    console.log(JSON.stringify(parseQueryIntoMap(
      {people: {
        0: {name: 'Nik', age: 37},
        1: {name: 'Alya', age: 32}
      }},
      reader,
      [['people', {}, ['name'], ['age']]],
      {}
    )))
  })
})



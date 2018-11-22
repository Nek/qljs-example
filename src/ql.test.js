import {QL, clearRegistry, parseQueryIntoMap, parseChildren} from './ql'
import createMultimethod from './multimethod'

const dispatch = ([first]) => first
const noMatch = (term) => {throw new Error('No match for ' + term)}

let read = createMultimethod(dispatch, noMatch)
read.name =  (term, {personId}, state) => {
      return state.people[personId].name
}
read.age =  (term, {personId}, state) => {
      return state.people[personId].age
}
read.people =  (term, env, state) => {
  const [, {personId}] = term
      if (personId) {
        return parseChildren(state, {read}, term, {...env, personId})
      } else {
        const res = Object.keys(state.people)
              .map(personId => parseChildren(state, {read},term, {...env, personId}))
        return res
      }
    }

describe('ql', () => {
  const state = {people: {
    0: {name: 'Nik', age: 37},
    1: {name: 'Alya', age: 32}
  }}
  describe('parseQueryIntoMap', () => {
    it('should parse a simple query', () => {
      const query = [['name'], ['age']]
      const env = {personId:0}
      expect(parseQueryIntoMap(
        state,
        {read},
        query,
        env
      )).toEqual({
                  name: 'Nik', age: 37,
                  env: {personId: 0},
                  query})
    })
    it('should parse nested queries', () => {
      const query = [['people', {}, ['name'], ['age']]]
      const env = {}
      expect(parseQueryIntoMap(
        state,
        {read},
        query,
        env
      )).toEqual({
        people: expect.anything(),
        env: expect.anything(),
        query: expect.anything(),
      })

      expect(parseQueryIntoMap(
        state,
        {read},
        query,
        env
      )).toEqual({
        env: expect.anything(),
        people: [{name: 'Nik', age: 37,

                    env: expect.anything(),
                    query: expect.anything()},
                 {name: 'Alya', age: 32,

                    env: expect.anything(),
                    query: expect.anything()}],

        query: expect.anything(),
      })

       expect(parseQueryIntoMap(
        state,
        {read},
        query,
        env
      )).toEqual({

          people: [
            {
              age: expect.anything(),
              name: expect.anything(),
              env: expect.anything(),
              query: [['name'],['age']]},
            {
              age: expect.anything(),
              name: expect.anything(),
              env: expect.anything(),
              query: [['name'],['age']]}
          ],
        env: {},
        query,
      })

      expect(parseQueryIntoMap(
        state,
        {read},
        query,
        env
      )).toEqual({
          people: [
            {
              name: 'Nik',
                age: 37,
             env:
             expect.objectContaining(
               {
                 parentEnv:
                {personId: "0",
                 queryKey: "people"},
                personId: "0"}),
             query: [["name"], ["age"]]},
            {
              name: 'Alya',
                age: 32,
             env: expect.objectContaining(
               {
                 parentEnv:
                {personId: "1",
                 queryKey: "people"},
                personId: "1"}),
             query: [['name'],['age']]}
          ],
        env: expect.anything(),
        query,
      })
    })
  })
})

import { fetchAllBreeds } from './api'
describe('API', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })
  it('fetches a list of all breeds', () => {
    const result = { some: 'data' }
    fetch.mockResponseOnce(JSON.stringify(result))
    return fetchAllBreeds().then(data => {
      expect(data).toEqual({ some: 'data' })
    })
  })
})

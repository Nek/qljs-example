import { fetchAllBreeds, fetchImageSrc } from './api'
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
  it('fetches image source by breedId', () => {
    const result = {
      status: 'success',
      message: 'some_image',
    }
    const fullBreedName = 'hound'
    fetch.mockResponseOnce(JSON.stringify(result))
    return fetchImageSrc({ fullBreedName, breedId: 'hound' }).then(data => {
      expect(data).toEqual({
        imageSrc: result.message,
        fullBreedName,
      })
      expect(fetch.mock.calls[0][0]).toBeDefined()
    })
  })
  it('fetches image source and processes an error', () => {
    const result = {
      status: '',
      message: 'some_image',
    }
    const fullBreedName = 'hound'
    fetch.mockResponseOnce(JSON.stringify(result))
    return fetchImageSrc({ fullBreedName, breedId: 'hound' }).then(data => {
      expect(data).toEqual({
        imageSrc: null,
        fullBreedName,
      })
      expect(fetch.mock.calls[0][0]).toBeDefined()
    })
  })
})

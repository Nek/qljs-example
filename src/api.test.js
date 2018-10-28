import { fetchAllBreeds, fetchImageSrc, fetchDescription } from './api'
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
    })
  })
  it('fetches a description', () => {
    const description = 'something'
    const result = [description]
    fetch.mockResponseOnce(JSON.stringify(result))
    const fullBreedName = 'hound'
    return fetchDescription({ fullBreedName }).then(data => {
      expect(data).toEqual({ fullBreedName, description })
    })
  })
})

import {
  updateStateWithImageSrc,
  updateStateWithDescription,
} from './stateUpdaters'

describe('state updaters', () => {
  it('update single breed state with image source', () => {
    const setState = jest.fn(updater => {
      const state = {
        breeds: [
          {
            fullName: 'hound',
            imageSrc: null,
          },
          {
            fullName: 'collie',
            imageSrc: null,
          },
        ],
      }
      updater(state)
    })
    updateStateWithImageSrc(setState)(
      Promise.resolve({
        fullBreedName: 'hound',
        imageSrc: 'hound_image_source',
      }),
    ).then(() => {
      expect(setState.mock.calls[0][0]()).toEqual({
        breeds: [
          {
            fullName: 'hound',
            imageSrc: 'hound_image_source',
          },
          {
            fullName: 'collie',
            imageSrc: null,
          },
        ],
      })
    })
  })
  it('update single breed state with description', () => {
    const setState = jest.fn(updater => {
      const state = {
        breeds: [
          {
            fullName: 'hound',
            description: null,
          },
          {
            fullName: 'collie',
            description: null,
          },
        ],
      }
      updater(state)
    })
    updateStateWithDescription(setState)(
      Promise.resolve({
        fullBreedName: 'hound',
        description: 'hound_image_description',
      }),
    ).then(() => {
      expect(setState.mock.calls[0][0]()).toEqual({
        breeds: [
          {
            fullName: 'hound',
            description: 'hound_image_description',
          },
          {
            fullName: 'collie',
            description: null,
          },
        ],
      })
    })
  })
})

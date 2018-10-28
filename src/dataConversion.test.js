import {
  breedDataToPairs,
  breedPairToBreedData,
  rawDataToAppData,
} from './dataConversion'

describe('dataConversion', () => {
  describe('converts raw breed data to pairs', () => {
    it('without subbreeds', () => {
      const breed = 'hound'
      expect(breedDataToPairs([breed, []])).toEqual([[breed]])
    })
    it('with subbreeds', () => {
      const breed = 'hound'
      const subbreeds = ['super', 'grey']
      expect(breedDataToPairs([breed, subbreeds])).toEqual([
        [breed, subbreeds[0]],
        [breed, subbreeds[1]],
      ])
    })
  })
  describe('converts breed pair to breed data', () => {
    it('without subbreed', () => {
      expect(breedPairToBreedData(['hound'])).toEqual({
        fullBreedName: 'hound',
        breedId: 'hound',
        imageSrc: null,
        description: null,
      })
    })
    it('with subbreed', () => {
      expect(breedPairToBreedData(['hound', 'grey'])).toEqual({
        fullBreedName: 'hound - grey',
        breedId: 'hound/grey',
        imageSrc: null,
        description: null,
      })
    })
  })
})

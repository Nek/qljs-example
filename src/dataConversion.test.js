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
})

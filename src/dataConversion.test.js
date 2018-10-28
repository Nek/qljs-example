import { rawDataToAppData } from './dataConversion'

describe('dataConversion', () => {
  it('converts raw API data to app data', () => {
    expect(
      rawDataToAppData({ message: { hound: [], basset: ['grey', 'red'] } }),
    ).toEqual([
      {
        fullBreedName: 'hound',
        breedId: 'hound',
        imageSrc: null,
        description: null,
      },
      {
        fullBreedName: 'basset - grey',
        breedId: 'basset/grey',
        imageSrc: null,
        description: null,
      },
      {
        fullBreedName: 'basset - red',
        breedId: 'basset/red',
        imageSrc: null,
        description: null,
      },
    ])
  })
})

import { flatten } from './utils'

export const breedDataToPairs = ([breedName, subbreeds]) =>
  subbreeds.length > 0
    ? subbreeds.map(subBreedName => [breedName, subBreedName])
    : [[breedName]]

export const breedPairToBreedData = dogBreedPair => {
  const [breedName, subBreedName] = dogBreedPair
  const subBreedText = subBreedName ? ` - ${subBreedName}` : ''
  const fullBreedName = breedName + subBreedText
  return {
    fullBreedName,
    breedId: dogBreedPair.join('/'),
    imageSrc: null,
    description: null,
  }
}

export const rawDataToAppData = ({ message }) => {
  const data = Object.entries(message)
    .map(breedDataToPairs)
    .reduce(flatten)
    .map(breedPairToBreedData)
  return data
}

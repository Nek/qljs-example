import { extractJson } from './utils'

const API_ROOT = `https://dog.ceo/api/`
const BREEDS_LIST_ALL = `${API_ROOT}breeds/list/all`
const breedIdImagesRandomUrl = breedId =>
  `${API_ROOT}breed/` + breedId + `/images/random`

export const fetchAllBreeds = () => fetch(BREEDS_LIST_ALL).then(extractJson)

export const fetchImageSrc = ({ fullBreedName, breedId }) => {
  return fetch(breedIdImagesRandomUrl(breedId))
    .then(extractJson)
    .then(({ status, message }) => {
      return {
        imageSrc: (status === 'success' && message) || null,
        fullBreedName,
      }
    })
}

export const fetchDescription = ({ fullBreedName }) => {
  return fetch(
    'https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1',
  )
    .then(extractJson)
    .then(([description]) => ({ fullBreedName, description }))
}

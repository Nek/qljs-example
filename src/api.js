const API_ROOT = `https://dog.ceo/api/`
export const BREEDS_LIST_ALL = `${API_ROOT}breeds/list/all`
export const breedIdImagesRandomUrl = breedId =>
  `${API_ROOT}breed/` + breedId + `/images/random`

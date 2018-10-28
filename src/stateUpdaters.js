const findBreedAndIndex = (breeds, fullBreedName) => {
  const breedIndex = breeds.findIndex(
    breed => breed.fullBreedName === fullBreedName,
  )
  const breed = breeds[breedIndex]
  return { breedIndex, breed }
}

const setImageSrc = ({ breeds, fullBreedName, imageSrc }) => {
  const { breedIndex, breed } = findBreedAndIndex(breeds, fullBreedName)

  const newBreeds = [...breeds]
  newBreeds[breedIndex] = { ...breed, imageSrc }

  return newBreeds
}

const setDescription = ({ breeds, fullBreedName, description }) => {
  const { breedIndex, breed } = findBreedAndIndex(breeds, fullBreedName)

  const newBreeds = [...breeds]
  newBreeds[breedIndex] = { ...breed, description }

  return newBreeds
}

export const updateStateWithImageSrc = setState => promise =>
  promise.then(({ fullBreedName, imageSrc }) => {
    setState(state => {
      const { breeds } = state
      const newBreeds = setImageSrc({ breeds, fullBreedName, imageSrc })
      return {
        breeds: newBreeds,
      }
    })
  })

export const updateStateWithDescription = setState => promise =>
  promise.then(data => {
    setState(state => {
      const { breeds } = state
      const newBreeds = setDescription({ ...data, breeds })
      return {
        breeds: newBreeds,
      }
    })
  })

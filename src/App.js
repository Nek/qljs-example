import { Component } from 'react'
import './App.css'
import DogCard from './components/DogCard'

import { fetchAllBreeds, fetchImageSrc, fetchDescription } from './api'

import { rawDataToAppData } from './dataConversion'

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

const updateStateWithImageSrc = setState => promise =>
  promise.then(data => {
    setState(state => {
      const { breeds } = state
      const newBreeds = setImageSrc({ ...data, breeds })
      return {
        breeds: newBreeds,
      }
    })
  })

const updateStateWithDescription = setState => promise =>
  promise.then(data => {
    setState(state => {
      const { breeds } = state
      const newBreeds = setDescription({ ...data, breeds })
      return {
        breeds: newBreeds,
      }
    })
  })

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      breeds: [],
    }
  }
  componentDidMount() {
    fetchAllBreeds()
      .then(rawDataToAppData)
      .then(breeds => {
        this.setState({ breeds })
        return breeds
      })
      .then(breeds => {
        breeds
          .map(fetchImageSrc)
          .map(updateStateWithImageSrc((...args) => this.setState(...args)))

        breeds
          .map(fetchDescription)
          .map(updateStateWithDescription((...args) => this.setState(...args)))
      })
  }
  render() {
    return this.state.breeds.length === 0
      ? 'Loading...'
      : this.state.breeds.map(DogCard)
  }
}

export default App

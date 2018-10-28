import { Component } from 'react'
import './App.css'
import DogCard from './components/DogCard'

const flatten = (acc, val) => [...acc, ...val]
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

const extractJson = body => body.json()

const API_ROOT = `https://dog.ceo/api/`
const BREEDS_LIST_ALL = `${API_ROOT}breeds/list/all`
const breedIdImagesRandomUrl = breedId =>
  `${API_ROOT}breed/` + breedId + `/images/random`

const breedDataToPairs = ([breedName, subbreeds]) =>
  subbreeds.length > 0
    ? subbreeds.map(subBreedName => [breedName, subBreedName])
    : [[breedName]]

const breedPairToBreedData = dogBreedPair => {
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

const rawDataToAppData = ({ message }) => {
  const data = Object.entries(message)
    .map(breedDataToPairs)
    .reduce(flatten)
    .map(breedPairToBreedData)
  return data
}

const fetchImageSrc = ({ fullBreedName, breedId }) => {
  return fetch(breedIdImagesRandomUrl(breedId))
    .then(extractJson)
    .then(({ status, message }) => {
      return {
        imageSrc: status === 'success' && message,
        fullBreedName,
      }
    })
}

const fetchDescription = ({ fullBreedName }) => {
  return fetch(
    'https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1',
  )
    .then(extractJson)
    .then(([description]) => ({ fullBreedName, description }))
}

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

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      breeds: [],
    }
  }
  componentDidMount() {
    fetch(BREEDS_LIST_ALL)
      .then(extractJson)
      .then(rawDataToAppData)
      .then(breeds => {
        this.setState({ breeds })
        return breeds
      })
      .then(breeds => {
        const updateStateWithImageSrc = (state, setState) => promise =>
          promise
            .then(data => {
              const { breeds } = this.state
              return { ...data, breeds }
            })
            .then(setImageSrc)
            .then(newBreeds => {
              this.setState({
                breeds: newBreeds,
              })
            })

        const updateStateWithDescription = (state, setState) => promise =>
          promise
            .then(data => {
              const { breeds } = state
              return { ...data, breeds }
            })
            .then(setDescription)
            .then(newBreeds => {
              setState({
                breeds: newBreeds,
              })
            })

        breeds
          .map(fetchImageSrc)
          .map(
            updateStateWithImageSrc(this.state, (...args) =>
              this.setState(...args),
            ),
          )
        breeds
          .map(fetchDescription)
          .map(
            updateStateWithDescription(this.state, (...args) =>
              this.setState(...args),
            ),
          )
      })
  }
  render() {
    return this.state.breeds.length === 0
      ? 'Loading...'
      : this.state.breeds.map(DogCard)
  }
}

export default App

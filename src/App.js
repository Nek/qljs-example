import { Component } from 'react'
import './App.css'
import DogCard from './components/DogCard'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      breeds: [],
    }
  }
  componentDidMount() {
    fetch('https://dog.ceo/api/breeds/list/all')
      .then(body => body.json())
      .then(({ message }) => {
        const data = Object.entries(message)
          .map(
            ([breedName, subbreeds]) =>
              subbreeds.length > 0
                ? subbreeds.map(subBreedName => [breedName, subBreedName])
                : [[breedName]],
          )
          .reduce((acc, val) => [...acc, ...val])
          .map(dogBreedPair => {
            const [breedName, subBreedName] = dogBreedPair
            const subBreedText = subBreedName ? ` - ${subBreedName}` : ''
            const fullBreedName = breedName + subBreedText
            return {
              breedName,
              subBreedName,
              fullBreedName,
              breedId:
                `https://dog.ceo/api/breed/` +
                dogBreedPair.join('/') +
                `/images/random`,
              imageSrc: null,
              description: null,
            }
          })
        return data
      })
      .then(breeds => {
        this.setState({ breeds })
        return breeds
      })
      .then(breeds => {
        const fetchImageSrc = ({ fullBreedName, breedId }) => {
          return fetch(breedId)
            .then(body => body.json())
            .then(({ status, message }) => {
              return {
                imageSrc: status === 'success' && message,
                fullBreedName,
              }
            })
        }
        const updateStateWithImageSrc = promise =>
          promise.then(({ imageSrc, fullBreedName }) => {
            const { breeds } = this.state
            const breedIndex = breeds.findIndex(
              breed => breed.fullBreedName === fullBreedName,
            )
            const breed = breeds[breedIndex]

            const newBreeds = [...breeds]
            newBreeds[breedIndex] = { ...breed, imageSrc }
            this.setState({
              breeds: newBreeds,
            })
          })

        const fetchDescription = ({ fullBreedName }) => {
          return fetch(
            'https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1',
          )
            .then(body => body.json())
            .then(([description]) => ({ fullBreedName, description }))
        }

        const updateStateWithDescription = promise =>
          promise.then(({ fullBreedName, description }) => {
            const { breeds } = this.state
            const breedIndex = breeds.findIndex(
              breed => breed.fullBreedName === fullBreedName,
            )
            const breed = breeds[breedIndex]

            const newBreeds = [...breeds]
            newBreeds[breedIndex] = { ...breed, description }
            this.setState({
              breeds: newBreeds,
            })
          })
        breeds.map(fetchImageSrc).map(updateStateWithImageSrc)
        breeds.map(fetchDescription).map(updateStateWithDescription)
      })
  }
  render() {
    return this.state.breeds.map(DogCard)
  }
}

export default App

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
              breedId: dogBreedPair.join('/'),
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
          return fetch(
            `https://dog.ceo/api/breed/` + breedId + `/images/random`,
          )
            .then(body => body.json())
            .then(({ status, message }) => {
              return {
                imageSrc: status === 'success' && message,
                fullBreedName,
              }
            })
        }
        const findBreedAndIndex = (breeds, fullBreedName) => {
          const breedIndex = breeds.findIndex(
            breed => breed.fullBreedName === fullBreedName,
          )
          const breed = breeds[breedIndex]
          return { breedIndex, breed }
        }
        const updateStateWithImageSrc = promise =>
          promise
            .then(data => {
              const { breeds } = this.state
              return { ...data, breeds }
            })
            .then(data => {
              return { ...data, key: 'imageSrc' }
            })
            .then(({ breeds, imageSrc, fullBreedName }) => {
              const { breedIndex, breed } = findBreedAndIndex(
                breeds,
                fullBreedName,
              )

              const newBreeds = [...breeds]
              newBreeds[breedIndex] = { ...breed, imageSrc }

              return newBreeds
            })
            .then(newBreeds => {
              this.setState({
                breeds: newBreeds,
              })
            })

        const updateStateWithDescription = promise =>
          promise
            .then(data => {
              const { breeds } = this.state
              return { ...data, breeds }
            })
            .then(({ breeds, fullBreedName, description }) => {
              const { breedIndex, breed } = findBreedAndIndex(
                breeds,
                fullBreedName,
              )

              const newBreeds = [...breeds]
              newBreeds[breedIndex] = { ...breed, description }

              return newBreeds
            })
            .then(newBreeds => {
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

        breeds.map(fetchImageSrc).map(updateStateWithImageSrc)
        breeds.map(fetchDescription).map(updateStateWithDescription)
      })
  }
  render() {
    return this.state.breeds.length === 0
      ? 'Loading...'
      : this.state.breeds.map(DogCard)
  }
}

export default App

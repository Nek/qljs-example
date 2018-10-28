import React, { Component } from 'react'
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
              imageSrcDataUrl:
                `https://dog.ceo/api/breed/` +
                dogBreedPair.join('/') +
                `/images/random`,
              descriptionTextUrl:
                'https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1',
              imageSrc: null,
              descriptionText: '',
            }
          })
        return data
      })
      .then(breeds => {
        this.setState({ breeds })
        return breeds
      })
      .then(breeds => {
        const fetchDogImageSrc = ({ fullBreedName, imageSrcDataUrl }) => {
          return fetch(imageSrcDataUrl)
            .then(body => body.json())
            .then(({ status, message }) => {
              console.log(fullBreedName, status, message)
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

            this.setState({
              breeds: Object.assign([...breeds], {
                [breedIndex]: { ...breed, imageSrc },
              }),
            })
          })
        breeds.map(fetchDogImageSrc).map(updateStateWithImageSrc)
      })
  }
  render() {
    return this.state.breeds.map(DogCard)
  }
}

export default App

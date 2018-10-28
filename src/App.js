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
              imageUrl: null,
              description: '',
            }
          })
        return data
      })
      .then(breeds => {
        this.setState({ breeds })
        return breeds
      })
      .then(breeds => {
        console.log(breeds)
      })
  }
  render() {
    return this.state.breeds.map(DogCard)
  }
}

export default App

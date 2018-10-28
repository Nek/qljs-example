import { Component } from 'react'
import './App.css'
import DogCard from './components/DogCard'

import { fetchAllBreeds, fetchImageSrc, fetchDescription } from './api'

import { rawDataToAppData } from './dataConversion'
import {
  updateStateWithImageSrc,
  updateStateWithDescription,
} from './stateUpdaters'

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

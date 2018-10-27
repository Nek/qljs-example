import {
  configure
} from '@storybook/react'

function loadStories() {
  require('../src/stories/DogCard.story')
}

configure(loadStories, module)

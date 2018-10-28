import React from 'react'

import { storiesOf } from '@storybook/react'
import DogCard from '../src/components/DogCard'

const defaultProps = {
  fullBreedName: 'Cerberus',
}

storiesOf('DogCard', module)
  .add('initial', () => <DogCard {...defaultProps} />)
  .add('with image', () => <DogCard {...defaultProps} imageSrc="/dog.jpg" />)
  .add('with description', () => (
    <DogCard {...defaultProps} description="Lorem ipsum dolor sit..." />
  ))
  .add('with image and description', () => (
    <DogCard
      {...defaultProps}
      description="Lorem ipsum dolor sit..."
      imageSrc="/dog.jpg"
    />
  ))

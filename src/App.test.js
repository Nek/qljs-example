import React from 'react'
import App from './App'

import Enzyme from 'enzyme'
import { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

it(`loads the data and renders`, () => {
  const result = { message: { hound: [], basset: ['grey', 'red'] } }
  fetch.once(JSON.stringify(result))
  fetch.once(JSON.stringify({ status: 'success', message: 'some_image' }))
  fetch.once(JSON.stringify({ status: 'success', message: 'some_image' }))
  fetch.once(JSON.stringify({ status: 'success', message: 'some_image' }))
  fetch.once(JSON.stringify(['description']))
  fetch.once(JSON.stringify(['description']))
  fetch.once(JSON.stringify(['description']))

  const wrapper = mount(<App />)

  setImmediate(() => {
    expect(wrapper.state('breeds')).toEqual([
      {
        fullBreedName: 'hound',
        breedId: 'hound',
        imageSrc: 'some_image',
        description: 'description',
      },
      {
        fullBreedName: 'basset - grey',
        breedId: 'basset/grey',
        imageSrc: 'some_image',
        description: 'description',
      },
      {
        fullBreedName: 'basset - red',
        breedId: 'basset/red',
        imageSrc: 'some_image',
        description: 'description',
      },
    ])
  })
})

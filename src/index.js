import 'react-app-polyfill/ie9'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

export const rerender = () => {
  ReactDOM.render(<App rerender />, document.getElementById('root'))
}

rerender()

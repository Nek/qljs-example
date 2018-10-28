import React from 'react'

const DogCard = ({ fullBreedName, imageSrc, description }) => {
  return (
    <div className=".dog-card">
      <h1>{fullBreedName}</h1>
      <img src={imageSrc} alt={fullBreedName} />
      <p>{description}</p>
    </div>
  )
}

export default DogCard

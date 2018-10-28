import React from 'react'

const DogCard = ({ fullBreedName, imageSrc, description }) => {
  return (
    <div className="dog-card" key={fullBreedName}>
      <h1>{fullBreedName}</h1>
      {imageSrc ? (
        <img src={imageSrc} alt={fullBreedName} />
      ) : (
        'Image is loading...'
      )}
      <p>{description ? description : 'Description is loading...'}</p>
    </div>
  )
}

export default DogCard

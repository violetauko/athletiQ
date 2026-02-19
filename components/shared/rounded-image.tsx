import React from 'react'

const RoundedImage = ({image,alt,size}:{image:string,alt:string,size:number}) => {
  return (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden`}>
        <img
            src={image}
            alt={alt}
            className="w-full h-full object-cover"
        />
    </div>
  )
}

export default RoundedImage;
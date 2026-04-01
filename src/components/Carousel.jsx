
import React, { useState } from 'react'
import './Carousel.css'




export default function Carousel({ images = [] }) {
  const [current, setCurrent] = useState(0)
  if (!images.length) return null

  const goToIndex = (idx) => {
    if (idx === current) return
    setCurrent(idx)
  }
  const prev = () => goToIndex(current === 0 ? images.length - 1 : current - 1)
  const next = () => goToIndex(current === images.length - 1 ? 0 : current + 1)

  return (
    <div className="carousel">
      <button className="carousel-arrow left" onClick={prev} aria-label="Précédent"><span className="carousel-arrow-icon">‹</span></button>
      <div className="carousel-image-wrapper">
        <img
          src={images[current].url}
          alt={images[current].description || ''}
          className="carousel-image"
          loading="lazy"
        />
        {images[current].description && (
          <div className="carousel-caption">{images[current].description}</div>
        )}
      </div>
      <button className="carousel-arrow right" onClick={next} aria-label="Suivant"><span className="carousel-arrow-icon">›</span></button>
      <div className="carousel-dots">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={idx === current ? 'dot active' : 'dot'}
            onClick={() => goToIndex(idx)}
            aria-label={`Aller à la photo ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}



import React, { useState } from 'react'
import { editions } from '../data/editions'
import Carousel from '../components/Carousel'
import './Retro.css'


export default function Retro() {
  const [selected, setSelected] = useState(0)
  const edition = editions[selected]
  return (
    <div className="retro-page">
      <header className="page-header">
        <h1>Rétrospective</h1>
        <p>Revivez les moments forts des éditions précédentes</p>
      </header>

      <div className="retro-edition-select">
        {editions.map((ed, idx) => (
          <button
            key={ed.annee}
            className={"retro-edition-btn" + (selected === idx ? " selected" : "")}
            onClick={() => setSelected(idx)}
          >
            {ed.annee}
          </button>
        ))}
      </div>
      <div className="retro-edition-desc">
        <h2 style={{marginBottom: '0.3em'}}>{edition.nom}</h2>
        <span>{edition.description}</span>
      </div>
      <Carousel images={edition.photos} animateFade />
    </div>
  )
}

// plus haut

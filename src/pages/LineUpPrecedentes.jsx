import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { artistes } from '../data/artistes'
import './LineUpPrecedentes.css'

function LineUpPrecedentes() {
  const [anneeSelectionnee, setAnneeSelectionnee] = useState('all')

  // Récupérer toutes les années précédentes (pas 2026)
  const anneesDisponibles = [...new Set(artistes
    .filter(a => a.annee !== 2026)
    .map(a => a.annee))]
    .sort((a, b) => b - a)

  // Filtrer les artistes selon l'année sélectionnée (exclure 2026)
  const artistesFiltered = anneeSelectionnee === 'all' 
    ? artistes.filter(a => a.annee !== 2026)
    : artistes.filter(a => a.annee === parseInt(anneeSelectionnee))

  // Regrouper les artistes par nom
  const artistesGroupes = artistesFiltered.reduce((acc, artiste) => {
    const existing = acc.find(a => a.nom === artiste.nom)
    if (existing) {
      // Ajouter l'année si elle n'existe pas déjà
      if (!existing.annees.includes(artiste.annee)) {
        existing.annees.push(artiste.annee)
        existing.annees.sort((a, b) => b - a) // Trier par année décroissante
      }
      // Garder le poids maximum
      if (artiste.poids > existing.poids) {
        existing.poids = artiste.poids
      }
    } else {
      acc.push({
        ...artiste,
        annees: [artiste.annee],
        poids: artiste.poids || 5 // Poids par défaut à 5 (moins important)
      })
    }
    return acc
  }, [])

  // Générer des variations aléatoires pour chaque artiste (mémorisé pour éviter le re-render)
  const artistesAvecStyle = useMemo(() => {
    // Trier les artistes : poids faible d'abord avec un facteur aléatoire
    const artistesMelanges = [...artistesGroupes].sort((a, b) => {
      const poidsA = a.poids || 5
      const poidsB = b.poids || 5
      
      // Mélange avec priorité au poids faible
      // Plus le poids est faible, plus la probabilité d'être en premier est élevée
      const scoreA = poidsA-1 + Math.random() * 5
      const scoreB = poidsB-1 + Math.random() * 5
      
      return scoreA - scoreB
    })
    
    return artistesMelanges.map(artiste => {
      // Rotation aléatoire entre -12 et +12 degrés
      const rotation = (Math.random() - 0.5) * 24
      
      // Taille selon le poids : poids 1 = 120%, poids 5 = 100%
      // Formule : 120% - (poids - 1) * 5%
      const poids = artiste.poids || 5
      const scale = 1 + ((5 - poids) * 0.06)
      
      // Z-index inversé : plus le poids est faible, plus il est au-dessus
      // poids 1 = z-index 50, poids 5 = z-index 10
      const zIndex = (6 - poids) * 10

      return {
        ...artiste,
        style: {
          transform: `rotate(${rotation}deg) scale(${scale})`,
          zIndex
        }
      }
    })
  }, [artistesGroupes])

  return (
    <div className="lineupprecedentes-page">
      <div className="artistes-filter">
        <div className="filter-buttons">
          {anneesDisponibles.map(annee => (
            <button 
              key={annee}
              className={anneeSelectionnee === annee.toString() ? 'active' : ''}
              onClick={() => setAnneeSelectionnee(annee.toString())}
            >
              {annee}
            </button>
          ))}
          <button 
            className={anneeSelectionnee === 'all' ? 'active' : ''}
            onClick={() => setAnneeSelectionnee('all')}
          >
            ALL-STAR
          </button>
        </div>
      </div>

      <div className="polaroid-board">
        {artistesAvecStyle.map(artiste => (
          <Link 
            key={artiste.id} 
            to={`/artistes/${artiste.slug}`}
            className="polaroid"
            style={artiste.style}
          >
            <div className="polaroid-photo">
              <img src={artiste.image} alt={artiste.nom} loading="lazy" />
            </div>
            <div className="polaroid-caption">
              <p className="polaroid-title">{artiste.nom}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default LineUpPrecedentes

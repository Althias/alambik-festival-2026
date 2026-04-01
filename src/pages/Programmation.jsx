import './Programmation.css'
// import { Link } from 'react-router-dom'
// import { artistes } from '../data/artistes'

function Programmation() {
  const texte = `Hop hop hop, pas trop vite ! La programmation sera prochainement dévoilée. En revanche, voilà ce à quoi il faut t'attendre :

Samedi 11/07 : arrivée possible dès le début d'après midi, avec un DJ set d'ambiance et des jeux dans tout le jardin. Début des concerts dès 18h, pour une soirée musicale jusqu'à ce que le sommeil t'attaque.

Dimanche 12/07 : On reprend les festivités dès le début d'après midi avec une programmation plus calme, le retour du grand jeu de l'année et du théâtre. Jusqu'à la tombée de la nuit.

Lundi 13/07 : Une nouveauté ! Cette année, on prolonge le kiff. L'idée est de profiter des ami.es un peu plus longtemps. Pas de concert de prévu, mais une journée détente : jeux entre ami.es ; discutions ; … On en profitera entre autre pour faire un cinéma en plein air, oh yeaaaaah !

Mardi 14/07 : c'est l'heure du départ ! Merci pour tous les souvenirs 🫶🏻`

  return (
    <div className="artistes-page">


      <div className="programmation-content">
        <p>{texte}</p>
      </div>
    </div>
  )
}

export default Programmation

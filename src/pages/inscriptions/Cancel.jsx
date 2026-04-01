import { Link } from 'react-router-dom'
import './Cancel.css'

function Cancel() {
  return (
    <div className="cancel-page">
      <div className="cancel-container">
        <div className="cancel-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1>Paiement annulé</h1>
        
        <p className="subtitle">
          Pas de souci, tu n'as pas été débité.<br />
          Tu peux réessayer quand tu veux !
        </p>
        
        <div className="info-box">
          <h3>Pourquoi annuler ?</h3>
          <ul>
            <li>💳 Problème de carte bancaire</li>
            <li>🤔 Besoin de réfléchir</li>
            <li>📝 Vérifier les informations</li>
            <li>💰 Préférer le paiement manuel</li>
          </ul>
        </div>
        
        <div className="info-box info-box-highlight">
          <h3>💡 Le savais-tu ?</h3>
          <p>
            Tu peux aussi choisir le <strong>paiement manuel</strong> (virement bancaire ou Wero) lors de ton inscription. 
            Aucune carte bancaire nécessaire !
          </p>
        </div>
        
        <p className="encourage">
          Les places partent vite, on t'attend ! 🎪
        </p>
        
        <div className="actions">
          <Link to="/inscriptions" className="btn btn-primary">Réessayer l'inscription</Link>
          <Link to="/" className="btn btn-secondary">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  )
}

export default Cancel

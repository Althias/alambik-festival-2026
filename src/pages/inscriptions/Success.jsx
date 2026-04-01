import { Link, useSearchParams } from 'react-router-dom'
import './Success.css'

function Success() {
  const [searchParams] = useSearchParams()
  const paymentMethod = searchParams.get('paymentMethod')
  const montant = searchParams.get('montant')
  
  const showPaymentInfo = paymentMethod !== 'card' && montant
  const titre = showPaymentInfo ? 'Inscription presque validée !' : 'Inscription validée !'

  return (
    <div className="success-page">
      <div className="success-container">
   
        <h1>{titre}</h1>
        
        <p className="subtitle">
          Merci pour ton inscription à l'Alambik Festival !<br />
          Tu vas recevoir un email de confirmation avec tous les détails.
        </p>

        {showPaymentInfo && (
          <div className="payment-info">
            <p className="payment-text">
              Si le paiement n'est pas déjà fait, merci de le faire rapidement. Entre les artistes et la location du matériel, 
              on a des frais à avancer et avoir les sous nous aide vraiment ! Merci d'avance 🙏🏻
            </p>
            <p className="payment-options-title"><strong>Paiement à effectuer : {parseFloat(montant).toFixed(2).replace('.', ',')} €</strong></p>
            <ul className="payment-info-list">
              <li><strong>Par RIB :</strong> FR76 3000 4031 6600 0021 9532 628</li>
              <li><strong>Par WERO :</strong> 06.03.36.63.30</li>
            </ul>
          </div>
        )}

        <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
    </div>
  )
}

export default Success

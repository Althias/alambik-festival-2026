import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Inscription.css'

function Inscription() {
  const navigate = useNavigate()
  const [etape, setEtape] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    paymentMethod: 'card',
    billetsDetails: [{
      type: '30',
      nom: '',
      prenom: '',
      repasDebut: 0,
      repasFin: 5,
      sansRepas: false,
      carteConso: 0
    }],
    commentaire: ''
  })

  const [prix, setPrix] = useState(0)

  const nbTotalBillets = formData.billetsDetails.length

  useEffect(() => {
    let total = 0
    
    // Billets et repas individuels par participant
    formData.billetsDetails.forEach(billet => {
      // Prix du billet
      total += parseInt(billet.type) || 0
      
      // Repas
      if (!billet.sansRepas) {
        const debut = parseInt(billet.repasDebut) || 0
        const fin = parseInt(billet.repasFin) || 5
        const nbRepas = fin - debut + 1
        total += nbRepas * 4 // 4€ par repas
      }
      // Cartes conso
      total += (parseInt(billet.carteConso) || 0) * 10
    })
    
    // Frais de paiement carte
    if (formData.paymentMethod === 'card') {
      total += 1
    }
    
    setPrix(total)
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const ajouterParticipant = () => {
    setFormData(prev => ({
      ...prev,
      billetsDetails: [...prev.billetsDetails, {
        type: '30',
        nom: '',
        prenom: '',
        repasDebut: 0,
        repasFin: 5,
        sansRepas: false,
        carteConso: 0
      }]
    }))
  }

  const supprimerParticipant = (index) => {
    setFormData(prev => ({
      ...prev,
      billetsDetails: prev.billetsDetails.filter((_, i) => i !== index)
    }))
  }

  const handleBilletDetailChange = (index, field, value) => {
    setFormData(prev => {
      const newBilletsDetails = [...prev.billetsDetails]
      newBilletsDetails[index][field] = value
      return {
        ...prev,
        billetsDetails: newBilletsDetails
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      alert('Veuillez renseigner une adresse email')
      setEtape(2)
      return
    }
    
    try {
      // Si paiement par carte, rediriger vers Stripe
      if (formData.paymentMethod === 'card') {
        console.log('Création session Stripe...')
        
        const response = await fetch('/api/public/create-checkout-session.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
        
        const result = await response.json()
        
        if (response.ok && result.url) {
          // Rediriger vers Stripe Checkout
          window.location.href = result.url
        } else {
          alert(`Erreur lors de la création de la session de paiement : ${result.error || 'Erreur inconnue'}`)
        }
        return
      }
      
      // Sinon, envoyer directement à l'API (paiement manuel)
      console.log('Envoi vers:', '/api/public/inscription.php')
      console.log('Données:', formData)
      
      const response = await fetch('/api/public/inscription.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      console.log('Status:', response.status)
      const responseText = await response.text()
      console.log('Réponse brute:', responseText)
      
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError)
        alert('Erreur : La réponse du serveur n\'est pas au bon format. Vérifiez la console.')
        return
      }
      
      if (response.ok && result.success) {
        // Rediriger vers la page de succès avec les infos de paiement
        const params = new URLSearchParams({
          paymentMethod: formData.paymentMethod,
          montant: prix.toFixed(2)
        })
        navigate(`/success?${params.toString()}`)
      } else {
        alert(`Erreur lors de l'inscription : ${result.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion au serveur. Veuillez réessayer.')
    }
  }

  const goToNextEtape = () => {
    // Étape 1 -> vérifier qu'il y a au moins un billet
    if (etape === 1 && nbTotalBillets === 0) {
      alert('Veuillez sélectionner au moins un billet')
      return
    }
    
    // Vérifier que tous les festivaliers ont un nom et un prénom
    if (etape === 1) {
      for (let i = 0; i < formData.billetsDetails.length; i++) {
        const billet = formData.billetsDetails[i]
        if (!billet.prenom || !billet.prenom.trim()) {
          alert(`Le prénom du festivalier ${i + 1} est obligatoire`)
          return
        }
        if (!billet.nom || !billet.nom.trim()) {
          alert(`Le nom du festivalier ${i + 1} est obligatoire`)
          return
        }
      }
    }
    
    setEtape(etape + 1)
  }

  const goToPrevEtape = () => {
    setEtape(etape - 1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && etape < 2) {
      e.preventDefault()
      goToNextEtape()
    }
  }

  return (
    <div className="inscriptions-page">
      <div className="inscription-container">
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="inscription-form tunnel-form">
          
          {/* ÉTAPE 1 : Inscriptions (Billets + Détails) */}
          {etape === 1 && (
            <div className="etape-content">
              <div className="inscriptions-header">
                <div className="header-title">
                  <h2>Inscriptions</h2>
                  <p className="subtitle">Alambik Festival 2026 - Du Samedi 11/07 au Mardi 14/07</p>
                </div>
              </div>
                {formData.billetsDetails.map((billet, index) => (
                <div key={index} className="billet-detail-card">
                    <div className="billet-detail-header">
                    <div className="billet-detail-label">
                        <span className="participant-number">Festivalier {index + 1}</span>
                    </div>
                    <button 
                        type="button" 
                        className="btn-delete-participant"
                        onClick={() => supprimerParticipant(index)}
                        title="Supprimer ce festivalier"
                    >
                        X
                    </button>
                    </div>
                    
                    <div className="billet-detail-inputs">
                    <div className="input-with-required">
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={billet.prenom}
                        onChange={(e) => handleBilletDetailChange(index, 'prenom', e.target.value)}
                        required
                      />
                      <span className="required-indicator">*</span>
                    </div>
                    <div className="input-with-required">
                      <input
                        type="text"
                        placeholder="Nom"
                        value={billet.nom}
                        onChange={(e) => handleBilletDetailChange(index, 'nom', e.target.value)}
                        required
                      />
                      <span className="required-indicator">*</span>
                    </div>
                    </div>
                    
                    {/* TYPE DE BILLET - doit apparaître ici, juste après nom/prénom */}
                    <div className="billet-type-select-row">
                    <div className="billet-type-select">
                        <label>Type de billet</label>
                        <p className="billet-type-subtitle">Le prix du billet ne doit pas être un obstacle à ta participation, n'hésites pas à nous contacter !</p>
                        <div className="billet-type-options">
                        <label className={`billet-type-option ${billet.type === '30' ? 'selected' : ''}`}>
                            <input
                            type="radio"
                            name={`billet-type-${index}`}
                            value="30"
                            checked={billet.type === '30'}
                            onChange={(e) => handleBilletDetailChange(index, 'type', e.target.value)}
                            />
                            <span className="billet-type-name">XL</span>
                            <span className="billet-type-price">30€</span>
                        </label>
                        <label className={`billet-type-option ${billet.type === '35' ? 'selected' : ''}`}>
                            <input
                            type="radio"
                            name={`billet-type-${index}`}
                            value="35"
                            checked={billet.type === '35'}
                            onChange={(e) => handleBilletDetailChange(index, 'type', e.target.value)}
                            />
                            <span className="billet-type-name">XXL</span>
                            <span className="billet-type-price">35€</span>
                        </label>
                        <label className={`billet-type-option ${billet.type === '40' ? 'selected' : ''}`}>
                            <input
                            type="radio"
                            name={`billet-type-${index}`}
                            value="40"
                            checked={billet.type === '40'}
                            onChange={(e) => handleBilletDetailChange(index, 'type', e.target.value)}
                            />
                            <span className="billet-type-name">XXXL</span>
                            <span className="billet-type-price">40€</span>
                        </label>
                        <label className={`billet-type-option ${billet.type === '0' ? 'selected' : ''}`}>
                            <input
                            type="radio"
                            name={`billet-type-${index}`}
                            value="0"
                            checked={billet.type === '0'}
                            onChange={(e) => handleBilletDetailChange(index, 'type', e.target.value)}
                            />
                            <span className="billet-type-name">ENFANT</span>
                            <span className="billet-type-price">0€</span>
                        </label>
                        </div>
                        <div className="billet-type-detail">
                        {billet.type === '30' && 'Billet standard'}
                        {billet.type === '35' && 'Billet pour soutenir le festival'}
                        {billet.type === '40' && 'Billet pour soutenir le festival à fond'}
                        {billet.type === '0' && 'Billet enfant'}
                        </div>
                    </div>
                    </div>
                    
                    <div className="billet-duree-section">
                    <div className="repas-header">
                        <div className="repas-title-block">
                        <span className="repas-main-label">Repas</span>
                        <span className="repas-price-label">4€/repas</span>
                        </div>
                        <div className="repas-badges">
                        {(() => {
                            const debut = billet.repasDebut !== undefined ? billet.repasDebut : 0;
                            const fin = billet.repasFin !== undefined ? billet.repasFin : 5;
                            const labels = [
                            { jour: 'Sam.', periode: 'soir' },
                            { jour: 'Dim.', periode: 'midi' },
                            { jour: 'Dim.', periode: 'soir' },
                            { jour: 'Lun.', periode: 'midi' },
                            { jour: 'Lun.', periode: 'soir' },
                            { jour: 'Mar.', periode: 'midi' }
                            ];
                            
                            if (debut === fin) {
                            return (
                                <span className="repas-badge">
                                <span className="badge-jour">{labels[debut].jour}</span>
                                <span className="badge-periode">{labels[debut].periode}</span>
                                </span>
                            );
                            } else {
                            return (
                                <>
                                <span className="repas-badge">
                                    <span className="badge-jour">{labels[debut].jour}</span>
                                    <span className="badge-periode">{labels[debut].periode}</span>
                                </span>
                                <span className="repas-arrow">→</span>
                                <span className="repas-badge">
                                    <span className="badge-jour">{labels[fin].jour}</span>
                                    <span className="badge-periode">{labels[fin].periode}</span>
                                </span>
                                </>
                            );
                            }
                        })()}
                        </div>
                    </div>
                    
                    <div className={`dual-range-slider ${billet.sansRepas ? 'disabled' : ''}`}>
                        <div className="slider-track">
                        <div 
                            className="slider-range"
                            style={{
                            left: `${((billet.repasDebut !== undefined ? billet.repasDebut : 0) / 5) * 100}%`,
                            width: `${(((billet.repasFin !== undefined ? billet.repasFin : 5) - (billet.repasDebut !== undefined ? billet.repasDebut : 0)) / 5) * 100}%`
                            }}
                        ></div>
                        </div>
                        <input
                        type="range"
                        min="0"
                        max="5"
                        value={billet.repasDebut || 0}
                        onChange={(e) => {
                            if (!billet.sansRepas) {
                            const newDebut = parseInt(e.target.value)
                            const fin = billet.repasFin !== undefined ? billet.repasFin : 5
                            // Permettre début === fin (un seul repas)
                            // Déplacer fin seulement si début dépasse strictement fin
                            if (newDebut > fin) {
                                handleBilletDetailChange(index, 'repasFin', newDebut)
                            }
                            handleBilletDetailChange(index, 'repasDebut', newDebut)
                            }
                        }}
                        className="range-slider range-min"
                        disabled={billet.sansRepas}
                        />
                        <input
                        type="range"
                        min="0"
                        max="5"
                        value={billet.repasFin !== undefined ? billet.repasFin : 5}
                        onChange={(e) => {
                            if (!billet.sansRepas) {
                            const newFin = parseInt(e.target.value)
                            const debut = billet.repasDebut || 0
                            // Permettre début === fin (un seul repas)
                            // Déplacer début seulement si fin passe en dessous de début
                            if (newFin < debut) {
                                handleBilletDetailChange(index, 'repasDebut', newFin)
                            }
                            handleBilletDetailChange(index, 'repasFin', newFin)
                            }
                        }}
                        className="range-slider range-max"
                        disabled={billet.sansRepas}
                        />
                    </div>
                    
                    <div className="repas-labels">
                        <span className="repas-label-item">Sam.<br/>11/07<br/>soir</span>
                        <span className="repas-label-item">Dim.<br/>12/07<br/>midi</span>
                        <span className="repas-label-item">Dim.<br/>12/07<br/>soir</span>
                        <span className="repas-label-item">Lun.<br/>13/07<br/>midi</span>
                        <span className="repas-label-item">Lun.<br/>13/07<br/>soir</span>
                        <span className="repas-label-item">Mar.<br/>14/07<br/>midi</span>
                    </div>

                    <div className="sans-repas-option">
                        <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={billet.sansRepas || false}
                            onChange={(e) => handleBilletDetailChange(index, 'sansRepas', e.target.checked)}
                        />
                        <span>Je ne souhaite pas prendre de repas</span>
                        </label>
                    </div>
                    </div>

                    <div className="carte-conso-section">
                    <div className="carte-conso-header">
                        <div className="carte-title-block">
                        <span className="carte-main-label">Carte 10 consos</span>
                        <span className="carte-price-label">10€/carte</span>
                        </div>
                        <span className="carte-conso-count">{billet.carteConso || 0} carte{(billet.carteConso || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="carte-conso-slider">
                        <div className="carte-conso-track">
                        <div 
                            className="carte-conso-progress"
                            style={{
                            width: `${((billet.carteConso || 0) / 10) * 100}%`
                            }}
                        ></div>
                        </div>
                        <input
                        type="range"
                        value={billet.carteConso || 0}
                        onChange={(e) => handleBilletDetailChange(index, 'carteConso', parseInt(e.target.value))}
                        min="0"
                        max="10"
                        className="carte-conso-range"
                        />
                    </div>
                    <div className="carte-conso-tarifs">
                        <p><strong>Tarifs :</strong></p>
                        <p>- bière : 1-2 trous</p>
                        <p>- cocktail : 2 trous</p>
                        <p>- soft : 0 trou</p>
                        <p>- croque-monsieur : 1 trou</p>
                    </div>
                    </div>

                    <div className="billet-total">
                    <strong>Total du billet :</strong> 
                    <span className="billet-total-prix">
                        {(() => {
                        const prixBillet = parseInt(billet.type) || 0;
                        const prixRepas = !billet.sansRepas ? 
                            ((billet.repasFin !== undefined ? billet.repasFin : 5) - (billet.repasDebut !== undefined ? billet.repasDebut : 0) + 1) * 4 : 0;
                        const prixCartes = (billet.carteConso || 0) * 10;
                        return prixBillet + prixRepas + prixCartes;
                        })()}€
                    </span>
                    </div>
                </div>
                ))}


              <div className="tunnel-navigation">
                <button type="button" className="btn-add-participant" onClick={ajouterParticipant}>
                  + Ajouter un festivalier
                </button>
                <button type="button" className="btn-next" onClick={goToNextEtape}>
                  Suivant →
                </button>
              </div>
            </div>
          )}

          

          {/* ÉTAPE 2 : Commande */}
          {etape === 2 && (
            <div className="etape-content">
              <h2>Commande</h2>

              <div className="recap-section">
                <h3>Récapitulatif</h3>
                <table className="recap-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Quantité</th>
                      <th>Prix unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const billetsCount = {
                        '0': 0,
                        '30': 0,
                        '35': 0,
                        '40': 0
                      }
                      formData.billetsDetails.forEach(b => {
                        billetsCount[b.type] = (billetsCount[b.type] || 0) + 1
                      })
                      return (
                        <>
                          {billetsCount['30'] > 0 && (
                            <tr>
                              <td>Billet XL</td>
                              <td>{billetsCount['30']}</td>
                              <td>30€</td>
                              <td className="total-cell">{billetsCount['30'] * 30}€</td>
                            </tr>
                          )}
                          {billetsCount['35'] > 0 && (
                            <tr>
                              <td>Billet XXL</td>
                              <td>{billetsCount['35']}</td>
                              <td>35€</td>
                              <td className="total-cell">{billetsCount['35'] * 35}€</td>
                            </tr>
                          )}
                          {billetsCount['40'] > 0 && (
                            <tr>
                              <td>Billet XXXL</td>
                              <td>{billetsCount['40']}</td>
                              <td>40€</td>
                              <td className="total-cell">{billetsCount['40'] * 40}€</td>
                            </tr>
                          )}
                          {billetsCount['0'] > 0 && (
                            <tr>
                              <td>Billet Enfant</td>
                              <td>{billetsCount['0']}</td>
                              <td>0€</td>
                              <td className="total-cell">0€</td>
                            </tr>
                          )}
                        </>
                      )
                    })()}
                    {(() => {
                      const totalRepas = formData.billetsDetails.reduce((sum, billet) => {
                        if (billet.sansRepas) return sum
                        const debut = billet.repasDebut !== undefined ? billet.repasDebut : 0
                        const fin = billet.repasFin !== undefined ? billet.repasFin : 5
                        return sum + (fin - debut + 1)
                      }, 0)
                      return totalRepas > 0 && (
                        <tr>
                          <td>Repas</td>
                          <td>{totalRepas}</td>
                          <td>4€</td>
                          <td className="total-cell">{totalRepas * 4}€</td>
                        </tr>
                      )
                    })()}
                    {(() => {
                      const totalCartes = formData.billetsDetails.reduce((sum, billet) => sum + (billet.carteConso || 0), 0)
                      return totalCartes > 0 && (
                        <tr>
                          <td>Carte 10 consos</td>
                          <td>{totalCartes}</td>
                          <td>10€</td>
                          <td className="total-cell">{totalCartes * 10}€</td>
                        </tr>
                      )
                    })()}
                    {formData.paymentMethod === 'card' && (
                      <tr>
                        <td>Frais paiement bancaire</td>
                        <td>1</td>
                        <td>1€</td>
                        <td className="total-cell">1€</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="3">TOTAL</td>
                      <td className="total-price">{prix}€</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="recap-section">
                <h3>Mode de paiement</h3>
                <div className="payment-options">
                  <label className={`payment-card ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} />
                    <div className="payment-content">
                      <span className="payment-title">Paiement CB</span>
                      <span className="payment-subtitle">Paiement avec un service externe</span>
                      <div className="payment-details-inline">
                        <span>Frais supplémentaire de 1€</span>
                      </div>
                    </div>
                  </label>
                  <label className={`payment-card ${formData.paymentMethod === 'manual' ? 'selected' : ''}`}>
                    <input type="radio" name="paymentMethod" value="manual" checked={formData.paymentMethod === 'manual'} onChange={handleChange} />
                    <div className="payment-content">
                      <span className="payment-title">Paiement WERO ou RIB</span>
                      <span className="payment-subtitle">à réaliser immédiatement</span>
                      <div className="payment-details-inline">
                        <span>RIB : FR76 3000 4031 6600 0021 9532 628</span>
                        <span>WERO : 06.03.36.63.30</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="required">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="commentaire">Commentaire</label>
                <textarea
                  id="commentaire"
                  name="commentaire"
                  rows="3"
                  value={formData.commentaire}
                  onChange={handleChange}
                  placeholder="Questions, demandes spéciales..."
                />
              </div>

              <div className="tunnel-navigation">
                <button type="button" className="btn-prev" onClick={goToPrevEtape}>
                  ← Retour
                </button>
                <button type="submit" className="btn-submit">
                  Valider l'inscription
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}

export default Inscription

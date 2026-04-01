import { useState, useEffect, Fragment } from 'react'
import { useSearchParams } from 'react-router-dom'
import './ListeInscriptions.css'

function ListeInscriptions() {
  const [searchParams] = useSearchParams()
  const password = searchParams.get('password')
  const mock = searchParams.get('mock')
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedRows, setExpandedRows] = useState({})

  useEffect(() => {
    if (!password) {
      setError('Mot de passe requis. Ajoutez ?password=VOTRE_PASSWORD à l\'URL')
      setLoading(false)
      return
    }

    const mockParam = mock ? `&mock=${mock}` : ''
    fetch(`/api/admin/list_inscriptions.php?password=${encodeURIComponent(password)}${mockParam}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur de chargement')
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setData(data)
        } else {
          setError(data.error || 'Erreur inconnue')
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [password, mock])

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleStatusChange = async (e, inscription) => {
    e.stopPropagation() // Empêcher l'ouverture/fermeture de la ligne
    
    const newStatus = inscription.payment_status === 'paid' ? 'pending' : 'paid'
    
    try {
      const response = await fetch('/api/admin/update_payment_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: password,
          inscription_id: inscription.id,
          payment_status: newStatus
        })
      })

      const result = await response.json()

      if (result.success) {
        // Mettre à jour l'état local
        setData(prevData => ({
          ...prevData,
          inscriptions: prevData.inscriptions.map(i => 
            i.id === inscription.id 
              ? { ...i, payment_status: newStatus }
              : i
          ),
          stats: {
            ...prevData.stats,
            total_paye: newStatus === 'paid' 
              ? prevData.stats.total_paye + parseFloat(inscription.montant_total)
              : prevData.stats.total_paye - parseFloat(inscription.montant_total),
            total_en_attente: newStatus === 'paid'
              ? prevData.stats.total_en_attente - parseFloat(inscription.montant_total)
              : prevData.stats.total_en_attente + parseFloat(inscription.montant_total)
          }
        }))
      } else {
        alert('Erreur : ' + (result.error || 'Impossible de mettre à jour le statut'))
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="admin-page-minimal">
        <div className="loading">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page-minimal">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  const { stats, inscriptions } = data

  return (
    <div className="admin-page-minimal">
      <div className="admin-content">
        <h1>Inscriptions</h1>
        
        <div className="stats-minimal">
          <span><strong>{stats.total_inscriptions}</strong> inscriptions</span>
          <span><strong>{stats.total_billets}</strong> billets</span>
          <span><strong>{stats.total_montant.toFixed(2)} €</strong> total</span>
          <span><strong>{stats.total_paye.toFixed(2)} €</strong> payé</span>
          <span><strong>{stats.total_en_attente.toFixed(2)} €</strong> en attente</span>
        </div>
        
        <div className="table-wrapper">
          <table className="inscriptions-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Email</th>
                <th>Date</th>
                <th>Billets</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {inscriptions && inscriptions.map(inscription => (
                <Fragment key={inscription.id}>
                  <tr onClick={() => toggleRow(inscription.id)} className="inscription-row">
                    <td className="expand-cell">
                      <span className="expand-icon">{expandedRows[inscription.id] ? '▼' : '▶'}</span>
                    </td>
                    <td><strong>#{inscription.id}</strong></td>
                    <td>{inscription.email}</td>
                    <td>{new Date(inscription.date_inscription).toLocaleString('fr-FR')}</td>
                    <td>{inscription.nb_billets}</td>
                    <td><strong>{parseFloat(inscription.montant_total).toFixed(2)} €</strong></td>
                    <td>
                      <span className={`badge ${inscription.payment_method === 'card' ? 'badge-card' : 'badge-manual'}`}>
                        {inscription.payment_method === 'card' ? 'CB' : 'Manuel'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`badge badge-clickable ${inscription.payment_status === 'paid' ? 'badge-paid' : 'badge-pending'}`}
                        onClick={(e) => handleStatusChange(e, inscription)}
                        title="Cliquer pour changer le statut"
                      >
                        {inscription.payment_status === 'paid' ? '✓' : '⏳'}
                      </span>
                    </td>
                    <td>{inscription.commentaire || '-'}</td>
                  </tr>
                  {expandedRows[inscription.id] && inscription.billets && (
                    <tr className="billets-details-row">
                      <td colSpan="9">
                        <div className="billets-container">
                          <h3>Détails des billets ({inscription.nb_billets})</h3>
                          <table className="billets-table">
                            <thead>
                              <tr>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Type</th>
                                <th>Repas</th>
                                <th>Cartes conso</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inscription.billets.map(billet => (
                                <tr key={billet.id}>
                                  <td>{billet.nom}</td>
                                  <td>{billet.prenom}</td>
                                  <td>{billet.type_billet} €</td>
                                  <td>
                                    {billet.sans_repas ? (
                                      <span className="no-meal">Sans repas</span>
                                    ) : (
                                      `J${parseInt(billet.repas_debut)} → J${parseInt(billet.repas_fin)}`
                                    )}
                                  </td>
                                  <td>{billet.carte_conso || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ListeInscriptions

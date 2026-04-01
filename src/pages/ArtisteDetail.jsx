import { useParams, Link } from 'react-router-dom'
import { artistes } from '../data/artistes'
import './ArtisteDetail.css'

function ArtisteDetail() {
  const { slug } = useParams()
  const artiste = artistes.find(a => a.slug === slug)

  if (!artiste) {
    return (
      <div className="artiste-detail">
        <p>Artiste non trouvé</p>
        <Link to="/artistes">Retour aux artistes</Link>
      </div>
    )
  }

  return (
    <div className="artiste-detail">
      <Link to="/artistes" className="back-link">← Retour aux artistes</Link>
      
      <div className="artiste-hero">
        <div className="artiste-hero-image">
          <img src={artiste.image} alt={artiste.nom} loading="lazy" />
        </div>
        <div className="artiste-hero-content">
          <h1>{artiste.nom}</h1>
          <p className="artiste-genre-tag">{artiste.genre}</p>
        </div>
      </div>

      <div className="artiste-content">
        <section className="artiste-bio">
          <h2>Biographie</h2>
          <p>{artiste.bio}</p>
        </section>

        {artiste.liens && (
          <section className="artiste-links">
            <h2>Suivre l'artiste</h2>
            <div className="social-links">
              {artiste.liens.spotify && (
                <a href={artiste.liens.spotify} target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/images/icon/spotify.png" alt="Spotify" loading="lazy" />
                  <span>Spotify</span>
                </a>
              )}
              {artiste.liens.instagram && (
                <a href={artiste.liens.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/images/icon/instagram.png" alt="Instagram" loading="lazy" />
                  <span>Instagram</span>
                </a>
              )}
              {artiste.liens.youtube && (
                <a href={artiste.liens.youtube} target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/images/icon/youtube.png" alt="YouTube" loading="lazy" />
                  <span>YouTube</span>
                </a>
              )}
              {artiste.liens.soundcloud && (
                <a href={artiste.liens.soundcloud} target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/images/icon/soundcloud.png" alt="SoundCloud" loading="lazy" />
                  <span>SoundCloud</span>
                </a>
              )}
              {artiste.liens.facebook && (
                <a href={artiste.liens.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/images/icon/facebook.png" alt="Facebook" loading="lazy" />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ArtisteDetail

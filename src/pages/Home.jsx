import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <img src="/images/accueil/alambik_logo.png" alt="Alambik Festival" className="festival-logo" />
          <p className="festival-subtitle">11-12-13 Juillet 2026</p>
          <div className="hero-cta">
            <Link to="/inscriptions" className="btn btn-primary">S'inscrire maintenant</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
    
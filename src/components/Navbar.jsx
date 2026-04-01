import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          Alambik
        </Link>
        
        <button className="burger-menu" onClick={toggleMenu} aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <button className="close-menu-btn" onClick={closeMenu} aria-label="Fermer le menu">
            <span>×</span>
          </button>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>Accueil</Link>
          </li>
          <li className="nav-item">
            <Link to="/programmation" className="nav-link" onClick={closeMenu}>Programmation</Link>
          </li>
          <li className="nav-item">
            <Link to="/line-up-precedentes" className="nav-link" onClick={closeMenu}>Line-up précédentes</Link>
          </li>
          <li className="nav-item">
            <Link to="/inscriptions" className="nav-link" onClick={closeMenu}>Inscriptions</Link>
          </li>
          <li className="nav-item">
            <Link to="/infos" className="nav-link" onClick={closeMenu}>Infos</Link>
          </li>
          <li className="nav-item">
            <Link to="/faq" className="nav-link" onClick={closeMenu}>FAQ</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

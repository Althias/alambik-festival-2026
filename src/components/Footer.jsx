import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="social-icons">
          <a href="https://www.instagram.com/alambik_festival/" target="_blank" rel="noopener noreferrer">
            <img src="/images/icon/instagram.png" alt="Instagram" loading="lazy" />
          </a>
          <a href="https://open.spotify.com/playlist/1A3BFQFaPAc1T7F8zqHZ4P?si=2f9e8c8a049d47b5" target="_blank" rel="noopener noreferrer">
            <img src="/images/icon/spotify.png" alt="Spotify" loading="lazy" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

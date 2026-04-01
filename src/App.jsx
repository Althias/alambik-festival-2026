import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Programmation from './pages/Programmation'
import LineUpPrecedentes from './pages/LineUpPrecedentes'
import ArtisteDetail from './pages/ArtisteDetail'
import Inscription from './pages/Inscription'
import Retro from './pages/Retro'
import InfoUtiles from './pages/InfoUtiles'
import FAQ from './pages/FAQ'
import Success from './pages/inscriptions/Success'
import Cancel from './pages/inscriptions/Cancel'
import ListeInscriptions from './pages/Admin/ListeInscriptions'
import './App.css'

// Layout pour les pages publiques (avec Navbar et Footer)
function PublicLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages publiques avec Navbar et Footer */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/programmation" element={<PublicLayout><Programmation /></PublicLayout>} />
        <Route path="/line-up-precedentes" element={<PublicLayout><LineUpPrecedentes /></PublicLayout>} />
        <Route path="/artistes/:slug" element={<PublicLayout><ArtisteDetail /></PublicLayout>} />
        <Route path="/inscriptions" element={<PublicLayout><Inscription /></PublicLayout>} />
        <Route path="/retro" element={<PublicLayout><Retro /></PublicLayout>} />
        <Route path="/infos" element={<PublicLayout><InfoUtiles /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
        <Route path="/success" element={<PublicLayout><Success /></PublicLayout>} />
        <Route path="/cancel" element={<PublicLayout><Cancel /></PublicLayout>} />
        
        {/* Pages admin sans Navbar ni Footer */}
        <Route path="/admin/inscriptions" element={<ListeInscriptions />} />
      </Routes>
    </Router>
  )
}

export default App

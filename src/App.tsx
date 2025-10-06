import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/Navbar.tsx'
import ListaColaboradores from './components/lista-colaboradores/ListaColaboradores'
import NovaPagina from './pages/NovaPagina'

function App() {
  return (
    <Router>
      <div className="App min-h-screen">
        <Navbar />
        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<ListaColaboradores />} />
            <Route path="/nova-pagina" element={<NovaPagina />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

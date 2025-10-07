import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/Navbar.tsx'
import ListaColaboradores from './components/lista-colaboradores/ListaColaboradores'
import RelatorioNovosCadastros from './pages/RelatorioNovosCadastros.tsx'

function App() {
  return (
    <Router>
      <div className="App min-h-screen">
        <Navbar />
        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<ListaColaboradores />} />
            <Route path="/relatorio-novos-cadastros" element={<RelatorioNovosCadastros />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

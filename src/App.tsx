import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/sidebar/Sidebar.tsx'
import ListaColaboradores from './pages/ListaColaboradores.tsx'
import RelatorioNovosCadastros from './pages/RelatorioNovosCadastros.tsx'

function App() {
  return (
    <Router>
      <div className="App flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50" style={{ marginLeft: '0' }}>
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

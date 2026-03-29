import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import GuessFlags from './pages/GuessFlags'
import GuessMap from './pages/GuessMap'
import GuessRivers from './pages/GuessRivers'
import GuessCapitals from './pages/GuessCapitals'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guessFlags" element={<GuessFlags />} />
        <Route path="/guessMap" element={<GuessMap />} />
        <Route path="/guessRivers" element={<GuessRivers />} />
        <Route path="/guessCapitals" element={<GuessCapitals />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

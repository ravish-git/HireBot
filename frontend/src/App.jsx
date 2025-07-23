import NavBar from './components/NavBar.jsx'
import Hero from './components/Hero.jsx'
import Features from './components/Features.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return(
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar/>
      <Hero/>
      <Features/>
      <Footer/>
    </div>
  );
}

export default App;

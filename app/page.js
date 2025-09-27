import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import NewArrivals from './components/NewArrivals';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <NewArrivals />
      <Footer />
    </main>
  );
}
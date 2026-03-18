// 123Milhas Search Frontend - v1.0.5
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Search, Plane, Clock, ArrowRight, TrendingUp, Filter, MapPin } from 'lucide-react';
import mockData from './mockData.json';

function App() {
  const [origin, setOrigin] = useState('SAO');
  const [destination, setDestination] = useState('RIO');
  const [date, setDate] = useState('2026-03-25');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ min: 0, max: 0, count: 0 });

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'voos'), orderBy('price', 'asc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const flightsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (flightsList.length > 0) {
          setFlights(flightsList);
          const prices = flightsList.map(f => f.price);
          setStats({
            min: Math.min(...prices),
            max: Math.max(...prices),
            count: flightsList.length
          });
        }
      }, (error) => {
        console.warn("Firestore Error (Silent Mode):", error.message);
        // Se ainda não temos dados, e o Firestore deu erro, tentamos carregar do mock imediatamente
        if (flights.length === 0) {
            setFlights(mockData.map((d, i) => ({ id: `offline-${i}`, ...d })));
            setStats({
              min: Math.min(...mockData.map(f => f.price)),
              max: Math.max(...mockData.map(f => f.price)),
              count: mockData.length
            });
        }
      });
    } catch (e) {
      console.warn("Firestore Setup Error:", e.message);
    }
    return () => unsubscribe();
  }, [flights.length]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de chamada ao "Engine" de Scraping
    // No futuro, isso aciona uma Cloud Function ou um Backend que faz o scraping
    // Failover: Se o Firestore falhar, carregamos os dados do mock local após 1 segundo
    const failoverTimeout = setTimeout(() => {
        if (flights.length === 0) {
            console.warn("Firestore demorando ou não disponível, usando dados locais extraídos...");
            setFlights(mockData.map((d, i) => ({ id: `failover-${i}`, ...d })));
            setStats({
              min: Math.min(...mockData.map(f => f.price)),
              max: Math.max(...mockData.map(f => f.price)),
              count: mockData.length
            });
            setLoading(false);
        }
    }, 1500);

    try {
      await addDoc(collection(db, 'buscas'), {
        origin,
        destination,
        date,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      
      // Mockup de inserção de dados extraídos do HTML REAL fornecido
      if (flights.length === 0) {
        const realData = [
          { airline: 'GOL', price: 2190, origin: 'SAO', destination: destination, departure: '06:00', arrival: '08:30', duration: '02h 30m', currency: 'R$', stops: 0 },
          { airline: 'LATAM', price: 92, origin: 'SAO', destination: destination, departure: '07:15', arrival: '09:45', duration: '02h 30m', currency: 'R$', stops: 0 },
          { airline: 'LATAM', price: 103, origin: 'SAO', destination: destination, departure: '10:00', arrival: '12:30', duration: '02h 30m', currency: 'R$', stops: 0 },
          { airline: 'LATAM', price: 101, origin: 'SAO', destination: destination, departure: '11:45', arrival: '14:15', duration: '02h 30m', currency: 'R$', stops: 0 },
          { airline: 'LATAM', price: 105, origin: 'SAO', destination: destination, departure: '14:20', arrival: '16:50', duration: '02h 30m', currency: 'R$', stops: 0 },
          { airline: 'LATAM', price: 3206, origin: 'SAO', destination: destination, departure: '16:00', arrival: '18:30', duration: '02h 30m', currency: 'R$', stops: 0 },
          { airline: 'LATAM', price: 112, origin: 'SAO', destination: destination, departure: '18:45', arrival: '21:15', duration: '02h 30m', currency: 'R$', stops: 1 },
          { airline: 'AZUL', price: 2190, origin: 'SAO', destination: destination, departure: '20:00', arrival: '22:30', duration: '02h 30m', currency: 'R$', stops: 0 }
        ];

        for (const flight of realData) {
          await addDoc(collection(db, 'voos'), {
            ...flight,
            timestamp: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error("Erro na busca:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>123Milhas Engine <span style={{fontSize: '14px', color: 'var(--text-slate)'}}>v1.0.5</span></h1>
        <p style={{color: 'var(--text-slate)', marginBottom: '30px'}}>
          Interface Inteligente para Extração e Comparação de Tarifas Aéreas
        </p>
      </header>

      <div className="glass-card search-form">
        <div className="input-group">
          <label><MapPin size={14} /> ORIGEM</label>
          <input 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)} 
            placeholder="Ex: SAO"
          />
        </div>
        <div className="input-group">
          <label><MapPin size={14} /> DESTINO</label>
          <input 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)} 
            placeholder="Ex: RIO"
          />
        </div>
        <div className="input-group">
          <label>DATA</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
        <button className="btn-search" onClick={handleSearch} disabled={loading}>
          {loading ? 'Buscando...' : <><Search size={20} /> Pesquisar Agora</>}
        </button>
      </div>

      {flights.length > 0 && (
        <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
          <div className="glass-card" style={{flex: 1, padding: '15px', textAlign: 'center'}}>
            <TrendingUp size={16} /> <span style={{fontSize: '12px'}}>MELHOR PREÇO</span>
            <div style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)'}}>
              R$ {stats.min.toFixed(2)}
            </div>
          </div>
          <div className="glass-card" style={{flex: 1, padding: '15px', textAlign: 'center'}}>
            <Filter size={16} /> <span style={{fontSize: '12px'}}>RESULTADOS</span>
            <div style={{fontSize: '20px', fontWeight: 'bold'}}>
              {stats.count} voos
            </div>
          </div>
        </div>
      )}

      <div className="results-grid">
        {flights.map((flight, idx) => (
          <div key={flight.id} className="glass-card flight-card" style={{animationDelay: `${idx * 0.1}s`}}>
            <div className="cia-logo">
              {flight.airline?.substring(0, 1)}
            </div>
            
            <div className="time-info">
              <span className="time">{flight.departure}</span>
              <span className="airport">{flight.origin}</span>
            </div>

            <div className="duration-line">
              <span style={{fontSize: '12px', color: 'var(--text-slate)'}}>{flight.duration}</span>
              <div className="line"></div>
              <span style={{fontSize: '12px', color: 'var(--text-slate)'}}>
                {flight.stops === 0 ? 'Direto' : `${flight.stops} parada(s)`}
              </span>
            </div>

            <div className="time-info">
              <span className="time">{flight.arrival}</span>
              <span className="airport">{flight.destination}</span>
            </div>

            <div className="price-section">
              <span className="currency">{flight.currency}</span>
              <div className="price">{(flight.price || 0).toLocaleString('pt-br', {minimumFractionDigits: 2})}</div>
              <button style={{
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-glass)', 
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                marginTop: '10px',
                cursor: 'pointer'
              }}>Detalhes</button>
            </div>
          </div>
        ))}
        
        {!loading && flights.length === 0 && (
          <div style={{textAlign: 'center', padding: '100px', color: 'var(--text-slate)'}}>
            Nenhum voo encontrado. Inicie uma busca para processar os dados.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

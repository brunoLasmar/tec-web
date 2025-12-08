'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout';
import Button from '@/app/components/button';

const API_BASE = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'http://100.124.95.109:3333') : 'http://localhost:3333';

interface Game {
  id_jogo: number;
  data_hora: string;
  preco_cartela: any;
  status?: string; 
  id_usuario_vencedor?: number | null;
  id_sala: number;
  PREMIOS?: { valor: any }[]; // Lista de prêmios
  _count?: {
    CARTELA: number;
  };
}

// Função Avançada para Ler Decimais (Cópia da que funciona em rooms/page.tsx)
const formatDecimal = (val: any): number => {
  try {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 0;
    
    // Tratamento específico para o objeto Decimal do Prisma/Library
    if (typeof val === 'object' && val !== null && Array.isArray(val.d)) {
      const sign = val.s || 1;
      const exponent = val.e !== undefined ? val.e : 0;
      let allDigits = '';
      for (let i = 0; i < val.d.length; i++) {
        if (i === 0) {
          allDigits += val.d[i].toString();
        } else {
          allDigits += val.d[i].toString().padStart(7, '0');
        }
      }
      const decimalPosition = exponent + 1;
      let numStr: string;
      if (decimalPosition <= 0) {
        numStr = '0.' + '0'.repeat(-decimalPosition) + allDigits;
      } else if (decimalPosition >= allDigits.length) {
        numStr = allDigits + '0'.repeat(decimalPosition - allDigits.length);
      } else {
        numStr = allDigits.slice(0, decimalPosition) + '.' + allDigits.slice(decimalPosition);
      }
      return parseFloat(numStr) * sign;
    }
    
    if (val && val.toString) {
       const s = val.toString();
       if (s !== '[object Object]') return parseFloat(s) || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

export default function RoomGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;

  useEffect(() => {
    fetchGames();
  }, [roomId]);

  const fetchGames = async () => {
    const token = localStorage.getItem('bingoToken');
    try {
      const res = await fetch(`${API_BASE}/games`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        // Filtra e Atualiza
        const roomGames = data.filter((g: any) => g.id_sala === Number(roomId));
        setGames(roomGames);
      }
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGameStatus = (game: Game) => {
    if (game.status) return game.status;
    if (game.id_usuario_vencedor) return 'FINALIZADO';
    
    const gameDate = new Date(game.data_hora);
    const now = new Date();
    
    if (now >= gameDate) return 'ATIVO';
    return 'AGUARDANDO';
  };

  const handleBuyCard = async (gameId: number) => {
    const token = localStorage.getItem('bingoToken');
    if (!token) {
      alert('Você precisa estar logado para comprar cartelas.');
      router.push('/login');
      return;
    }

    if (!confirm('Deseja comprar 1 cartela para este jogo?')) return;

    setBuyingId(gameId);

    try {
      const response = await fetch(`${API_BASE}/games/buy-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_jogo: gameId,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Cartela comprada com sucesso! 🎟️');
        fetchGames();
      } else {
        const errorData = await response.json();
        alert(`Erro na compra: ${errorData.message}`);
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setBuyingId(null);
    }
  };

  const handleEnterGame = (gameId: number) => {
    router.push(`/games/${gameId}`);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="loading" style={{textAlign: 'center', padding: '3rem', color: '#1B6F09'}}>
            Carregando jogos...
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="games-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/rooms')}
            className="back-button"
          >
            ← Voltar para Salas
          </Button>
          <h1 className="page-title" style={{ color: '#1B6F09', fontSize: '2rem', margin: 0 }}>
            Jogos da Sala #{roomId}
          </h1>
          <div style={{ width: '100px' }}></div>
        </div>

        <div className="games-grid">
          {games.map((game) => {
            const status = getGameStatus(game);
            
            // Usando a formatação robusta
            const preco = formatDecimal(game.preco_cartela);
            
            // Calculando total de prêmios com segurança
            const totalPremios = game.PREMIOS 
                ? game.PREMIOS.reduce((acc, p) => acc + formatDecimal(p.valor), 0)
                : 0;

            const badgeBg = status === 'AGUARDANDO' ? '#E2F67E' : (status === 'ATIVO' ? '#ffffff' : '#ffcccc');
            const badgeColor = status === 'AGUARDANDO' ? '#1B6F09' : (status === 'ATIVO' ? '#1B6F09' : '#cc0000');

            return (
              <div key={game.id_jogo} className="game-card">
                <div className="game-info">
                  <h3 style={{ color: '#E2F67E' }}>Jogo #{game.id_jogo}</h3>
                  <div className="game-details">
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className="status-badge" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                        {status}
                      </span>
                    </p>
                    
                    {/* Preço Cartela */}
                    <p style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>
                        <span>Preço da cartela:</span>
                        <span style={{ fontWeight: 'bold', color: '#E2F67E' }}>R$ {preco.toFixed(2)}</span>
                    </p>

                    {/* Total Prêmios */}
                    <p style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '1.1em' }}>
                        <span>Total em prêmios:</span>
                        <span style={{ fontWeight: 'bold', color: '#ffd700' }}>R$ {totalPremios.toFixed(2)}</span>
                    </p>

                    <p style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
                        📅 {new Date(game.data_hora).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="game-actions">
                  <Button 
                    onClick={() => handleBuyCard(game.id_jogo)}
                    disabled={buyingId === game.id_jogo}
                    className="buy-button"
                    style={{ 
                        marginBottom: '10px', 
                        width: '100%', 
                        backgroundColor: '#E2F67E', 
                        color: '#1B6F09', 
                        border: 'none', 
                        fontWeight: 'bold' 
                    }}
                  >
                    {buyingId === game.id_jogo ? 'Comprando...' : 'Comprar Cartela 🎟️'}
                  </Button>

                  <Button 
                    variant="primary"
                    onClick={() => handleEnterGame(game.id_jogo)}
                    className="enter-button"
                    style={{ width: '100%', border: '1px solid white' }}
                  >
                    Entrar no Jogo ▶️
                  </Button>
                </div>
              </div>
            );
          })}

          {games.length === 0 && (
            <div className="no-games" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#666', border: '2px dashed #ccc', borderRadius: '12px' }}>
              <p>Nenhum jogo disponível nesta sala no momento.</p>
            </div>
          )}
        </div>

        <style jsx>{`
          .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }

          .game-card {
            background: linear-gradient(135deg, #1B6F09 0%, #4d7c0f 100%);
            border-radius: 16px;
            padding: 2rem;
            color: white;
            box-shadow: 0 8px 32px rgba(27, 111, 9, 0.3);
            border: 2px solid #E2F67E;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 280px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .game-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(27, 111, 9, 0.4);
          }

          .game-info h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-family: var(--font-baloo-bhaijaan);
            border-bottom: 1px solid rgba(255,255,255,0.2);
            padding-bottom: 10px;
          }

          .game-details p {
            color: white;
            margin: 0.5rem 0;
            font-size: 1rem;
          }

          .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
          }
        `}</style>
      </div>
    </UserLayout>
  );
}
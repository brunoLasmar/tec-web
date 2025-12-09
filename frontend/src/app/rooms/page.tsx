'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '../components/UserLayout';
import Button from '../components/button';

const API_BASE = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'http://100.124.95.109:3333') : 'http://localhost:3333';

interface Room {
  id_sala: number;
  nome: string;
  descricao?: string;
  jogadores_ativos?: number;
  capacidade_maxima?: number;
  totalPrizes?: number;
}

interface Game {
  id_jogo: number;
  id_sala: number;
  data_hora: string;
  status?: string;
  id_usuario_vencedor?: number | null;
  PREMIOS?: { valor: any }[];
}

// Função de formatação para lidar com decimais do Prisma
const formatDecimal = (val: any): number => {
  try {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 0;
    if (val && typeof val === 'object' && val.toString) {
      // Tenta converter objeto Decimal para string e depois float
      const s = val.toString();
      return s !== '[object Object]' ? parseFloat(s) || 0 : 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

// Lógica de status unificada com o Admin
const getGameStatus = (game: Game) => {
    if (game.status) return game.status;
    if (game.id_usuario_vencedor) return 'FINALIZADO';
    const gameDate = new Date(game.data_hora);
    const now = new Date();
    if (now >= gameDate) return 'ATIVO';
    return 'AGUARDANDO';
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('bingoToken');
      if (!token) return router.push('/login');

      try {
        setError(null);
        
        // 1. Busca Salas e Jogos (com no-store para evitar cache velho)
        const [roomsRes, gamesRes] = await Promise.all([
          fetch(`${API_BASE}/rooms`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }),
          fetch(`${API_BASE}/games`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
        ]);

        if (roomsRes.ok && gamesRes.ok) {
          const roomsData: Room[] = await roomsRes.json();
          const gamesData: Game[] = await gamesRes.json();

          console.log("DEBUG - Jogos recebidos:", gamesData); // <--- OLHE NO CONSOLE (F12)

          const prizesByRoom: { [key: number]: number } = {};

          gamesData.forEach(game => {
             const status = getGameStatus(game);
             // Apenas soma se o jogo estiver "vivo"
             if (status === 'AGUARDANDO' || status === 'ATIVO') {
                 // Verifica se PREMIOS existe antes de reduzir
                 const premios = game.PREMIOS || [];
                 const totalGamePrizes = premios.reduce((sum, p) => sum + formatDecimal(p.valor), 0);
                 
                 if (!prizesByRoom[game.id_sala]) prizesByRoom[game.id_sala] = 0;
                 prizesByRoom[game.id_sala] += totalGamePrizes;
             }
          });

          console.log("DEBUG - Prêmios por sala:", prizesByRoom); // <--- OLHE NO CONSOLE (F12)

          const enrichedRooms = roomsData.map(room => ({
            ...room,
            totalPrizes: prizesByRoom[room.id_sala] || 0
          }));

          setRooms(enrichedRooms);
        } else {
          throw new Error('Falha ao carregar dados.');
        }
      } catch (error) {
        console.error('Erro:', error);
        setError('Não foi possível carregar as salas.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const enterRoom = (roomId: number) => {
    router.push(`/rooms/${roomId}/games`);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="loading" style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#1B6F09' }}>
          Carregando salas...
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="rooms-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="rooms-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="title" style={{ color: '#1B6F09', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Salas de Bingo Disponíveis
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Escolha uma sala para ver os jogos disponíveis
          </p>
        </div>

        {error && (
          <div style={{ 
            color: 'red', textAlign: 'center', marginBottom: '20px', padding: '15px',
            backgroundColor: '#ffe6e6', borderRadius: '8px', border: '1px solid #ffcccc'
          }}>
            {error}
          </div>
        )}

        <div className="rooms-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {rooms.map(room => (
            <div 
              key={room.id_sala} 
              className="room-card"
              style={{
                background: 'linear-gradient(135deg, #1B6F09 0%, #4d7c0f 100%)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(27, 111, 9, 0.3)',
                border: '2px solid #E2F67E',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '250px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => enterRoom(room.id_sala)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(27, 111, 9, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(27, 111, 9, 0.3)';
              }}
            >
              <div className="room-header" style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  color: '#E2F67E', 
                  fontSize: '1.5rem',
                  margin: '0 0 0.5rem 0',
                  fontFamily: 'var(--font-baloo-bhaijaan)'
                }}>
                  {room.nome}
                </h3>
              </div>

              {room.descricao && (
                <p style={{ 
                  color: '#E2F67E', 
                  margin: '0 0 1.5rem 0',
                  lineHeight: '1.5',
                  opacity: '0.9'
                }}>
                  {room.descricao}
                </p>
              )}

              <div className="room-stats" style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#E2F67E', fontWeight: '600' }}>Jogadores:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>
                    {room.jogadores_ativos || 0}/{room.capacidade_maxima || '∞'}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ color: '#E2F67E', fontWeight: '600' }}>Prêmios na Sala:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>
                    R$ {(room.totalPrizes || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  enterRoom(room.id_sala);
                }}
                style={{ 
                  width: '100%',
                  marginTop: 'auto'
                }}
              >
                Ver Jogos da Sala
              </Button>
            </div>
          ))}
        </div>

        {rooms.length === 0 && !loading && !error && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginTop: '3rem',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px dashed #E2F67E'
          }}>
            <h3 style={{ color: '#1B6F09', marginBottom: '1rem' }}>
              Nenhuma sala disponível no momento
            </h3>
            <p>Volte mais tarde para conferir novas salas!</p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
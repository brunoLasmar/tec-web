'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

interface Prize {
  id_premio: number;
  descricao: string;
  valor: any;
  id_jogo: number;
  JOGO?: { id_jogo: number; data_hora: string; SALA?: { nome: string } };
  USUARIO?: { nome: string; email: string };
}

interface Game {
  id_jogo: number;
  id_sala: number;
  data_hora: string;
  SALA?: { nome: string };
}

export default function AdminPrizesPage() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [gameId, setGameId] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('bingoToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    setLoading(true);
    try {
      // 1. Busca Prêmios
      const prizesRes = await fetch(`${API_BASE}/prizes`, { 
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
      });
      if (prizesRes.ok) setPrizes(await prizesRes.json());

      // 2. Busca Jogos (para o select de criação)
      const gamesRes = await fetch(`${API_BASE}/games`, { 
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
      });
      if (gamesRes.ok) setGames(await gamesRes.json());

    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('bingoToken');

    if (!gameId) {
        alert("Selecione um jogo!");
        return;
    }

    try {
      const res = await fetch(`${API_BASE}/prizes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: desc,
          valor: parseFloat(valor),
          id_jogo: parseInt(gameId),
        })
      });

      if (res.ok) {
        alert('Prêmio criado! 🏆');
        setDesc('');
        setValor('');
        setGameId('');
        fetchData(); 
      } else {
        const err = await res.json();
        alert(`Erro: ${err.message}`);
      }
    } catch (error) {
      alert('Erro de conexão ao criar prêmio.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este prêmio?')) return;
    const token = localStorage.getItem('bingoToken');
    
    try {
        const res = await fetch(`${API_BASE}/prizes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchData();
        else alert('Erro ao excluir.');
    } catch (e) { alert('Erro de rede.'); }
  };

  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  if (loading) return <div style={{padding:'20px', color:'white'}}>Carregando...</div>;

  return (
    <div className="page-container">
      {/* HEADER PADRONIZADO */}
      <header>
        <nav className="navbar">
            <div className="navbar-content" style={{ width: "100%" }}>
                <img src="/bingo-logo.png" alt="logo" className="navbar-logo" />
                <div className="navbar-links">
                    <a className="nav-links">Gerenciar Prêmios</a>
                </div>
                <div style={{ marginLeft: "auto", paddingRight: "40px", display: 'flex', gap: '10px' }}>
                    <Button variant="primary" onClick={() => router.push('/admin')}>
                        Voltar ao Painel
                    </Button>
                    <Button variant="primary" onClick={() => {
                        localStorage.removeItem('bingoToken');
                        window.location.href = '/login';
                    }}>
                        Sair
                    </Button>
                </div>
            </div>
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        <h1 className="title">Gerenciar Prêmios</h1>

        {/* CARD DE FORMULÁRIO */}
        <div style={{ 
            backgroundColor: '#2d5016', padding: '25px', borderRadius: '12px', 
            border: '2px solid #4a752c', marginBottom: '30px', color: 'white',
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Novo Prêmio</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Descrição</label>
              <input 
                type="text" 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                placeholder="Ex: Bicicleta" 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Valor (R$)</label>
              <input 
                type="number" step="0.01" 
                value={valor} 
                onChange={e => setValor(e.target.value)} 
                placeholder="0.00" 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Jogo Alvo</label>
              <select 
                value={gameId} 
                onChange={e => setGameId(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}
              >
                <option value="">Selecione...</option>
                {games.map(g => (
                    <option key={g.id_jogo} value={g.id_jogo}>
                        Jogo #{g.id_jogo} ({g.SALA?.nome || `Sala ${g.id_sala}`}) - {new Date(g.data_hora).toLocaleDateString()}
                    </option>
                ))}
              </select>
            </div>
            <div>
                <Button type="submit" style={{ width: '100%', height: '40px', backgroundColor: '#a855f7' }}>Adicionar prêmio</Button>
            </div>
          </form>
        </div>

        {/* TABELA DE PRÊMIOS */}
        <div style={{ backgroundColor: '#1a3d0f', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                <tr style={{ borderBottom: '2px solid #4a752c', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Descrição</th>
                    <th style={{ padding: '12px' }}>Valor</th>
                    <th style={{ padding: '12px' }}>Jogo</th>
                    <th style={{ padding: '12px' }}>Ganhador</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                </tr>
                </thead>
                <tbody>
                {prizes.map(prize => (
                    <tr key={prize.id_premio} style={{ borderBottom: '1px solid #2d7a2d' }}>
                    <td style={{ padding: '12px' }}>#{prize.id_premio}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{prize.descricao}</td>
                    <td style={{ padding: '12px', color: '#90ee90' }}>R$ {formatCurrency(prize.valor)}</td>
                    <td style={{ padding: '12px' }}>
                        {prize.JOGO ? `Jogo #${prize.id_jogo}` : <span style={{color:'red'}}>Sem Jogo</span>}
                    </td>
                    <td style={{ padding: '12px' }}>
                        {prize.USUARIO ? (
                            <span style={{ color: '#ffd700', fontWeight: 'bold' }}>🏆 {prize.USUARIO.nome}</span>
                        ) : (
                            <span style={{ color: '#ccc' }}>Em aberto</span>
                        )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                            onClick={() => handleDelete(prize.id_premio)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                            title="Excluir"
                        >
                            🗑️
                        </button>
                    </td>
                    </tr>
                ))}
                {prizes.length === 0 && (
                    <tr>
                        <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#ccc' }}>
                            Nenhum prêmio cadastrado.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
      </main>
    </div>
  );
}
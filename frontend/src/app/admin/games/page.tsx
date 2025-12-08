'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

interface Game {
  id_jogo: number;
  id_sala: number;
  data_hora: string;
  preco_cartela: any;
  sala_nome?: string;
  status?: string;
  SALA?: { nome: string };
  _count?: { CARTELA: number };
}

interface Room {
  id_sala: number;
  nome: string;
}

export default function GamesAdminPage() {
  const router = useRouter();
  
  // --- Estados ---
  const [games, setGames] = useState<Game[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Modal ---
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    id_sala: '',
    data_hora: '',
    preco_cartela: ''
  });

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
      // Busca Salas
      const roomsRes = await fetch(`${API_BASE}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (roomsRes.ok) setRooms(await roomsRes.json());

      // Busca Jogos
      const gamesRes = await fetch(`${API_BASE}/games`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setGames(gamesData);
      } else {
        console.error("Erro ao buscar jogos:", gamesRes.status);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;
    const token = localStorage.getItem('bingoToken');

    try {
      const res = await fetch(`${API_BASE}/games/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Jogo excluído com sucesso.');
        fetchData();
      } else {
        const err = await res.json();
        alert(`Erro: ${err.message}`);
      }
    } catch (e) { alert('Erro de rede.'); }
  };

  const handleStartGame = async (id: number) => {
    const token = localStorage.getItem('bingoToken');
    if (!confirm('Iniciar o sorteio deste jogo agora?')) return;

    try {
        const res = await fetch(`${API_BASE}/games/${id}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) alert('Sorteio iniciado! ⚡');
        else alert('Erro ao iniciar sorteio.');
    } catch (e) { alert('Erro de conexão.'); }
  };

  const openCreateModal = () => {
    setEditingGame(null);
    setFormData({ id_sala: '', data_hora: '', preco_cartela: '' });
    setShowForm(true);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    const dateObj = new Date(game.data_hora);
    const offset = dateObj.getTimezoneOffset() * 60000;
    const localIso = new Date(dateObj.getTime() - offset).toISOString().slice(0, 16);

    setFormData({
      id_sala: game.id_sala.toString(),
      data_hora: localIso,
      preco_cartela: Number(game.preco_cartela).toFixed(2)
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('bingoToken');
    
    const url = editingGame 
      ? `${API_BASE}/games/${editingGame.id_jogo}` 
      : `${API_BASE}/games`;
    
    const method = editingGame ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_sala: parseInt(formData.id_sala),
          data_hora: new Date(formData.data_hora).toISOString(),
          preco_cartela: parseFloat(formData.preco_cartela)
        })
      });

      if (res.ok) {
        alert(editingGame ? 'Jogo atualizado!' : 'Jogo criado!');
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Erro: ${err.message}`);
      }
    } catch (e) { alert('Erro de conexão ao salvar.'); }
  };

  if (loading) return <div style={{padding: '20px', color: 'white'}}>Carregando sistema...</div>;

  return (
    <div className="page-container">
      {/* HEADER IGUAL AO ADMIN/ROOMS */}
      <header>
        <nav className="navbar">
            <div className="navbar-content" style={{ width: "100%" }}>
                <img src="/bingo-logo.png" alt="logo" className="navbar-logo" />
                <div className="navbar-links">
                    <a className="nav-links">Gerenciar Jogos</a>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 className="title">Lista de Jogos</h1>
            <Button onClick={openCreateModal} style={{ backgroundColor: '#22c55e' }}>
                + Novo Jogo
            </Button>
        </div>

        {/* TABELA DE JOGOS */}
        <div style={{ backgroundColor: '#1a3d0f', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #4a752c', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Sala</th>
                        <th style={{ padding: '12px' }}>Data / Hora</th>
                        <th style={{ padding: '12px' }}>Preço</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Vendas</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map(game => (
                        <tr key={game.id_jogo} style={{ borderBottom: '1px solid #2d7a2d' }}>
                            <td style={{ padding: '12px' }}>#{game.id_jogo}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold', color: '#90ee90' }}>
                                {game.SALA?.nome || rooms.find(r => r.id_sala === game.id_sala)?.nome || `Sala ${game.id_sala}`}
                            </td>
                            <td style={{ padding: '12px' }}>{new Date(game.data_hora).toLocaleString()}</td>
                            <td style={{ padding: '12px' }}>R$ {Number(game.preco_cartela).toFixed(2)}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    backgroundColor: game.status === 'AGUARDANDO' ? '#eab308' : '#22c55e',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                }}>
                                    {game.status || 'Ativo'}
                                </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{game._count?.CARTELA || 0}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => handleStartGame(game.id_jogo)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Iniciar"
                                    >▶️</button>
                                    <button 
                                        onClick={() => openEditModal(game)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Editar"
                                    >✏️</button>
                                    <button 
                                        onClick={() => handleDelete(game.id_jogo)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Excluir"
                                    >🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {games.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#ccc' }}>
                                Nenhum jogo cadastrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* MODAL */}
        {showForm && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: '#2d5016', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px',
                    border: '2px solid #4a752c', boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
                }}>
                    <h2 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
                        {editingGame ? 'Editar Jogo' : 'Criar Novo Jogo'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>Sala Vinculada</label>
                            <select 
                                value={formData.id_sala} 
                                onChange={e => setFormData({...formData, id_sala: e.target.value})}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}
                            >
                                <option value="">Selecione uma sala...</option>
                                {rooms.map(r => (
                                    <option key={r.id_sala} value={r.id_sala}>{r.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>Data e Hora</label>
                            <input 
                                type="datetime-local" 
                                value={formData.data_hora} 
                                onChange={e => setFormData({...formData, data_hora: e.target.value})}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>Preço (R$)</label>
                            <input 
                                type="number" step="0.01" min="0"
                                value={formData.preco_cartela} 
                                onChange={e => setFormData({...formData, preco_cartela: e.target.value})}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button type="submit">{editingGame ? 'Salvar' : 'Criar'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
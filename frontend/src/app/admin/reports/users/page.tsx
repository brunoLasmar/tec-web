'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

interface ReportData {
  titulo: string;
  geradoEm: string;
  resumo: {
    hora: number | null;
    partidasNesseHorario: number;
    totalPartidas: number;
    taxaVitoria: number | null;
  };
  jogos: {
    id: number;
    dataHora: string;
    sala: string;
    precoCartela: number;
  }[];
}

export default function AdminReportsUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');

  // Busca inicial (Global)
  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async (userId?: string) => {
    const token = localStorage.getItem('bingoToken');
    if (!token) return router.push('/login');

    setLoading(true);
    try {
      // Se tiver userId, adiciona na query string
      const query = userId ? `?userId=${userId}` : '';
      const res = await fetch(`${API_BASE}/reports/relatorio1${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const err = await res.json();
        alert(`Erro: ${err.message || 'Falha ao buscar relatório'}`);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(searchUserId);
  };

  return (
    <div className="page-container">
      
      {/* HEADER PADRONIZADO */}
      <header>
        <nav className="navbar">
            <div className="navbar-content" style={{ width: "100%" }}>
                <img src="/bingo-logo.png" alt="logo" className="navbar-logo" />
                <div className="navbar-links">
                    <a className="nav-links">Relatórios de Jogadores</a>
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

      {/* CONTEÚDO */}
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* BARRA DE PESQUISA */}
        <div style={{ 
            backgroundColor: '#1a5f1a', padding: '20px', borderRadius: '12px', 
            border: '2px solid #2d7a2d', marginBottom: '30px', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
        }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#E2F67E' }}>
                    {data?.titulo || 'Relatório de Desempenho'}
                </h1>
                <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
                    Gerado em: {data?.geradoEm ? new Date(data.geradoEm).toLocaleString() : '-'}
                </p>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="number" 
                    placeholder="ID do Usuário (Opcional)" 
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    style={{ 
                        padding: '10px', borderRadius: '6px', border: 'none', width: '200px' 
                    }}
                />
                <Button type="submit" style={{ backgroundColor: '#0ea5e9' }}>
                    🔍 Pesquisar
                </Button>
                {searchUserId && (
                    <Button type="button" variant="secondary" onClick={() => { setSearchUserId(''); fetchReport(); }}>
                        Limpar
                    </Button>
                )}
            </form>
        </div>

        {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>Carregando dados...</div>
        ) : (
            <>
                {/* CARDS DE ESTATÍSTICAS */}
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '20px', marginBottom: '30px' 
                }}>
                    <div style={{ backgroundColor: '#1a3d0f', padding: '20px', borderRadius: '10px', border: '1px solid #2d7a2d', textAlign: 'center', color: 'white' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#ccc' }}>Total de Partidas</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#E2F67E' }}>
                            {data?.resumo.totalPartidas || 0}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#1a3d0f', padding: '20px', borderRadius: '10px', border: '1px solid #2d7a2d', textAlign: 'center', color: 'white' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#ccc' }}>Horário Favorito</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#60a5fa' }}>
                            {data?.resumo.hora !== null ? `${data?.resumo.hora}h` : '-'}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#1a3d0f', padding: '20px', borderRadius: '10px', border: '1px solid #2d7a2d', textAlign: 'center', color: 'white' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#ccc' }}>Taxa de Vitória</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#4ade80' }}>
                            {data?.resumo.taxaVitoria !== null ? `${data?.resumo.taxaVitoria.toFixed(1)}%` : '-'}
                        </p>
                    </div>
                </div>

                {/* TABELA DE HISTÓRICO */}
                <div style={{ backgroundColor: '#1a3d0f', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', overflowX: 'auto' }}>
                    <h3 style={{ color: 'white', borderBottom: '1px solid #2d7a2d', paddingBottom: '15px', marginBottom: '15px' }}>
                        Histórico Recente (Últimos 50)
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #4a752c', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>ID Jogo</th>
                                <th style={{ padding: '12px' }}>Data / Hora</th>
                                <th style={{ padding: '12px' }}>Sala</th>
                                <th style={{ padding: '12px' }}>Preço Cartela</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.jogos.map((jogo) => (
                                <tr key={jogo.id} style={{ borderBottom: '1px solid #2d7a2d' }}>
                                    <td style={{ padding: '12px', color: '#ccc' }}>#{jogo.id}</td>
                                    <td style={{ padding: '12px' }}>{new Date(jogo.dataHora).toLocaleString()}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#E2F67E' }}>{jogo.sala}</td>
                                    <td style={{ padding: '12px' }}>R$ {jogo.precoCartela.toFixed(2)}</td>
                                </tr>
                            ))}
                            {(!data?.jogos || data.jogos.length === 0) && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        )}
      </main>
    </div>
  );
}
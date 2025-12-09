'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

interface RoomMetric {
  id: number;
  nome: string;
  jogadores: number;
  jogosHoje: number;
}

interface ReportData {
  titulo: string;
  geradoEm: string;
  salas: RoomMetric[];
}

export default function AdminReportsRoomsPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch(`${API_BASE}/reports/relatorio2`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        console.error("Erro ao buscar relatório");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding:'20px', color:'white'}}>Carregando métricas...</div>;

  return (
    <div className="page-container">
      
      {/* HEADER PADRONIZADO ADMIN (Igual ao Dashboard) */}
      <header>
        <nav className="navbar">
            <div className="navbar-content" style={{ width: "100%" }}>
                <img src="/bingo-logo.png" alt="logo" className="navbar-logo" />
                <div className="navbar-links">
                    <a className="nav-links">Relatórios Administrativos</a>
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '20px' }}>
            <div>
                <h1 className="title" style={{ color: '#E2F67E', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {data?.titulo || 'Métricas por Sala'}
                </h1>
                <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    Gerado em: {data?.geradoEm ? new Date(data.geradoEm).toLocaleString() : '-'}
                </p>
            </div>
            <Button onClick={fetchData} style={{ backgroundColor: '#0ea5e9' }}>
                🔄 Atualizar
            </Button>
        </div>

        {/* TABELA PADRÃO VERDE (Igual Admin Games) */}
        <div style={{ backgroundColor: '#1a3d0f', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #4a752c', textAlign: 'left' }}>
                        <th style={{ padding: '15px' }}>ID Sala</th>
                        <th style={{ padding: '15px' }}>Nome da Sala</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Jogadores Únicos</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Jogos Hoje</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.salas.map((sala) => (
                        <tr key={sala.id} style={{ borderBottom: '1px solid #2d7a2d' }}>
                            <td style={{ padding: '15px', color: '#ccc' }}>#{sala.id}</td>
                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{sala.nome}</td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                <span style={{ 
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                                    color: '#60a5fa', 
                                    padding: '4px 12px', 
                                    borderRadius: '20px', 
                                    fontWeight: 'bold', 
                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                    {sala.jogadores}
                                </span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                <span style={{ 
                                    backgroundColor: sala.jogosHoje > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                    color: sala.jogosHoje > 0 ? '#4ade80' : '#cbd5e1',
                                    padding: '4px 12px', 
                                    borderRadius: '20px', 
                                    fontWeight: 'bold',
                                    border: `1px solid ${sala.jogosHoje > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                                }}>
                                    {sala.jogosHoje}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {(!data?.salas || data.salas.length === 0) && (
                        <tr>
                            <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                                Nenhuma sala encontrada.
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
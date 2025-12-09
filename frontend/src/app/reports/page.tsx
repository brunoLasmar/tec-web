'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout';
import styles from './reports.module.css';

const API_BASE = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'http://100.124.95.109:3333') : 'http://localhost:3333';

// Tipos para Relatório Pessoal
interface PersonalReport {
    resumo: {
        totalPartidas: number;
        taxaVitoria: number | null;
        hora: number | null;
        partidasNesseHorario: number;
        totalPremios: number;
    };
    jogos: {
        id: number;
        dataHora: string;
        sala: string;
        precoCartela: number;
    }[];
}

// Tipos para Relatório de Salas
interface RoomMetric {
    id: number;
    nome: string;
    jogadores: number;
    jogosHoje: number;
}
interface RoomsReport {
    salas: RoomMetric[];
}

export default function UserReportsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'pessoal' | 'salas'>('pessoal');
    const [loading, setLoading] = useState(false);
    
    // Dados
    const [personalData, setPersonalData] = useState<PersonalReport | null>(null);
    const [roomsData, setRoomsData] = useState<RoomsReport | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        const token = localStorage.getItem('bingoToken');
        if (!token) return router.push('/login');

        setLoading(true);
        try {
            if (activeTab === 'pessoal') {
                const res = await fetch(`${API_BASE}/reports/relatorio1`, { 
                    headers: { 'Authorization': `Bearer ${token}` },
                    cache: 'no-store'
                });
                if (res.ok) setPersonalData(await res.json());
            } else {
                const res = await fetch(`${API_BASE}/reports/relatorio2`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    cache: 'no-store'
                });
                if (res.ok) setRoomsData(await res.json());
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <UserLayout>
            <div className={styles.reportsMainContent} style={{ background: 'transparent' }}>
                <div className={styles.reportsContainer}>

                    <div className={styles.reportsHeader}>
                        {/* TÍTULO CORRIGIDO PARA O VERDE PADRÃO */}
                        <h1 style={{ color: '#1B6F09', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Central de Relatórios</h1>
                        
                        {/* TOGGLE DE NAVEGAÇÃO */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                            <button 
                                onClick={() => setActiveTab('pessoal')}
                                style={{
                                    padding: '10px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                    backgroundColor: activeTab === 'pessoal' ? '#E2F67E' : 'rgba(255,255,255,0.2)',
                                    color: activeTab === 'pessoal' ? '#1B6F09' : 'white',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                👤 Meu Desempenho
                            </button>
                            <button 
                                onClick={() => setActiveTab('salas')}
                                style={{
                                    padding: '10px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                    backgroundColor: activeTab === 'salas' ? '#E2F67E' : 'rgba(255,255,255,0.2)',
                                    color: activeTab === 'salas' ? '#1B6F09' : 'white',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                🏢 Métricas das Salas
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>Carregando dados...</div>
                    ) : (
                        <div className={styles.reportsGrid}>
                            
                            {/* --- ABA PESSOAL --- */}
                            {activeTab === 'pessoal' && personalData && (
                                <>
                                    {/* Card Estatísticas */}
                                    <div className={styles.reportCard}>
                                        <div className={styles.reportCardHeader}>
                                            <h2 className={styles.reportCardTitle}>Minhas Estatísticas</h2>
                                        </div>
                                        <div className={styles.reportCardContent}>
                                            <div className={styles.statsGrid}>
                                                
                                                {/* Total de Partidas */}
                                                <div className={styles.statItem}>
                                                    <div className={styles.statValue}>{personalData.resumo.totalPartidas}</div>
                                                    <div className={styles.statLabel}>Partidas Jogadas</div>
                                                </div>
                                                
                                                {/* Taxa de Vitória */}
                                                <div className={styles.statItem}>
                                                    <div className={styles.statValue}>
                                                        {personalData.resumo.taxaVitoria?.toFixed(1) || 0}%
                                                    </div>
                                                    <div className={styles.statLabel}>Taxa de Vitória</div>
                                                </div>

                                                {/* Total em Prêmios */}
                                                <div className={styles.statItem}>
                                                    <div className={styles.statValue} style={{color: '#15803d'}}>
                                                        {formatCurrency(personalData.resumo.totalPremios || 0)}
                                                    </div>
                                                    <div className={styles.statLabel}>Total em Prêmios</div>
                                                </div>

                                                {/* Horário Favorito */}
                                                <div className={styles.statItem}>
                                                    <div className={styles.statValue}>
                                                        {personalData.resumo.hora !== null ? `${personalData.resumo.hora}h` : '-'}
                                                    </div>
                                                    <div className={styles.statLabel}>Horário Favorito</div>
                                                </div>

                                                {/* Partidas no Horário */}
                                                <div className={styles.statItem}>
                                                    <div className={styles.statValue}>
                                                        {personalData.resumo.partidasNesseHorario || 0}
                                                    </div>
                                                    <div className={styles.statLabel}>Jogos neste horário</div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Histórico */}
                                    <div className={styles.reportCard} style={{ gridColumn: 'span 1' }}>
                                        <div className={styles.reportCardHeader}>
                                            <h2 className={styles.reportCardTitle}>Meu Histórico (Recente)</h2>
                                        </div>
                                        <div className={styles.reportCardContent}>
                                            <div className={styles.timeline}>
                                                {personalData.jogos.length === 0 && <p style={{textAlign:'center', color:'#666'}}>Sem histórico.</p>}
                                                {personalData.jogos.map(jogo => (
                                                    <div key={jogo.id} className={styles.timelineItem}>
                                                        <div className={styles.timelineDot} />
                                                        <div className={styles.timelineContent}>
                                                            <div className={styles.timelineTime}>
                                                                {new Date(jogo.dataHora).toLocaleString()}
                                                            </div>
                                                            <div className={styles.timelineEvent}>
                                                                {jogo.sala}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#666' }}>
                                                                Custo: {formatCurrency(jogo.precoCartela)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- ABA SALAS --- */}
                            {activeTab === 'salas' && roomsData && (
                                <div className={styles.reportCard} style={{ gridColumn: '1 / -1' }}>
                                    <div className={styles.reportCardHeader}>
                                        <h2 className={styles.reportCardTitle}>Ocupação das Salas (Tempo Real)</h2>
                                    </div>
                                    <div className={styles.reportCardContent}>
                                        <table className={styles.numbersTable}>
                                            <thead>
                                                <tr>
                                                    <th>Sala</th>
                                                    <th>Jogadores Únicos</th>
                                                    <th>Jogos Hoje</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {roomsData.salas.map(sala => (
                                                    <tr key={sala.id}>
                                                        <td style={{fontWeight: 'bold', color: 'var(--primary-green)'}}>{sala.nome}</td>
                                                        <td>{sala.jogadores}</td>
                                                        <td>{sala.jogosHoje}</td>
                                                    </tr>
                                                ))}
                                                {roomsData.salas.length === 0 && <tr><td colSpan={3} style={{textAlign:'center'}}>Sem dados.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    <div className={styles.reportsActions}>
                        <button
                            className={`${styles.exportButton} ${styles.exportButtonSecondary}`}
                            onClick={() => router.push('/rooms')}
                        >
                            ← Voltar para Salas
                        </button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
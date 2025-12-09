'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout';
import Button from '@/app/components/button';
import styles from './reports.module.css';

const API_BASE = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'http://100.124.95.109:3333') : 'http://localhost:3333';

interface Statistic {
    id: string;
    label: string;
    value: number | string;
    change?: string;
}

// Interfaces para os dados que vêm do Backend
interface BackendReport {
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

interface NumberDistribution {
    range: string;
    count: number;
    percentage: number;
}

interface GameSession {
    id: string;
    date: string;
    time: string;
    players: number | string; // Adaptado para exibir "-" se não tiver info
    winner: string;
    prize: number;
    numbersCalled: number | string;
    duration: string;
}

export default function ReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DOS DADOS ---
    const [statistics, setStatistics] = useState<Statistic[]>([
        { id: '1', label: 'Partidas Jogadas', value: '-', change: '' },
        { id: '2', label: 'Horário Favorito', value: '-', change: '' },
        { id: '3', label: 'Prêmios (Simulado)', value: 'R$ -', change: '' }, // Backend ainda não manda total ganho
        { id: '4', label: 'Média/Partida', value: 'R$ -', change: '' },
        { id: '5', label: 'Taxa de Vitória', value: '-', change: '' },
        { id: '6', label: 'Números Sorteados', value: '-', change: '' },
    ]);

    const [gameSessions, setGameSessions] = useState<GameSession[]>([]);

    // --- DADOS ESTÁTICOS (O Backend ainda não fornece estes cálculos) ---
    const [numberDistribution] = useState<NumberDistribution[]>([
        { range: '1-15 (B)', count: 42, percentage: 17.5 },
        { range: '16-30 (I)', count: 38, percentage: 15.8 },
        { range: '31-45 (N)', count: 36, percentage: 15.0 },
        { range: '46-60 (G)', count: 39, percentage: 16.3 },
        { range: '61-75 (O)', count: 45, percentage: 18.8 },
    ]);

    const [mostFrequentNumbers] = useState<{ number: number; count: number }[]>([
        { number: 7, count: 28 }, { number: 15, count: 26 }, { number: 32, count: 25 },
        { number: 48, count: 24 }, { number: 67, count: 23 },
    ]);

    const [leastFrequentNumbers] = useState<{ number: number; count: number }[]>([
        { number: 1, count: 12 }, { number: 20, count: 13 }, { number: 35, count: 14 },
        { number: 59, count: 15 }, { number: 74, count: 16 },
    ]);

    // --- BUSCA DE DADOS REAIS ---
    useEffect(() => {
        const fetchReport = async () => {
            const token = localStorage.getItem('bingoToken');
            if (!token) return router.push('/login');

            try {
                const res = await fetch(`${API_BASE}/reports/relatorio1`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    cache: 'no-store'
                });

                if (res.ok) {
                    const data: BackendReport = await res.json();
                    
                    // 1. Atualiza Estatísticas Gerais com dados do Resumo
                    setStatistics([
                        { id: '1', label: 'Partidas Jogadas', value: data.resumo.totalPartidas, change: '' },
                        { id: '2', label: 'Horário Favorito', value: data.resumo.hora !== null ? `${data.resumo.hora}:00h` : '-', change: '' },
                        { id: '3', label: 'Prêmios', value: 'R$ --', change: 'Em breve' }, // Backend precisa evoluir para mandar isso
                        { id: '4', label: 'Partidas neste Horário', value: data.resumo.partidasNesseHorario, change: '' },
                        { id: '5', label: 'Taxa de Vitória', value: data.resumo.taxaVitoria !== null ? `${data.resumo.taxaVitoria.toFixed(1)}%` : '0%', change: '' },
                        { id: '6', label: 'Jogos Listados', value: data.jogos.length, change: '' },
                    ]);

                    // 2. Atualiza Histórico com a lista de Jogos
                    const mappedSessions: GameSession[] = data.jogos.map(jogo => {
                        const dataObj = new Date(jogo.dataHora);
                        return {
                            id: jogo.id.toString(),
                            date: dataObj.toLocaleDateString('pt-BR'),
                            time: dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
                            players: '-', // Backend relatorio1 ainda não manda count de players
                            winner: '-',  // Backend relatorio1 ainda não manda vencedor
                            prize: jogo.precoCartela, // Usando preço como placeholder de valor financeiro do jogo
                            numbersCalled: '-',
                            duration: '-'
                        };
                    });
                    setGameSessions(mappedSessions);

                } else {
                    console.error("Erro ao buscar relatório");
                }
            } catch (error) {
                console.error("Erro de conexão", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('bingoToken');
        window.location.href = '/login';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    if (loading) {
        return (
            <UserLayout>
                <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Carregando relatório...</div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className={styles.reportsMainContent} style={{ background: 'transparent' }}>
                <div className={styles.reportsContainer}>

                    <div className={styles.reportsHeader}>
                        <h1 style={{ color: 'white' }}>Relatórios e Estatísticas</h1>
                        <p style={{ color: '#e2e8f0' }}>Análise baseada nos seus dados reais de jogo</p>
                    </div>

                    <div className={styles.reportsGrid}>
                        {/* CARD 1: Estatísticas Gerais (REAIS) */}
                        <div className={styles.reportCard}>
                            <div className={styles.reportCardHeader}>
                                <h2 className={styles.reportCardTitle}>Estatísticas Gerais</h2>
                            </div>
                            <div className={styles.reportCardContent}>
                                <div className={styles.statsGrid}>
                                    {statistics.map(stat => (
                                        <div key={stat.id} className={styles.statItem}>
                                            <div className={styles.statValue}>{stat.value}</div>
                                            <div className={styles.statLabel}>{stat.label}</div>
                                            {stat.change && (
                                                <span style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                                                    {stat.change}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: Histórico Recente (REAL) */}
                        <div className={styles.reportCard} style={{ gridColumn: 'span 1' }}> {/* Ajuste de grid se necessário */}
                            <div className={styles.reportCardHeader}>
                                <h2 className={styles.reportCardTitle}>Histórico de Jogos</h2>
                            </div>
                            <div className={styles.reportCardContent}>
                                {gameSessions.length === 0 ? (
                                    <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>Nenhum jogo encontrado.</p>
                                ) : (
                                    <div className={styles.timeline}>
                                        {gameSessions.map(session => (
                                            <div key={session.id} className={styles.timelineItem}>
                                                <div className={styles.timelineDot} />
                                                <div className={styles.timelineContent}>
                                                    <div className={styles.timelineTime}>
                                                        {session.date} • {session.time}
                                                    </div>
                                                    <div className={styles.timelineEvent}>
                                                        Jogo #{session.id} (Valor Cartela: {formatCurrency(session.prize)})
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: 'var(--secondary-green)' }}>
                                                        Status: Registrado
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CARD 3: Distribuição (MOCK - Aviso Visual) */}
                        <div className={styles.reportCard}>
                            <div className={styles.reportCardHeader}>
                                <h2 className={styles.reportCardTitle}>Distribuição de Números (Global)</h2>
                            </div>
                            <div className={styles.reportCardContent}>
                                <div className={styles.distributionChart}>
                                    {numberDistribution.map(item => (
                                        <div key={item.range} className={styles.chartBar}>
                                            <div className={styles.chartLabel}>{item.range}</div>
                                            <div className={styles.chartBarInner}>
                                                <div
                                                    className={styles.chartBarFill}
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            <div className={styles.chartCount}>{item.count}</div>
                                        </div>
                                    ))}
                                </div>
                                <p style={{fontSize: '0.8rem', textAlign: 'center', marginTop: '10px', color: '#999'}}>* Dados estatísticos globais estimados.</p>
                            </div>
                        </div>

                        {/* CARD 4: Números Frequentes (MOCK) */}
                        <div className={styles.reportCard}>
                            <div className={styles.reportCardHeader}>
                                <h2 className={styles.reportCardTitle}>Números Frequentes (Global)</h2>
                            </div>
                            <div className={styles.reportCardContent}>
                                <h3>Mais Sorteados:</h3>
                                <table className={styles.numbersTable}>
                                    <thead>
                                        <tr>
                                            <th>Número</th>
                                            <th>Frequência Est.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mostFrequentNumbers.map(item => (
                                            <tr key={item.number} className={styles.highlight}>
                                                <td>BINGO-{item.number}</td>
                                                <td>{item.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

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
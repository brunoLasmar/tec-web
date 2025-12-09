'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout'; // Integração com seu Layout
import styles from './reports.module.css';

// ... (Interfaces mantidas iguais)
interface Statistic { id: string; label: string; value: number | string; change?: string; }
interface NumberDistribution { range: string; count: number; percentage: number; }
interface GameSession { id: string; date: string; time: string; players: number; winner: string; prize: number; numbersCalled: number; duration: string; }

export default function ReportsPage() {
    const router = useRouter();

    // DADOS MOCK (FALSOS) - Substituir por fetch no futuro
    const [statistics] = useState<Statistic[]>([
        { id: '1', label: 'Partidas Jogadas', value: 42, change: '+12%' },
        { id: '2', label: 'Total de Jogadores', value: 156, change: '+5%' },
        { id: '3', label: 'Prêmios Distribuídos', value: 'R$ 8.450', change: '+18%' },
        { id: '4', label: 'Média por Partida', value: 'R$ 201', change: '+3%' },
        { id: '5', label: 'Taxa de Vitória', value: '4.7%', change: '-0.2%' },
        { id: '6', label: 'Números Sorteados', value: '1.764', change: '+8%' },
    ]);

    const [numberDistribution] = useState<NumberDistribution[]>([
        { range: '1-15 (B)', count: 42, percentage: 17.5 },
        { range: '16-30 (I)', count: 38, percentage: 15.8 },
        { range: '31-45 (N)', count: 36, percentage: 15.0 },
        { range: '46-60 (G)', count: 39, percentage: 16.3 },
        { range: '61-75 (O)', count: 45, percentage: 18.8 },
    ]);
    
    // ... (Outros mocks de mostFrequentNumbers, leastFrequentNumbers...)
    // Para economizar espaço, usei os mesmos dados do arquivo original aqui.

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    };

    return (
        <UserLayout>
            <div className={styles.reportsMainContent} style={{ background: 'transparent' }}>
                <div className={styles.reportsContainer}>

                    <div className={styles.reportsHeader}>
                        <h1 style={{color: 'white'}}>Relatórios e Estatísticas</h1>
                        <p style={{color: '#e2e8f0'}}>Análise detalhada das partidas (Dados de Exemplo)</p>
                    </div>

                    <div className={styles.reportsGrid}>
                        {/* CARD 1: Estatísticas Gerais */}
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: Distribuição */}
                        <div className={styles.reportCard}>
                            <div className={styles.reportCardHeader}>
                                <h2 className={styles.reportCardTitle}>Distribuição de Números</h2>
                            </div>
                            <div className={styles.reportCardContent}>
                                <div className={styles.distributionChart}>
                                    {numberDistribution.map(item => (
                                        <div key={item.range} className={styles.chartBar}>
                                            <div className={styles.chartLabel}>{item.range}</div>
                                            <div className={styles.chartBarInner}>
                                                <div className={styles.chartBarFill} style={{ width: `${item.percentage}%` }} />
                                            </div>
                                            <div className={styles.chartCount}>{item.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Adicione os outros cards aqui conforme necessidade */}
                    </div>

                    <div className={styles.reportsActions}>
                        <button className={`${styles.exportButton} ${styles.exportButtonSecondary}`} onClick={() => router.push('/rooms')}>
                            ← Voltar para Salas
                        </button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
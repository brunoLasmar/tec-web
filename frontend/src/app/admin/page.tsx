'use client';

import { useEffect, useState } from 'react';
import Button from "@/app/components/button";
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Acessar localStorage apenas no cliente
        const storedToken = localStorage.getItem('bingoToken');
        setToken(storedToken);

        const checkAdmin = async () => {
            if (!storedToken) {
                window.location.href = '/login';
                return;
            }

            try {
                const profileResponse = await fetch('http://localhost:3333/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });

                if (profileResponse.ok) {
                    const userData = await profileResponse.json();
                    if (!userData.is_admin) {
                        window.location.href = '/rooms';
                        return;
                    }
                } else {
                    window.location.href = '/login';
                    return;
                }
            } catch (error) {
                console.error('Erro:', error);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, []);

    const handleNavigation = (path: string) => {
        router.push(`/admin/${path}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('bingoToken');
        window.location.href = '/login';
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="page-container">
            <header>
                <nav className="navbar">
                    <div className="navbar-content" style={{ width: "100%" }}>
                        <img
                            src="/bingo-logo.png"
                            alt="logo"
                            className="navbar-logo"
                        />

                        <div className="navbar-links">
                            <a className="nav-links">Painel de Administração</a>
                        </div>

                        <div style={{ marginLeft: "auto", paddingRight: "40px" }}>
                            <Button variant="primary" onClick={handleLogout}>
                                Sair
                            </Button>
                        </div>
                    </div>
                </nav>
            </header>

            <main style={{ 
                padding: '40px 20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px',
                    width: '100%',
                    maxWidth: '900px'
                }}>
                    {/* CARD USUÁRIOS */}
                    <div style={{
                        backgroundColor: '#1a5f1a',
                        padding: '40px 30px',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        border: '2px solid #2d7a2d',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => handleNavigation('users')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                    }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>
                            👥 Gerenciar Usuários
                        </h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            Visualize, edite e gerencie usuários do sistema
                        </p>
                    </div>

                    {/* CARD SALAS */}
                    <div style={{
                        backgroundColor: '#1a5f1a',
                        padding: '40px 30px',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        border: '2px solid #2d7a2d',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => handleNavigation('rooms')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                    }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>
                            🏠 Gerenciar Salas
                        </h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            Crie, edite e remova salas de bingo
                        </p>
                    </div>

                    {/* CARD JOGOS */}
                    <div style={{
                        backgroundColor: '#1a5f1a',
                        padding: '40px 30px',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        border: '2px solid #2d7a2d',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => handleNavigation('games')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                    }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>
                            🎮 Gerenciar Jogos
                        </h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            Configure e monitore jogos de bingo ativos
                        </p>
                    </div>

                    {/* CARD PRÊMIOS */}
                    <div style={{
                        backgroundColor: '#1a5f1a',
                        padding: '40px 30px',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        border: '2px solid #2d7a2d',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => handleNavigation('prizes')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                    }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>
                            🏆 Gerenciar Prêmios
                        </h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            Defina e gerencie prêmios dos jogos
                        </p>
                    </div>

                    {/* NOVO CARD: RELATÓRIOS (Estilo Igual) */}
                    <div style={{
                        backgroundColor: '#1a5f1a',
                        padding: '40px 30px',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        border: '2px solid #2d7a2d',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => handleNavigation('reports/rooms')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                    }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>
                            📊 Relatórios de Salas
                        </h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            Visualize métricas de salas e ocupação
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
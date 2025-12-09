// app/components/UserLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Button from "./button";
import RechargeCredits from "./RechargeCredits";

interface UserLayoutProps {
  children: React.ReactNode;
}

const API_BASE = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'http://100.124.95.109:3333') : 'http://localhost:3333';

export default function UserLayout({ children }: UserLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const formatDecimal = (val: any): number => {
    try {
      if (typeof val === 'number') {
        return val;
      }
      if (typeof val === 'string') {
        return parseFloat(val) || 0;
      }
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
      return 0;
    } catch (error) {
      console.error('Erro na conversão de decimal:', error);
      return 0;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('bingoToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setUserBalance(formatDecimal(userData.creditos));
        } else {
          throw new Error('Falha ao carregar perfil');
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        localStorage.removeItem('bingoToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleRecharge = async (amount: number) => {
    const token = localStorage.getItem('bingoToken');
    try {
      const response = await fetch(`${API_BASE}/users/me/recharge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        const data = await response.json();
        // A resposta da recarga pode vir em formatos diferentes dependendo do backend
        // Se vier { newBalance: ... } ou { creditos: ... }
        const newCreditos = data.newBalance !== undefined ? data.newBalance : data.creditos;
        setUserBalance(formatDecimal(newCreditos));
        alert(`Créditos recarregados com sucesso! R$ ${amount.toFixed(2)} adicionados à sua conta.`);
      } else {
        alert('Erro ao recarregar créditos.');
      }
    } catch (error) {
      console.error('Erro na recarga:', error);
      alert('Erro ao recarregar créditos.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bingoToken');
    router.push('/login');
  };

  const isActiveRoute = (route: string) => {
    return pathname === route;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header>
        <nav className="navbar">
          <div className="navbar-content">
            <div className="navbar-brand">
              <img
                src="/bingo-logo.png"
                alt="Bingo Online"
                className="navbar-logo"
              />
              <h1 className="navbar-title">Bingo Online</h1>
            </div>

            <div className="navbar-links">
              <a 
                href="/rooms" 
                className={`nav-link ${isActiveRoute('/rooms') ? 'active' : ''}`}
              >
                Salas
              </a>
              <a 
                href="/profile" 
                className={`nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}
              >
                Meu Perfil
              </a>
              <a 
                href="/como-jogar" 
                className={`nav-link ${isActiveRoute('/como-jogar') ? 'active' : ''}`}
              >
                Como Jogar
              </a>
              <a 
                href="/estatisticas" 
                className={`nav-link ${isActiveRoute('/estatisticas') ? 'active' : ''}`}
              >
                Relatórios
              </a>
            </div>

            <div className="navbar-user">
              <div className="user-info">
                <span className="user-name">Olá, {user?.nome}!</span>
                <span className="user-balance">Saldo: R$ {userBalance.toFixed(2)}</span>
              </div>
              <RechargeCredits
                onRecharge={handleRecharge}
                currentBalance={userBalance}
              />
              <Button variant="primary" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
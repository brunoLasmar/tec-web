'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import DicasLateral from '../components/Dica';
import UserLayout from '../components/UserLayout';
import Button from '../components/button';

const Regras = [
  { numero: 1, titulo: 'Escolha uma sala', descricao: 'Selecione a sala com o prêmio que você quer disputar.' },
  { numero: 2, titulo: 'Compre suas cartelas', descricao: 'Escolha pacotes prontos ou monte sua própria cartela.' },
  { numero: 3, titulo: 'Acompanhe o sorteio', descricao: 'As bolas vão sendo sorteadas em tempo real.' },
  { numero: 4, titulo: 'Marque sua cartela', descricao: 'Seus números são destacados automaticamente.' },
  { numero: 5, titulo: 'Grite BINGO! 🎉', descricao: 'Ao completar a cartela, clique no botão "BINGO!".' },
];

export default function InstrucoesBingo() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className="page-container" style={{ padding: '20px 40px' }}>
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="back-button"
          >
            ← Voltar
          </Button>
          {/* TÍTULO CORRIGIDO PARA O VERDE PADRÃO */}
          <h1 className="title" style={{ color: '#1B6F09', marginTop: '20px' }}>Como jogar nosso bingo online?</h1>
          <p style={{ color: '#e2f67e', fontSize: '1.2em' }}>Em poucos passos você pode se divertir e concorrer a prêmios!</p>
        </div>

        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px' }}>
            {Regras.map(r => (
              <div key={r.numero} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1a3d0f', borderRadius: '8px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.3em', color: 'white', margin: 0 }}>{r.numero} - {r.titulo}</p>
                <p style={{ color: '#e2f67e', marginTop: '5px', margin: 0 }}>{r.descricao}</p>
              </div>
            ))}
          </div>
          <div style={{ flexShrink: 0, minWidth: '300px' }}>
            <DicasLateral />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
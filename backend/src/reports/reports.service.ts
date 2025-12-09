import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async relatorio1(user: { sub: number; isAdmin: boolean }, targetUserId?: number) {
    let whereClause: any = {};

    if (user.isAdmin) {
      if (targetUserId) {
        whereClause = { CARTELA: { some: { id_usuario: targetUserId } } };
      } else {
        whereClause = {};
      }
    } else {
      if (targetUserId && targetUserId !== user.sub) {
        throw new Error('Você não tem permissão para ver relatórios de outros usuários.');
      }
      whereClause = { CARTELA: { some: { id_usuario: user.sub } } };
    }

    const jogos = await this.prisma.jOGO.findMany({
      where: whereClause,
      select: {
        id_jogo: true,
        data_hora: true,
        SALA: { select: { id_sala: true, nome: true } },
        preco_cartela: true,
      },
      orderBy: { data_hora: 'desc' },
      take: 50,
    });

    // Agrupa por hora do dia
    const countPorHora: Record<number, number> = {};
    for (const j of jogos) {
      const hora = new Date(j.data_hora).getHours();
      countPorHora[hora] = (countPorHora[hora] || 0) + 1;
    }
    
    let horarioMaisJogado: { hora: number; partidas: number } | null = null;
    Object.entries(countPorHora).forEach(([h, c]) => {
      const hora = parseInt(h, 10);
      if (!horarioMaisJogado || c > horarioMaisJogado.partidas) {
        horarioMaisJogado = { hora, partidas: c };
      }
    });

    // --- CORREÇÃO DE LÓGICA PARA O SEU SCHEMA NOVO ---
    let taxaVitoria: number | null = null;
    const userIdForStats = (!user.isAdmin) ? user.sub : (targetUserId || null);

    if (userIdForStats) {
      // Total de jogos que participou (comprou cartela)
      const totalParticipacoes = await this.prisma.jOGO.count({
        where: { CARTELA: { some: { id_usuario: userIdForStats } } }
      });

      // Total de vitórias agora é contado pela tabela PREMIOS
      const totalVitorias = await this.prisma.pREMIOS.count({
        where: { id_usuario: userIdForStats }
      });

      if (totalParticipacoes > 0) {
        // Nota: A taxa pode passar de 100% se ele ganhar 2 prêmios no mesmo jogo, 
        // mas matematicamente reflete o sucesso dele.
        taxaVitoria = (totalVitorias / totalParticipacoes) * 100;
      } else {
        taxaVitoria = 0;
      }
    }
    // ---------------------------------------------------

    return {
      titulo: !user.isAdmin ? 'Meus Jogos' : (targetUserId ? `Relatório do Usuário ${targetUserId}` : 'Resumo Global'),
      geradoEm: new Date().toISOString(),
      resumo: horarioMaisJogado
        ? {
            hora: horarioMaisJogado.hora,
            partidasNesseHorario: horarioMaisJogado.partidas,
            totalPartidas: jogos.length,
            taxaVitoria: taxaVitoria,
          }
        : {
            hora: null,
            partidasNesseHorario: 0,
            totalPartidas: jogos.length,
            taxaVitoria: taxaVitoria,
          },
      jogos: jogos.map((j) => ({
        id: j.id_jogo,
        dataHora: j.data_hora,
        sala: j.SALA?.nome,
        precoCartela: Number(j.preco_cartela),
      })),
    };
  }

  async relatorio2() {
    const salas = await this.prisma.sALA.findMany({
      include: {
        JOGO: {
          include: {
            CARTELA: true
          }
        }
      }
    });

    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    const metricas = salas.map(sala => {
      const jogadoresUnicos = new Set<number>();
      let jogosHoje = 0;

      sala.JOGO.forEach(jogo => {
        const dataJogo = new Date(jogo.data_hora);
        dataJogo.setHours(0,0,0,0);
        if (dataJogo.getTime() === hoje.getTime()) {
          jogosHoje++;
        }
        jogo.CARTELA.forEach(cartela => {
          if (cartela.id_usuario) jogadoresUnicos.add(cartela.id_usuario);
        });
      });

      return {
        id: sala.id_sala,
        nome: sala.nome,
        jogadores: jogadoresUnicos.size,
        jogosHoje: jogosHoje
      };
    });

    return {
      titulo: 'Métricas por Sala',
      geradoEm: new Date().toISOString(),
      salas: metricas
    };
  }
}
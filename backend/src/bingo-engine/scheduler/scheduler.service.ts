import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { GameLogicService } from '../game-logic/game-logic.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gameLogicService: GameLogicService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    const now = new Date();
    
    // CORREÇÃO: Busca por status AGUARDANDO em vez de vencedor null
    const gamesToStart = await this.prisma.jOGO.findMany({
      where: {
        data_hora: { lte: now },
        status: 'AGUARDANDO', // <--- Mudança aqui
      },
    });

    if (gamesToStart.length > 0) {
      this.logger.log(`Encontrados ${gamesToStart.length} jogos para iniciar.`);
      
      for (const game of gamesToStart) {
        try {
          const result = await this.gameLogicService.startGame(game.id_jogo);

          if (result && result.error) {
            this.logger.warn(`Jogo ${game.id_jogo}: ${result.error}`);
          } else {
            this.logger.log(`Jogo ${game.id_jogo} iniciado automaticamente.`);
          }
        } catch (error) {
          this.logger.error(`Erro ao iniciar jogo ${game.id_jogo}: ${error.message}`);
        }
      }
    }
  }
}
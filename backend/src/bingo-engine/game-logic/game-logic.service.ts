import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { UsersService } from '../../users/users.service';
import { CardsService } from '../../cards/cards.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface GameEvent {
  gameId: number;
  type: string;
  data: any;
}

interface GameState {
  numberPool: number[];
  drawnNumbers: Set<number>;
  drawInterval: NodeJS.Timeout | null;
  activePlayers: Map<number, { user: any; cards: number[][][] }>;
}

@Injectable()
export class GameLogicService {
  private readonly logger = new Logger(GameLogicService.name);
  
  private runningGames = new Map<number, GameState>();
  private gameEvents$ = new Subject<GameEvent>();

  constructor(
    private usersService: UsersService,
    private cardsService: CardsService,
    private prisma: PrismaService,
  ) {}

  getEventStream() {
    return this.gameEvents$.asObservable();
  }

  // --- CONEXÃO ---
  async handleConnection(gameId: number, userIdString: string) {
    const userId = Number(userIdString);
    if (isNaN(userId) || isNaN(gameId)) return;

    let gameState = this.runningGames.get(gameId);
    if (!gameState) {
      gameState = this.createInitialState();
      this.runningGames.set(gameId, gameState);
    }

    if (gameState.activePlayers.has(userId)) {
        this.emitEvent(gameId, 'init', { drawnNumbers: Array.from(gameState.drawnNumbers) });
        return;
    }

    try {
      const user = await this.usersService.findById(userId);
      const dbCards = await this.cardsService.getUserCards(userId, gameId);

      const matrixCards = dbCards.map(c => 
        this.convertDbListToMatrix(c.NUMEROS_CARTELA.map(n => n.numero))
      );

      gameState.activePlayers.set(userId, { user, cards: matrixCards });
      this.logger.log(`User ${user.nome} entrou no Jogo ${gameId}`);

      this.emitEvent(gameId, 'init', { 
        drawnNumbers: Array.from(gameState.drawnNumbers) 
      });

    } catch (error) {
      this.logger.error(`Erro conexão user ${userId}: ${error.message}`);
    }
  }

  // --- CONTROLE ---
  
  // Alteração: startGame agora marca o jogo como ATIVO no banco
  async startGame(gameId: number) {
    let state = this.runningGames.get(gameId);
    if (!state) {
      state = this.createInitialState();
      this.runningGames.set(gameId, state);
    }

    if (state.drawInterval) return { error: 'Jogo já rodando' };

    // Atualiza status no banco para 'ATIVO'
    try {
        await this.prisma.jOGO.update({
            where: { id_jogo: gameId },
            data: { status: 'ATIVO' }
        });
    } catch (e) {
        this.logger.error(`Erro ao marcar jogo ${gameId} como ATIVO: ${e.message}`);
    }

    if (state.numberPool.length === 0) {
       state.numberPool = this.shuffledPool(75);
       state.drawnNumbers.clear();
       this.emitEvent(gameId, 'reset', {});
    }

    this.logger.log(`Iniciando sorteio Jogo ${gameId}`);
    state.drawInterval = setInterval(() => this.drawNextNumber(gameId), 5000);
    
    return { ok: true };
  }

  stopGame(gameId: number) {
    const state = this.runningGames.get(gameId);
    if (state?.drawInterval) {
      clearInterval(state.drawInterval);
      state.drawInterval = null;
      this.logger.log(`Jogo ${gameId} pausado/parado.`);
    }
    return { ok: true };
  }

  // --- SORTEIO ---
  private drawNextNumber(gameId: number) {
    const state = this.runningGames.get(gameId);
    if (!state) return;

    if (state.numberPool.length === 0) {
      this.stopGame(gameId);
      this.emitEvent(gameId, 'end', { message: 'Fim dos números' });
      // Se acabaram os números, forçamos finalização
      this.persistGameEnd(gameId); 
      return;
    }

    const n = state.numberPool.shift();
    if (n) {
      state.drawnNumbers.add(n);
      this.logger.log(`Jogo ${gameId}: Bola ${n}`);

      this.emitEvent(gameId, 'number_drawn', { 
        number: n, 
        drawnNumbers: Array.from(state.drawnNumbers) 
      });

      this.saveDrawnNumber(gameId, n, state.drawnNumbers.size);
      this.checkForBingoWinners(gameId, state, n);
    }
  }

  private async checkForBingoWinners(gameId: number, state: GameState, lastNumber: number) {
    for (const [userId, data] of state.activePlayers.entries()) {
      for (const card of data.cards) {
        if (this.checkBingo(card, state.drawnNumbers)) {
          // Tenta atribuir prêmio. Se retornar true, significa que ainda tem prêmios.
          await this.assignPrizeToWinner(gameId, userId, data.user.nome);
        }
      }
    }
  }

  // --- LÓGICA DE PRÊMIOS ---
  
  private async assignPrizeToWinner(gameId: number, userId: number, userName: string) {
    const availablePrizes = await this.prisma.pREMIOS.findMany({
      where: { id_jogo: gameId, id_usuario: null },
      orderBy: { valor: 'desc' }
    });

    if (availablePrizes.length === 0) return;

    const prizeToGive = availablePrizes[0];

    const result = await this.prisma.pREMIOS.updateMany({
      where: { id_premio: prizeToGive.id_premio, id_usuario: null },
      data: { id_usuario: userId }
    });

    if (result.count > 0) {
      this.logger.warn(`🏆 PRÊMIO: ${prizeToGive.descricao} para ${userName}`);

      this.emitEvent(gameId, 'bingo_winner', {
        winnerName: userName,
        prize: prizeToGive.descricao,
        value: prizeToGive.valor,
        timestamp: new Date()
      });

      // Se este foi o último prêmio, encerra o jogo
      if (availablePrizes.length === 1) {
        this.logger.log(`🏁 Todos os prêmios do Jogo ${gameId} saíram.`);
        this.stopGame(gameId);
        this.persistGameEnd(gameId); // <--- Alterado: não passa mais ID do vencedor
      }
    }
  }

  // --- PERSISTÊNCIA (Alterado) ---
  
  private async persistGameEnd(gameId: number) {
    try {
      // Atualiza status para FINALIZADO
      await this.prisma.jOGO.update({
        where: { id_jogo: gameId },
        data: { 
            status: 'FINALIZADO' // <--- Nova lógica
        }
      });
      this.logger.log(`✅ Jogo ${gameId} marcado como FINALIZADO no banco.`);
    } catch (error) {
      this.logger.error(`❌ Erro ao finalizar jogo no banco: ${error.message}`);
    }
  }

  private async saveDrawnNumber(gameId: number, number: number, order: number) {
      try {
          await this.prisma.nUMEROS_SORTEADOS.create({
              data: { id_jogo: gameId, numero: number, ordem_sorteio: order }
          });
      } catch(e) {}
  }

  // --- HELPERS ---
  private createInitialState(): GameState {
    return { numberPool: [], drawnNumbers: new Set(), drawInterval: null, activePlayers: new Map() };
  }

  private checkBingo(card: number[][], drawn: Set<number>): boolean {
    const size = 5;
    const marked = card.map(row => row.map(n => n === 0 || drawn.has(n)));
    for (let r = 0; r < size; r++) if (marked[r].every(Boolean)) return true;
    for (let c = 0; c < size; c++) {
        let colOk = true;
        for(let r=0; r<size; r++) if(!marked[r][c]) colOk = false;
        if(colOk) return true;
    }
    let d1=true, d2=true;
    for(let i=0; i<size; i++) {
        if(!marked[i][i]) d1=false;
        if(!marked[i][size-1-i]) d2=false;
    }
    return d1 || d2;
  }

  private convertDbListToMatrix(numbers: number[]): number[][] {
    const matrix: number[][] = [];
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      const row: number[] = [];
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) row.push(0);
        else row.push(numbers[idx++] || 0);
      }
      matrix.push(row);
    }
    return matrix;
  }

  private shuffledPool(max: number) {
      const arr = Array.from({length: max}, (_, i) => i+1);
      for(let i=arr.length-1; i>0; i--){
          const j = Math.floor(Math.random()*(i+1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
  }

  private emitEvent(gameId: number, type: string, data: any) {
    this.gameEvents$.next({ gameId, type, data });
  }
}
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GameLogicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLogicService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const users_service_1 = require("../../users/users.service");
const cards_service_1 = require("../../cards/cards.service");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let GameLogicService = GameLogicService_1 = class GameLogicService {
    constructor(usersService, cardsService, prisma) {
        this.usersService = usersService;
        this.cardsService = cardsService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(GameLogicService_1.name);
        this.runningGames = new Map();
        this.gameEvents$ = new rxjs_1.Subject();
    }
    getEventStream() {
        return this.gameEvents$.asObservable();
    }
    async handleConnection(gameId, userIdString) {
        const userId = Number(userIdString);
        if (isNaN(userId) || isNaN(gameId))
            return;
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
            const matrixCards = dbCards.map(c => this.convertDbListToMatrix(c.NUMEROS_CARTELA.map(n => n.numero)));
            gameState.activePlayers.set(userId, { user, cards: matrixCards });
            this.logger.log(`User ${user.nome} entrou no Jogo ${gameId}`);
            this.emitEvent(gameId, 'init', {
                drawnNumbers: Array.from(gameState.drawnNumbers)
            });
        }
        catch (error) {
            this.logger.error(`Erro conexão user ${userId}: ${error.message}`);
        }
    }
    async startGame(gameId) {
        let state = this.runningGames.get(gameId);
        if (!state) {
            state = this.createInitialState();
            this.runningGames.set(gameId, state);
        }
        if (state.drawInterval)
            return { error: 'Jogo já rodando' };
        try {
            await this.prisma.jOGO.update({
                where: { id_jogo: gameId },
                data: { status: 'ATIVO' }
            });
        }
        catch (e) {
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
    stopGame(gameId) {
        const state = this.runningGames.get(gameId);
        if (state?.drawInterval) {
            clearInterval(state.drawInterval);
            state.drawInterval = null;
            this.logger.log(`Jogo ${gameId} pausado/parado.`);
        }
        return { ok: true };
    }
    drawNextNumber(gameId) {
        const state = this.runningGames.get(gameId);
        if (!state)
            return;
        if (state.numberPool.length === 0) {
            this.stopGame(gameId);
            this.emitEvent(gameId, 'end', { message: 'Fim dos números' });
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
    async checkForBingoWinners(gameId, state, lastNumber) {
        for (const [userId, data] of state.activePlayers.entries()) {
            for (const card of data.cards) {
                if (this.checkBingo(card, state.drawnNumbers)) {
                    await this.assignPrizeToWinner(gameId, userId, data.user.nome);
                }
            }
        }
    }
    async assignPrizeToWinner(gameId, userId, userName) {
        const availablePrizes = await this.prisma.pREMIOS.findMany({
            where: { id_jogo: gameId, id_usuario: null },
            orderBy: { valor: 'desc' }
        });
        if (availablePrizes.length === 0)
            return;
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
            if (availablePrizes.length === 1) {
                this.logger.log(`🏁 Todos os prêmios do Jogo ${gameId} saíram.`);
                this.stopGame(gameId);
                this.persistGameEnd(gameId);
            }
        }
    }
    async persistGameEnd(gameId) {
        try {
            await this.prisma.jOGO.update({
                where: { id_jogo: gameId },
                data: {
                    status: 'FINALIZADO'
                }
            });
            this.logger.log(`✅ Jogo ${gameId} marcado como FINALIZADO no banco.`);
        }
        catch (error) {
            this.logger.error(`❌ Erro ao finalizar jogo no banco: ${error.message}`);
        }
    }
    async saveDrawnNumber(gameId, number, order) {
        try {
            await this.prisma.nUMEROS_SORTEADOS.create({
                data: { id_jogo: gameId, numero: number, ordem_sorteio: order }
            });
        }
        catch (e) { }
    }
    createInitialState() {
        return { numberPool: [], drawnNumbers: new Set(), drawInterval: null, activePlayers: new Map() };
    }
    checkBingo(card, drawn) {
        const size = 5;
        const marked = card.map(row => row.map(n => n === 0 || drawn.has(n)));
        for (let r = 0; r < size; r++)
            if (marked[r].every(Boolean))
                return true;
        for (let c = 0; c < size; c++) {
            let colOk = true;
            for (let r = 0; r < size; r++)
                if (!marked[r][c])
                    colOk = false;
            if (colOk)
                return true;
        }
        let d1 = true, d2 = true;
        for (let i = 0; i < size; i++) {
            if (!marked[i][i])
                d1 = false;
            if (!marked[i][size - 1 - i])
                d2 = false;
        }
        return d1 || d2;
    }
    convertDbListToMatrix(numbers) {
        const matrix = [];
        let idx = 0;
        for (let r = 0; r < 5; r++) {
            const row = [];
            for (let c = 0; c < 5; c++) {
                if (r === 2 && c === 2)
                    row.push(0);
                else
                    row.push(numbers[idx++] || 0);
            }
            matrix.push(row);
        }
        return matrix;
    }
    shuffledPool(max) {
        const arr = Array.from({ length: max }, (_, i) => i + 1);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    emitEvent(gameId, type, data) {
        this.gameEvents$.next({ gameId, type, data });
    }
};
exports.GameLogicService = GameLogicService;
exports.GameLogicService = GameLogicService = GameLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        cards_service_1.CardsService,
        prisma_service_1.PrismaService])
], GameLogicService);
//# sourceMappingURL=game-logic.service.js.map
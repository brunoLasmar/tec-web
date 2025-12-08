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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma/prisma.service");
const client_1 = require("@prisma/client");
let GamesService = class GamesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.CARD_NUMBERS_COUNT = 24;
        this.MAX_CARDS_PER_USER = 10;
    }
    async buyCards(userId, gameId, quantity) {
        if (quantity <= 0 || quantity > this.MAX_CARDS_PER_USER) {
            throw new common_1.BadRequestException(`A quantidade de cartelas deve ser entre 1 e ${this.MAX_CARDS_PER_USER}.`);
        }
        const game = await this.findOne(gameId);
        if (new Date() >= game.data_hora) {
            throw new common_1.ForbiddenException("Não é possível comprar cartelas para um jogo que já começou ou terminou.");
        }
        const user = await this.prisma.uSUARIO.findUnique({ where: { id_usuario: userId } });
        if (!user)
            throw new common_1.NotFoundException("Usuário não encontrado.");
        const totalCost = game.preco_cartela.mul(quantity);
        if (user.creditos.lt(totalCost)) {
            throw new common_1.ForbiddenException("Créditos insuficientes.");
        }
        const userCardsCount = await this.prisma.cARTELA.count({ where: { id_usuario: userId, id_jogo: gameId } });
        if ((userCardsCount + quantity) > this.MAX_CARDS_PER_USER) {
            throw new common_1.ForbiddenException(`Você só pode comprar um total de ${this.MAX_CARDS_PER_USER} cartelas para este jogo.`);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.uSUARIO.update({
                where: { id_usuario: userId },
                data: { creditos: { decrement: totalCost } },
            });
            const createdCards = [];
            for (let i = 0; i < quantity; i++) {
                const newCard = await tx.cARTELA.create({
                    data: { id_jogo: gameId, id_usuario: userId, }
                });
                const cardNumbers = this.generateCardNumbers();
                await tx.nUMEROS_CARTELA.createMany({
                    data: cardNumbers.map(num => ({ id_cartela: newCard.id_cartela, numero: num }))
                });
                createdCards.push({ cardId: newCard.id_cartela, numbers: cardNumbers });
            }
            return { message: "Cartelas compradas com sucesso!", cards: createdCards };
        });
    }
    generateCardNumbers() {
        const numbers = new Set();
        while (numbers.size < this.CARD_NUMBERS_COUNT) {
            const num = Math.floor(Math.random() * 75) + 1;
            numbers.add(num);
        }
        return Array.from(numbers);
    }
    create(createGameDto) {
        return this.prisma.jOGO.create({
            data: {
                ...createGameDto,
                preco_cartela: new client_1.Prisma.Decimal(createGameDto.preco_cartela),
            }
        });
    }
    findAll() {
        return this.prisma.jOGO.findMany({
            orderBy: { data_hora: 'asc' },
            include: {
                SALA: { select: { nome: true } },
                PREMIOS: { select: { valor: true } }
            }
        });
    }
    async findOne(id) {
        const game = await this.prisma.jOGO.findUnique({ where: { id_jogo: id } });
        if (!game)
            throw new common_1.NotFoundException(`Jogo com ID ${id} não encontrado.`);
        return game;
    }
    async findOneWithDetails(id) {
        const game = await this.prisma.jOGO.findUnique({
            where: { id_jogo: id },
            include: {
                SALA: true,
                NUMEROS_SORTEADOS: { orderBy: { ordem_sorteio: 'asc' } },
                _count: { select: { CARTELA: true } }
            }
        });
        if (!game)
            throw new common_1.NotFoundException(`Jogo com ID ${id} não encontrado.`);
        return game;
    }
    async update(id, updateGameDto) {
        await this.findOne(id);
        const data = { ...updateGameDto };
        if (updateGameDto.preco_cartela) {
            data.preco_cartela = new client_1.Prisma.Decimal(updateGameDto.preco_cartela);
        }
        return this.prisma.jOGO.update({
            where: { id_jogo: id },
            data,
        });
    }
    async remove(id) {
        const game = await this.findOneWithDetails(id);
        if (game._count.CARTELA > 0) {
            throw new common_1.ConflictException("Não é possível remover um jogo que já possui cartelas vendidas.");
        }
        await this.prisma.jOGO.delete({ where: { id_jogo: id } });
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamesService);
//# sourceMappingURL=games.service.js.map
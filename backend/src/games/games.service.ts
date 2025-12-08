// path: src/games/games.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  private readonly CARD_NUMBERS_COUNT = 24; // Cartela 5x5 com centro livre
  private readonly MAX_CARDS_PER_USER = 10;

  constructor(private readonly prisma: PrismaService) {}

  async buyCards(userId: number, gameId: number, quantity: number) {
    if(quantity <= 0 || quantity > this.MAX_CARDS_PER_USER) {
      throw new BadRequestException(`A quantidade de cartelas deve ser entre 1 e ${this.MAX_CARDS_PER_USER}.`);
    }

    const game = await this.findOne(gameId);
    if(new Date() >= game.data_hora) {
      throw new ForbiddenException("Não é possível comprar cartelas para um jogo que já começou ou terminou.");
    }
    
    const user = await this.prisma.uSUARIO.findUnique({ where: { id_usuario: userId }});
    if(!user) throw new NotFoundException("Usuário não encontrado.");

    const totalCost = game.preco_cartela.mul(quantity);
    if(user.creditos.lt(totalCost)) {
      throw new ForbiddenException("Créditos insuficientes.");
    }

    const userCardsCount = await this.prisma.cARTELA.count({ where: { id_usuario: userId, id_jogo: gameId }});
    if((userCardsCount + quantity) > this.MAX_CARDS_PER_USER) {
      throw new ForbiddenException(`Você só pode comprar um total de ${this.MAX_CARDS_PER_USER} cartelas para este jogo.`);
    }

    // Usamos uma transação para garantir a atomicidade da operação
    return this.prisma.$transaction(async (tx) => {
      await tx.uSUARIO.update({
        where: { id_usuario: userId },
        data: { creditos: { decrement: totalCost } },
      });

      const createdCards = [];
      for(let i = 0; i < quantity; i++) {
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

  private generateCardNumbers(): number[] {
    const numbers = new Set<number>();
    // Números de 1 a 75
    while (numbers.size < this.CARD_NUMBERS_COUNT) {
      const num = Math.floor(Math.random() * 75) + 1;
      numbers.add(num);
    }
    return Array.from(numbers);
  }

  create(createGameDto: CreateGameDto) {
    return this.prisma.jOGO.create({
      data: {
        ...createGameDto,
        preco_cartela: new Prisma.Decimal(createGameDto.preco_cartela),
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

  async findOne(id: number) {
    const game = await this.prisma.jOGO.findUnique({ where: { id_jogo: id } });
    if (!game) throw new NotFoundException(`Jogo com ID ${id} não encontrado.`);
    return game;
  }
  
  async findOneWithDetails(id: number) {
    const game = await this.prisma.jOGO.findUnique({ 
        where: { id_jogo: id },
        include: {
            SALA: true,
            NUMEROS_SORTEADOS: { orderBy: { ordem_sorteio: 'asc' }},
            _count: { select: { CARTELA: true }}
        }
    });
    if (!game) throw new NotFoundException(`Jogo com ID ${id} não encontrado.`);
    return game;
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    await this.findOne(id);
    const data: Prisma.JOGOUpdateInput = {...updateGameDto};
    if(updateGameDto.preco_cartela) {
      data.preco_cartela = new Prisma.Decimal(updateGameDto.preco_cartela);
    }
    return this.prisma.jOGO.update({
      where: { id_jogo: id },
      data,
    });
  }

  async remove(id: number) {
    const game = await this.findOneWithDetails(id);
    if(game._count.CARTELA > 0) {
        throw new ConflictException("Não é possível remover um jogo que já possui cartelas vendidas.");
    }
    await this.prisma.jOGO.delete({ where: { id_jogo: id } });
  }
}


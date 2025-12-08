import { MessageEvent } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { BuyCardsDto } from './dto/buy-cards.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { GameLogicService } from '../bingo-engine/game-logic/game-logic.service';
import { Observable } from 'rxjs';
export declare class GamesController {
    private readonly gamesService;
    private readonly gameLogic;
    constructor(gamesService: GamesService, gameLogic: GameLogicService);
    create(createGameDto: CreateGameDto): import(".prisma/client").Prisma.Prisma__JOGOClient<{
        data_hora: Date;
        preco_cartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        SALA: {
            nome: string;
        };
        PREMIOS: {
            valor: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        data_hora: Date;
        preco_cartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    })[]>;
    findOne(id: string): Promise<{
        data_hora: Date;
        preco_cartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    }>;
    update(id: string, updateGameDto: UpdateGameDto): Promise<{
        data_hora: Date;
        preco_cartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    }>;
    remove(id: string): Promise<void>;
    buyCards(buyCardsDto: BuyCardsDto, req: AuthenticatedRequest): Promise<{
        message: string;
        cards: any[];
    }>;
    stream(gameIdStr: string, userId: string): Observable<MessageEvent>;
    startGame(id: string): Promise<{
        error: string;
        ok?: undefined;
    } | {
        ok: boolean;
        error?: undefined;
    }>;
    stopGame(id: string): {
        ok: boolean;
    };
}

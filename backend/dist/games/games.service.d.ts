import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class GamesService {
    private readonly prisma;
    private readonly CARD_NUMBERS_COUNT;
    private readonly MAX_CARDS_PER_USER;
    constructor(prisma: PrismaService);
    buyCards(userId: number, gameId: number, quantity: number): Promise<{
        message: string;
        cards: any[];
    }>;
    private generateCardNumbers;
    create(createGameDto: CreateGameDto): Prisma.Prisma__JOGOClient<{
        data_hora: Date;
        preco_cartela: Prisma.Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<({
        SALA: {
            nome: string;
        };
        PREMIOS: {
            valor: Prisma.Decimal;
        }[];
    } & {
        data_hora: Date;
        preco_cartela: Prisma.Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    })[]>;
    findOne(id: number): Promise<{
        data_hora: Date;
        preco_cartela: Prisma.Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    }>;
    findOneWithDetails(id: number): Promise<{
        SALA: {
            id_sala: number;
            nome: string;
            descricao: string | null;
        };
        NUMEROS_SORTEADOS: {
            id_jogo: number;
            ordem_sorteio: number;
            id_numero_sorteado: number;
            numero: number;
        }[];
        _count: {
            CARTELA: number;
        };
    } & {
        data_hora: Date;
        preco_cartela: Prisma.Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    }>;
    update(id: number, updateGameDto: UpdateGameDto): Promise<{
        data_hora: Date;
        preco_cartela: Prisma.Decimal;
        status: string;
        id_jogo: number;
        id_sala: number;
    }>;
    remove(id: number): Promise<void>;
}

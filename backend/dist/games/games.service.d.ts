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
        id_jogo: number;
        data_hora: Date;
        id_sala: number;
        preco_cartela: Prisma.Decimal;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<({
        SALA: {
            nome: string;
        };
    } & {
        id_jogo: number;
        data_hora: Date;
        id_sala: number;
        preco_cartela: Prisma.Decimal;
        status: string;
    })[]>;
    findOne(id: number): Promise<{
        id_jogo: number;
        data_hora: Date;
        id_sala: number;
        preco_cartela: Prisma.Decimal;
        status: string;
    }>;
    findOneWithDetails(id: number): Promise<{
        _count: {
            CARTELA: number;
        };
        SALA: {
            nome: string;
            id_sala: number;
            descricao: string | null;
        };
        NUMEROS_SORTEADOS: {
            id_jogo: number;
            numero: number;
            ordem_sorteio: number;
            id_numero_sorteado: number;
        }[];
    } & {
        id_jogo: number;
        data_hora: Date;
        id_sala: number;
        preco_cartela: Prisma.Decimal;
        status: string;
    }>;
    update(id: number, updateGameDto: UpdateGameDto): Promise<{
        id_jogo: number;
        data_hora: Date;
        id_sala: number;
        preco_cartela: Prisma.Decimal;
        status: string;
    }>;
    remove(id: number): Promise<void>;
}

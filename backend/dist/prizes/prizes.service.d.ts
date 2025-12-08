import { PrismaService } from '../shared/prisma/prisma.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { Prisma } from '@prisma/client';
export declare class PrizesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPrizeDto: CreatePrizeDto): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
        };
    } & {
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        id_premio: number;
        valor: Prisma.Decimal;
    }>;
    findAll(): Prisma.PrismaPromise<({
        JOGO: {
            id_jogo: number;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            id_usuario: number;
            email: string;
            nome: string;
        };
    } & {
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        id_premio: number;
        valor: Prisma.Decimal;
    })[]>;
    findOne(id: number): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            id_sala: number;
            preco_cartela: Prisma.Decimal;
            status: string;
        };
        USUARIO: {
            id_usuario: number;
            nome: string;
        };
    } & {
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        id_premio: number;
        valor: Prisma.Decimal;
    }>;
    update(id: number, updatePrizeDto: UpdatePrizeDto): Promise<{
        USUARIO: {
            nome: string;
        };
    } & {
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        id_premio: number;
        valor: Prisma.Decimal;
    }>;
    remove(id: number): Promise<{
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        id_premio: number;
        valor: Prisma.Decimal;
    }>;
}

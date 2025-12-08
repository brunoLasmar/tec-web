import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
export declare class PrizesController {
    private readonly prizesService;
    constructor(prizesService: PrizesService);
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
        valor: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
        valor: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: number): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            id_sala: number;
            preco_cartela: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: number): Promise<{
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        id_premio: number;
        valor: import("@prisma/client/runtime/library").Decimal;
    }>;
}

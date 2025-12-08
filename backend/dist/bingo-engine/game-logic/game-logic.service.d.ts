import { UsersService } from '../../users/users.service';
import { CardsService } from '../../cards/cards.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
export interface GameEvent {
    gameId: number;
    type: string;
    data: any;
}
export declare class GameLogicService {
    private usersService;
    private cardsService;
    private prisma;
    private readonly logger;
    private runningGames;
    private gameEvents$;
    constructor(usersService: UsersService, cardsService: CardsService, prisma: PrismaService);
    getEventStream(): import("rxjs").Observable<GameEvent>;
    handleConnection(gameId: number, userIdString: string): Promise<void>;
    startGame(gameId: number): Promise<{
        error: string;
        ok?: undefined;
    } | {
        ok: boolean;
        error?: undefined;
    }>;
    stopGame(gameId: number): {
        ok: boolean;
    };
    private drawNextNumber;
    private checkForBingoWinners;
    private assignPrizeToWinner;
    private persistGameEnd;
    private saveDrawnNumber;
    private createInitialState;
    private checkBingo;
    private convertDbListToMatrix;
    private shuffledPool;
    private emitEvent;
}

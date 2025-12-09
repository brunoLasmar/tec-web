import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsPublic } from '../auth/decorators/is-public.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard) // <--- Protege todas as rotas (exige login)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('relatorio1')
  getRelatorio1(@Req() req: AuthenticatedRequest, @Query('userId') userId?: string) {
    const targetId = userId ? parseInt(userId, 10) : undefined;
    return this.reportsService.relatorio1(req.user, targetId);
  }

  @Get('relatorio2')
  // @IsPublic() <--- REMOVIDO: Agora exige login, mas qualquer usuário pode ver
  getRelatorio2() {
    return this.reportsService.relatorio2();
  }
}
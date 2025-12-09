import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard) // Garante que precisa estar logado
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('relatorio1')
  getRelatorio1(@Req() req: AuthenticatedRequest, @Query('userId') userId?: string) {
    const targetId = userId ? parseInt(userId, 10) : undefined;
    return this.reportsService.relatorio1(req.user, targetId);
  }

  // Apenas Admin pode ver métricas gerais de sala para proteger dados
  @Get('relatorio2')
  @UseGuards(AdminGuard)
  getRelatorio2() {
    return this.reportsService.relatorio2();
  }
}
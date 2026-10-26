import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from '@moduleMcp/services/mcp.service';
import { McpAuthGuard } from '@moduleMcp/guards/mcp-auth.guard';
import { User } from '@moduleUsers/entities/user.entity';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get('sse')
  @UseGuards(McpAuthGuard)
  async sse(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user = (req as any).user as User;
    await this.mcpService.handleSseConnection(req, res, user);
  }

  @Post('messages')
  async messages(
    @Query('sessionId') sessionId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!sessionId) {
      throw new BadRequestException('Query parameter "sessionId" is required.');
    }
    await this.mcpService.handlePostMessage(sessionId, req, res);
  }
}

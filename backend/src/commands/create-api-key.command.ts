import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { UsersService } from '@moduleUsers/services/users.service';
import { ApiKeysService } from '@moduleAuth/services/api-keys.service';

@Command({
  name: 'create-api-key',
  arguments: '<rubberHandle> <keyName> [expiresInDays]',
  description: 'Generate a Personal Access Token / API Key for AI Agents',
})
export class CreateApiKeyCommand extends CommandRunner {
  private readonly logger = new Logger(CreateApiKeyCommand.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly apiKeysService: ApiKeysService,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      const [rubberHandle, keyName, expiresInDaysStr] = passedParams;

      if (!rubberHandle || !keyName) {
        this.logger.error('Usage: pnpm run cli create-api-key <rubberHandle> <keyName> [expiresInDays]');
        return;
      }

      const user = await this.usersService.findByRubberHandle(rubberHandle);
      const expiresInDays = expiresInDaysStr ? parseInt(expiresInDaysStr, 10) : undefined;

      const result = await this.apiKeysService.createApiKey(user.id, {
        name: keyName,
        expiresInDays,
      });

      console.log('\n======================================================');
      console.log('🤖 AI AGENT API KEY (PAT) GENERATED SUCCESSFULLY');
      console.log('======================================================');
      console.log(`User:         @${user.rubberHandle} (${user.type})`);
      console.log(`Key Name:     ${result.apiKey.name}`);
      console.log(`Key Prefix:   ${result.apiKey.keyPrefix}`);
      console.log(`Expires At:   ${result.apiKey.expiresAt ? result.apiKey.expiresAt.toISOString() : 'Never'}`);
      console.log(`API Token:    ${result.rawKey}`);
      console.log('======================================================');
      console.log('⚠️  Store this token securely! It cannot be retrieved again.\n');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error generating API key: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Unknown error: ${error}`);
      }
    }
  }
}

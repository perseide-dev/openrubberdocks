import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { UsersService } from '@moduleUsers/services/users.service';
import { CreateUserDto } from '@moduleUsers/dto/create-user.dto';
import { UserType } from '@moduleUsers/enums/users.enum';

@Command({
  name: 'create-coreUser',
  arguments: '<username> <rubberHandle> <password>',
  description: 'Create Core User',
})
export class CreateCoreUserCommand extends CommandRunner {
  private readonly logger = new Logger(CreateCoreUserCommand.name);
  constructor(private readonly userService: UsersService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      const [username, rubberHandle, password] = passedParams;

      const payload: CreateUserDto = {
        username: username,
        rubberHandle: rubberHandle,
        password: password,
        type: UserType.COREADMIN,
      };

      await this.userService.create(payload);
      this.logger.log(`Core User ${username}-${rubberHandle} `);
    } catch  (error) {
       if (error instanceof Error) {
                this.logger.error(`Error creating the user: ${error.message}`, error.stack);
            } else {
                // Si lanzaron un string u otra cosa extraña
                this.logger.error(`Unknown error while creating the user: ${error}`);
            }
    }
  }
}

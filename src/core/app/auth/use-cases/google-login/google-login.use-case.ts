import { IUseCase } from "@app/shared/use-case.interface";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { User, UserFactory } from "@domain/user/user.entity";
import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { IGoogleLoginUnitOfWork } from "./google-login.unit-of-work";
import { IUserRepository } from "@domain/user/user.repository";
import { IAuthTokenService } from "@app/auth/services/auth-token.service";
import {
  GoogleUser,
  IGoogleAuthService,
} from "@app/auth/services/google-auth.service";
import { IHashService } from "@app/auth/services/hash.service";
import { AuthenticationError } from "@domain/shared/errors/authentication.error";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

export class GoogleLoginUseCase
  implements IUseCase<GoogleLoginInput, GoogleLoginOutput>
{
  constructor(
    private unitOfWork: IGoogleLoginUnitOfWork,
    private authTokenService: IAuthTokenService,
    private googleAuthService: IGoogleAuthService,
    private hashTokenService: IHashService,
  ) {}

  async execute(input: GoogleLoginInput): Promise<GoogleLoginOutput> {
    const googleUser = await this.googleAuthService.verifyToken(input.token);

    return this.unitOfWork.runInTransaction(async (repositories) => {
      const { userRepository, refreshTokenRepository, endpointRepository } =
        repositories;

      const { isNewUser, user } = await this.resolveUser(
        googleUser,
        userRepository,
      );

      if (isNewUser) {
        await this.createEndpointForNewUser(user, endpointRepository);
      }

      const generatedTokens = await this.resolveTokens(
        user,
        refreshTokenRepository,
      );

      return {
        accessToken: generatedTokens.accessToken,
        refreshToken: generatedTokens.refreshToken,
        user: {
          id: user.userId.toString(),
          name: user.name,
          email: user.email,
        },
      };
    });
  }

  private async resolveTokens(
    user: User,
    refreshTokenRepository: IRefreshTokenRepository,
  ) {
    const generatedTokens = await this.authTokenService.generate({
      userId: user.userId.toString(),
      email: user.email,
      name: user.name,
    });

    const refreshTokenHash = await this.hashTokenService.hash(
      generatedTokens.refreshToken,
    );

    const refreshToken = RefreshTokenFactory.create({
      refreshTokenHash,
      userId: user.userId,
    });

    if (refreshToken.notification.hasErrors()) {
      throw new EntityValidationError(refreshToken.notification.toJSON());
    }

    await refreshTokenRepository.insert(refreshToken);

    return generatedTokens;
  }

  private async resolveUser(
    googleUser: GoogleUser,
    userRepository: IUserRepository,
  ) {
    let user = await userRepository.findByGoogleId(googleUser.googleId);
    const isNewUser = !user;

    if (user && !user.isActive) {
      throw new AuthenticationError("User account is inactive");
    }

    if (user) {
      await this.updateUserIfDataIsDifferent({
        googleUser,
        user,
        userRepository,
      });
    }

    if (!user) {
      user = await this.createUser({
        googleUser,
        userRepository,
      });
    }

    return {
      isNewUser,
      user,
    };
  }

  private async updateUserIfDataIsDifferent(props: {
    user: User;
    userRepository: IUserRepository;
    googleUser: GoogleUser;
  }) {
    const { user, googleUser, userRepository } = props;

    if (user.name !== googleUser.name) {
      user.changeName(googleUser.name);
    }

    if (googleUser.email !== user.email) {
      user.changeEmail(googleUser.email);
    }

    if (user.notification.hasErrors()) {
      throw new EntityValidationError(user.notification.toJSON());
    }

    await userRepository.update(user);
  }

  private async createUser(props: {
    googleUser: GoogleUser;
    userRepository: IUserRepository;
  }) {
    const { googleUser, userRepository } = props;

    const user = UserFactory.create({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
    });

    if (user.notification.hasErrors()) {
      throw new EntityValidationError(user.notification.toJSON());
    }

    await userRepository.insert(user);

    return user;
  }

  private async createEndpointForNewUser(
    user: User,
    endpointRepository: IEndpointRepository,
  ) {
    const endpoint = EndpointFactory.create({
      userId: user.userId,
      title: "My First Endpoint",
      method: HttpMethod.GET,
      statusCode: new StatusCode(200),
      responseBodyType: ResponseBodyType.JSON,
      responseJson: '{\n  "message": "Hello, World!"\n}',
    });

    await endpointRepository.insert(endpoint);
  }
}

type GoogleLoginInput = {
  token: string;
};

type GoogleLoginOutput = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers["x-api-key"];

    if (!apiKey) return false;

    const isValid = this.validateApiKey(apiKey);

    return isValid;
  }

  private validateApiKey(apiKey: string): boolean {
    if (typeof apiKey !== "string") return false;

    if (apiKey.length !== 64) return false;

    if (!/^[0-9a-f]+$/.test(apiKey)) return false;

    return true;
  }
}

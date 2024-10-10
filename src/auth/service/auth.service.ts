import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    // compare password
    const passCompare = await bcrypt.compare(password, user.password);

    if (!user || !passCompare) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(username: string, password: string): Promise<any> {
    // add hash and salt
    const hashPassword = await bcrypt.hash(password, 10);

    await this.usersService.create(username, hashPassword);
  }
}

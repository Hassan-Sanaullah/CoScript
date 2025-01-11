import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    async signUp(dto) {
        const checkUsername = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });

        const checkEmail = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (checkUsername) {
            throw new ConflictException('Username already exists');
        }

        if (checkEmail) {
            throw new ConflictException('Email already exists');
        }

        const hash = await argon2.hash(dto.password);

        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                passwordHash: hash,
                email: dto.email,
            },
        });

        if (!user) {
            throw new InternalServerErrorException(
                'unexpected issues during account creation'
            );
        }

        delete user.passwordHash;
        return this.signToken(user.id, user.username);
    }

    async signIn(dto) {
        const user = await this.prisma.user.findFirst({
            where: { username: dto.username },
        });

        if (!user) {
            throw new NotFoundException('Username not found');
        }

        if (!(await argon2.verify(user.passwordHash, dto.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        delete user.passwordHash;
        return this.signToken(user.id, user.username);
    }

    async signToken(
        userId: number,
        username: string
    ): Promise<{ access_token: string }> {
        const payload = { sub: userId, username: username };

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '5h',
            secret: this.config.get('JWT_SECRET'),
        });

        return { access_token: token };
    }
}

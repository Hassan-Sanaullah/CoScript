import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { EditorModule } from './editor/editor.module';
import { SocketsModule } from './sockets/sockets.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        PrismaModule,
        UserModule,
        EditorModule,
        SocketsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}

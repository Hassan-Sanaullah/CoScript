import { Module } from '@nestjs/common';
import { EditorGateway } from './editor.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
    providers: [EditorGateway],
    imports: [JwtModule.register({})],
})
export class SocketsModule {}

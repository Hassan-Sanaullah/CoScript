import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { JwtStrategy } from 'src/auth/strategy';

@Module({
    providers: [EditorService, JwtStrategy],
    controllers: [EditorController],
})
export class EditorModule {}

import { IsOptional, IsString } from 'class-validator';

export class createWorkspaceDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

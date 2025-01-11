import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateFileDto {
    @IsString()
    workspaceId: string;

    @IsString()
    filename: string;

    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    parentFolder?: string; // Optional field

    @IsOptional()
    @IsString()
    createdAt?: Date;

    @IsOptional()
    @IsString()
    updatedAt?: Date;
}

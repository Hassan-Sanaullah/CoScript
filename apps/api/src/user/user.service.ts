import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getDashboardInfo(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                workspaces: {
                    select: {
                        role: true,
                        workspace: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                updatedAt: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        delete user.passwordHash;

        const workspaces = user.workspaces.map((workspace) => ({
            id: workspace.workspace.id,
            role: workspace.role,
            name: workspace.workspace.name,
            description: workspace.workspace.description,
            updatedAt: workspace.workspace.updatedAt,
        }));

        return {
            userId,
            ...user,
            workspaces, // Attach the reshaped workspaces data
        };
    }
}

// __tests__/tokens.test.ts
import { generatePasswordResetToken } from '@/lib/tokens';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        passwordResetToken: {
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Password Reset Tokens', () => {
    const email = 'test@example.com';
    const prismaMock = prisma as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a new token if none exists', async () => {
        prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);
        prismaMock.passwordResetToken.create.mockResolvedValue({
            id: '1',
            email,
            token: 'test-token',
            expires: new Date(),
        });

        const result = await generatePasswordResetToken(email);

        expect(result.email).toBe(email);
        expect(prismaMock.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should delete existing token before creating a new one', async () => {
        prismaMock.passwordResetToken.findFirst.mockResolvedValue({
            id: 'old-token-id',
            email,
            token: 'old-token',
            expires: new Date(),
        });

        prismaMock.passwordResetToken.create.mockResolvedValue({
            id: 'new-token-id',
            email,
            token: 'new-token',
            expires: new Date(),
        });

        await generatePasswordResetToken(email);

        expect(prismaMock.passwordResetToken.delete).toHaveBeenCalledWith({
            where: { id: 'old-token-id' },
        });
        expect(prismaMock.passwordResetToken.create).toHaveBeenCalled();
    });
});

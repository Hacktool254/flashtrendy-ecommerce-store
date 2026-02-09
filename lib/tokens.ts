import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function generatePasswordResetToken(email: string) {
    const token = randomUUID();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        },
    });

    return passwordResetToken;
}

export async function getPasswordResetTokenByToken(token: string) {
    try {
        const passwordResetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        return passwordResetToken;
    } catch {
        return null;
    }
}

export async function getPasswordResetTokenByEmail(email: string) {
    try {
        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: { email },
        });

        return passwordResetToken;
    } catch {
        return null;
    }
}

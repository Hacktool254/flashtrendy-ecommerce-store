"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/app/actions/emails";

const ForgotPasswordSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
});

const ResetPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
});

export async function resetPasswordRequest(values: z.infer<typeof ForgotPasswordSchema>) {
    const validatedFields = ForgotPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }

    const { email } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        return { error: "Email not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token,
    );

    return { success: "Reset email sent!" };
}

export async function resetPassword(
    values: z.infer<typeof ResetPasswordSchema>,
    token?: string | null,
) {
    if (!token) {
        return { error: "Missing token!" };
    }

    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { password } = validatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.email }
    });

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    });

    return { success: "Password updated!" };
}

import {
    Section,
    Text,
    Heading,
    Button,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface PasswordResetEmailProps {
    resetLink: string;
}

export const PasswordResetEmail = ({
    resetLink,
}: PasswordResetEmailProps) => {
    return (
        <BaseLayout previewText="Reset your FlashTrendy password">
            <Heading style={h1}>Reset your password</Heading>
            <Text style={text}>
                We received a request to reset your password. Click the button below to set a new one. This link will expire in 1 hour.
            </Text>

            <Section style={btnContainer}>
                <Button style={button} href={resetLink}>
                    Reset Password
                </Button>
            </Section>

            <Text style={text}>
                If you didn't request a password reset, you can safely ignore this email.
            </Text>
        </BaseLayout>
    );
};

const h1 = {
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
};

const text = {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "26px",
};

const btnContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#0f172a",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 24px",
};

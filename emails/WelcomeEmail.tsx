import {
    Section,
    Text,
    Heading,
    Button,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface WelcomeEmailProps {
    name: string;
}

export const WelcomeEmail = ({
    name,
}: WelcomeEmailProps) => {
    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return (
        <BaseLayout previewText="Welcome to FlashTrendy!">
            <Heading style={h1}>Welcome to FlashTrendy!</Heading>
            <Text style={text}>
                Hi {name}, we're excited to have you join our community of trendsetters.
            </Text>

            <Text style={text}>
                Explore our latest tech collection and discover amazing deals on the gadgets you love.
            </Text>

            <Section style={btnContainer}>
                <Button style={button} href={`${domain}/products`}>
                    Start Shopping
                </Button>
            </Section>

            <Text style={text}>
                If you have any questions, feel free to reply to this email or visit our dashboard.
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

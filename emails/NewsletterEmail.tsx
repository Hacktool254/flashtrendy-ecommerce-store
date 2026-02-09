import {
    Section,
    Text,
    Heading,
    Button,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface NewsletterEmailProps {
    title: string;
    content: string;
    ctaText?: string;
    ctaLink?: string;
}

export const NewsletterEmail = ({
    title,
    content,
    ctaText,
    ctaLink,
}: NewsletterEmailProps) => {
    return (
        <BaseLayout previewText={title}>
            <Heading style={h1}>{title}</Heading>
            <Text style={text}>{content}</Text>

            {ctaText && ctaLink && (
                <Section style={btnContainer}>
                    <Button style={button} href={ctaLink}>
                        {ctaText}
                    </Button>
                </Section>
            )}

            <Text style={text}>
                Thanks for being a part of FlashTrendy! Stay tuned for more updates.
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

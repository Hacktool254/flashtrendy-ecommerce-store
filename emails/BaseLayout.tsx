import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Link,
    Font,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
    previewText: string;
    children: React.ReactNode;
}

export const BaseLayout = ({
    previewText,
    children,
}: BaseLayoutProps) => {
    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>FlashTrendy</Text>
                    </Section>

                    <Section style={content}>
                        {children}
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            &copy; {new Date().getFullYear()} FlashTrendy Ecommerce Store. All rights reserved.
                        </Text>
                        <Link href={domain} style={footerLink}>
                            Visit our store
                        </Link>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "580px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
};

const header = {
    padding: "32px",
    textAlign: "center" as const,
};

const logo = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0f172a",
    margin: "0",
};

const content = {
    padding: "0 32px",
};

const hr = {
    borderColor: "#e2e8f0",
    margin: "20px 0",
};

const footer = {
    padding: "0 32px",
    textAlign: "center" as const,
};

const footerText = {
    color: "#94a3b8",
    fontSize: "12px",
    margin: "0 0 10px",
};

const footerLink = {
    color: "#3b82f6",
    fontSize: "12px",
    textDecoration: "underline",
};

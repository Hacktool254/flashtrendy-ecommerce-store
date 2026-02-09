import {
    Section,
    Text,
    Heading,
    Row,
    Column,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface OrderConfirmationEmailProps {
    order: {
        id: string;
        total: number;
        user: {
            name: string;
        };
        items: Array<{
            product: { name: string };
            quantity: number;
            price: number;
        }>;
    };
}

export const OrderConfirmationEmail = ({
    order,
}: OrderConfirmationEmailProps) => {
    return (
        <BaseLayout previewText={`Thank you for your order, ${order.user.name}!`}>
            <Heading style={h1}>Thank you for your order!</Heading>
            <Text style={text}>
                Hi {order.user.name}, your order has been placed successfully and is being processed.
            </Text>

            <Section style={orderInfo}>
                <Text style={orderInfoTitle}>Order Summary</Text>
                <Text style={orderInfoItem}><strong>Order ID:</strong> {order.id}</Text>
                <Text style={orderInfoItem}><strong>Total:</strong> ${Number(order.total).toFixed(2)}</Text>
            </Section>

            <Section>
                {order.items?.map((item, index) => (
                    <Row key={index} style={itemRow}>
                        <Column>
                            <Text style={itemText}>{item.product.name} x {item.quantity}</Text>
                        </Column>
                        <Column align="right">
                            <Text style={itemText}>${Number(item.price * item.quantity).toFixed(2)}</Text>
                        </Column>
                    </Row>
                ))}
            </Section>

            <Text style={text}>
                You can track your order status in your dashboard.
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

const orderInfo = {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
};

const orderInfoTitle = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 12px",
};

const orderInfoItem = {
    margin: "4px 0",
    fontSize: "14px",
};

const itemRow = {
    borderBottom: "1px solid #e2e8f0",
    padding: "8px 0",
};

const itemText = {
    margin: "0",
    fontSize: "14px",
    color: "#475569",
};

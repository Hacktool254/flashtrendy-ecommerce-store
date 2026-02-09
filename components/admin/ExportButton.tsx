"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
    exportAction: () => Promise<string>;
    filename: string;
    variant?: "outline" | "default" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({
    exportAction,
    filename,
    variant = "outline",
    size = "default",
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const csvContent = await exportAction();
            if (!csvContent) {
                toast({
                    title: "Export failed",
                    description: "No data to export",
                    variant: "destructive",
                });
                return;
            }

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export successful",
                description: `Your ${filename} report has been downloaded.`,
            });
        } catch (error) {
            console.error("Export failed:", error);
            toast({
                title: "Export failed",
                description: "Failed to export data",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            disabled={isExporting}
        >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
    );
}

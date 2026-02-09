"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, SearchX, TrendingUp } from "lucide-react";

interface SearchAnalyticsProps {
    data: {
        topSearches: { query: string; count: number }[];
        emptySearches: { query: string; createdAt: string }[];
    };
}

export function SearchAnalytics({ data }: SearchAnalyticsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <CardTitle>Top Search Queries</CardTitle>
                    </div>
                    <CardDescription>Most frequent searches by customers</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Query</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.topSearches.length > 0 ? (
                                data.topSearches.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Search className="h-3 w-3 text-muted-foreground" />
                                            {item.query}
                                        </TableCell>
                                        <TableCell className="text-right">{item.count}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                        No search data yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <SearchX className="h-4 w-4 text-destructive" />
                        <CardTitle>Zero Results</CardTitle>
                    </div>
                    <CardDescription>Searches that returned no products</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Query</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.emptySearches.length > 0 ? (
                                data.emptySearches.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.query}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                        All searches found results!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

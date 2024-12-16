"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from 'lucide-react'
import { AuthService } from "../util/ApiUtils"
import { uploadFile } from "../util/InvestmentUtil"

interface UploadCAMSReportProps {
    onUpload: (data: any) => void
    onClose: () => void
}

export default function UploadCAMSReport({ onUpload, onClose }: UploadCAMSReportProps) {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        // Here you would typically send the file to your server
        // For this example, we'll simulate processing the file
        console.log("Uploading file:", file.name)
        const userId = AuthService.getUserId();
        if (userId !== null) {
            const mockProcessedData = await uploadFile(file, userId)
            console.log("Processed data:", mockProcessedData)
            onUpload(mockProcessedData)
        }

    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Upload CAMS Report
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cams-report">Select CAMS Report File</Label>
                                <Input
                                    id="cams-report"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.csv,.xls,.xlsx"
                                />
                            </div>
                            {file && (
                                <p className="text-sm text-gray-500">
                                    Selected file: {file.name}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={!file}>
                            <Upload className="mr-2 h-4 w-4" /> Upload and Process
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}


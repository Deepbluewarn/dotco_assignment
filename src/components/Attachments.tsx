'use client'

import { IRequestFile } from "@/interfaces/request";
import { Flex } from "@mantine/core";
import Link from "next/link";

export default function Attachments({ files }: { files: IRequestFile[] }) {
    return (
        <Flex gap={8}>
            {
                files.map(file => {
                    return <Link key={file.file_id} href={`/api/file/${file.file_id}`}>{file.filename}</Link>
                })
            }
        </Flex>
    )
}
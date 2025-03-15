'use client'

import { Button } from "@mantine/core";
import Link from "next/link";

export default function Main() {
    return (
        <>
            <Button component={Link} href={'/request'}>새 요청</Button>
            <Button component={Link} href={'/request/list'}>요청 목록</Button>
        </>
    )
}
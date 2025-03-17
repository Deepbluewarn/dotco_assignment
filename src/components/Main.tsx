'use client'

import { Button, Flex } from "@mantine/core";
import Link from "next/link";

export default function Main() {
    return (
        <Flex gap='md'>
            <Button component={Link} href={'/request'}>새 요청</Button>
            <Button component={Link} href={'/request/list'}>요청 목록</Button>
        </Flex>
    )
}
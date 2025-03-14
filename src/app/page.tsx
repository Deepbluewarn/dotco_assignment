import { logout } from '@/actions/auth';
import { Box, Button, Flex, Title } from '@mantine/core';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = await cookies();
  const user = cookieStore.get('user_id');

  return (
    <Box m={32}>
      <Title order={1}>금형 주문 관리 시스템</Title>

      <Flex gap={8}>
        {
          typeof user === 'undefined' ? (
            <>
              <Button component={Link} href={'/auth/login'}>로그인</Button>
              <Button component={Link} href={'/auth/register'}>회원 가입</Button>
            </>
          ) : (
            <>
                <form action={logout}>
                  <Button type="submit">로그아웃</Button>
                </form>
            </>
          )
        }
      </Flex>
    </Box>
  )
}
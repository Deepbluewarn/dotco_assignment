import { logout } from '@/actions/auth';
import { getUserInfo } from '@/actions/user';
import Main from '@/components/Main';
import { Box, Button, Flex, Title } from '@mantine/core';
import Link from 'next/link';

export default async function Home() {
  const user = await getUserInfo(true);
  
  return (
    <Box m={32}>
      <Title order={1}>금형 주문 관리 시스템</Title>

      <Flex gap={8}>
        {
          !user ? (
            <>
              <Button component={Link} href={'/auth/login'}>로그인</Button>
              <Button component={Link} href={'/auth/register'}>회원 가입</Button>
            </>
          ) : (
            <Flex direction={'column'} gap={8}>
              <form action={logout}>
                <Button type="submit">로그아웃</Button>
              </form>

              <Flex>
                <Main />
              </Flex>
            </Flex>
          )
        }
      </Flex>
    </Box>
  )
}
import { getUserInfo } from '@/actions/user';
import Main from '@/components/Main';
import { 
  Box, Paper, Title, 
  Text, Stack, Card 
} from '@mantine/core';

export default async function Home() {
  const user = await getUserInfo(true);

  return (
    <>
      {!user ? (
        <Card withBorder shadow="md" p="xl" radius="md">
          <Stack align="center" gap="lg" py="xl">
            <Title order={1} ta="center">금형 주문 관리 시스템</Title>
            <Text size="lg" c="dimmed" ta="center" maw={680} mx="auto">
              금형 주문 관리 시스템에 오신 것을 환영합니다.
              우리 시스템을 통해 금형 제작 요청, 견적 관리, 생산 현황 관리까지 모든 과정을 효율적으로 관리하세요.
            </Text>
            <Text size="md" ta="center" maw={680} mx="auto">
              시스템을 이용하시려면 로그인하거나 계정을 생성해주세요.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="lg">
          <Box>
            <Paper p="md" withBorder radius="md">
              <Main />
            </Paper>
          </Box>
        </Stack>
      )}
    </>
  );
}
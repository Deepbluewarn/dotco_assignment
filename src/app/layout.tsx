import type { Metadata } from "next";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps, Box, Group, Text, Button, Divider, NavLink, Container, Flex } from '@mantine/core';
import { getUserInfo } from "@/actions/user";
import { logout } from "@/actions/auth";
import localFont from "next/font/local";
import Link from "next/link";
import { IconHome, IconPackage, IconFileDescription, IconUsers, IconLogout } from '@tabler/icons-react';

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const theme = createTheme({
  fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
});

// 역할에 따른 한글 이름 매핑
const roleNames: Record<string, string> = {
  'CLIENT': '발주사',
  'SUPPLIER': '공급사',
  'DOTCO_ADMIN': '관리자',
};

export const metadata: Metadata = {
  title: "금형 주문 관리 시스템",
  description: "금형 주문 및 관리 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 사용자 정보 가져오기
  const user = await getUserInfo(false);
  
  return (
    <html lang="ko" className={pretendard.className} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {/* 헤더 */}
          <Box
            component="header"
            h={60}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              backgroundColor: 'white',
              borderBottom: '1px solid #e9ecef',
            }}
          >
            <Container size="xl" h="100%">
              <Group h="100%" justify="space-between">
                <Group>
                  <Text component={Link} href="/" fw={700} size="lg">
                    금형 주문 관리 시스템
                  </Text>
                </Group>
                
                {user ? (
                  <Group>
                    <Group>
                      <Text fw={500}>{user.name}</Text>
                      <Text size="sm" c="dimmed">
                        {roleNames[user.role] || user.role}
                      </Text>
                      <Text size="sm" c="dimmed">|</Text>
                      <Text size="sm" c="dimmed">{user.company_name}</Text>
                    </Group>
                    <Divider orientation="vertical" />
                    <form action={logout}>
                      <Button 
                        type="submit" 
                        variant="subtle" 
                        color="gray" 
                        leftSection={<IconLogout size={16} />}
                      >
                        로그아웃
                      </Button>
                    </form>
                  </Group>
                ) : (
                  <Group>
                    <Button component={Link} href="/auth/login" variant="light">로그인</Button>
                    <Button component={Link} href="/auth/register" variant="filled">회원가입</Button>
                  </Group>
                )}
              </Group>
            </Container>
          </Box>

          {/* 메인 컨텐츠 */}
          <Box component="main" pt={60} style={{ minHeight: 'calc(100vh - 60px)' }}>
            <Container size="xl" py="md">
              {children}
            </Container>
          </Box>
        </MantineProvider>
      </body>
    </html>
  );
}
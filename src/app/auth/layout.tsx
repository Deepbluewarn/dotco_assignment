import '@mantine/core/styles.css';
import { Box } from '@mantine/core';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box m={32}>
        {children}
    </Box>
  );
}

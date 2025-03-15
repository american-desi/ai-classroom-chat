import { ReactNode } from 'react';
import { Box, Container, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Flex>
        {user && <Sidebar />}
        <Box flex="1" p={4}>
          <Container maxW="container.xl">
            {children}
          </Container>
        </Box>
      </Flex>
    </Box>
  );
} 
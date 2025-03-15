import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useClassrooms } from '@/hooks/useClassrooms';

interface NavItemProps {
  href: string;
  icon: any;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem = ({ href, icon, children, isActive }: NavItemProps) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link href={href} passHref>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        _hover={{
          bg: hoverBg,
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
          color={isActive ? 'blue.500' : 'gray.500'}
        />
        <Text color={isActive ? 'blue.500' : 'gray.500'}>{children}</Text>
      </Flex>
    </Link>
  );
};

export default function Sidebar() {
  const router = useRouter();
  const { classrooms, isLoading } = useClassrooms();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      w="64"
      h="calc(100vh - 4rem)"
      borderRight="1px"
      borderColor={borderColor}
      pos="sticky"
      top="16"
      pt="4"
    >
      <VStack spacing="1" align="stretch">
        <NavItem
          href="/dashboard"
          icon={() => '📊'}
          isActive={router.pathname === '/dashboard'}
        >
          Dashboard
        </NavItem>
        <NavItem
          href="/classroom"
          icon={() => '👥'}
          isActive={router.pathname === '/classroom'}
        >
          My Classrooms
        </NavItem>
        <NavItem
          href="/analytics"
          icon={() => '📈'}
          isActive={router.pathname === '/analytics'}
        >
          Analytics
        </NavItem>
      </VStack>

      <Divider my="4" borderColor={borderColor} />

      <Box px="4">
        <Text fontSize="sm" fontWeight="medium" color="gray.500" mb="2">
          Active Classrooms
        </Text>
        <VStack spacing="1" align="stretch">
          {!isLoading &&
            classrooms?.map((classroom) => (
              <Link
                key={classroom.id}
                href={`/classroom/${classroom.id}`}
                passHref
              >
                <Flex
                  p="2"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  align="center"
                >
                  <Text fontSize="sm" noOfLines={1}>
                    {classroom.name}
                  </Text>
                </Flex>
              </Link>
            ))}
        </VStack>
      </Box>
    </Box>
  );
} 
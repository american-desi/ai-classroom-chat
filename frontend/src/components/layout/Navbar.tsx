import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  return (
    <Box bg={bgColor} px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Link href="/" passHref>
          <Text fontSize="xl" fontWeight="bold" cursor="pointer">
            AI Classroom
          </Text>
        </Link>

        <Flex alignItems="center">
          {user ? (
            <Stack direction="row" spacing={4} align="center">
              <Link href="/classroom/create" passHref>
                <Button colorScheme="blue" size="sm">
                  Create Classroom
                </Button>
              </Link>

              <Menu>
                <MenuButton>
                  <Avatar
                    size="sm"
                    name={user.displayName || undefined}
                    src={user.photoURL || undefined}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={Link} href="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem as={Link} href="/dashboard">
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          ) : (
            <Stack direction="row" spacing={4}>
              <Link href="/auth/signin" passHref>
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup" passHref>
                <Button colorScheme="blue">Sign Up</Button>
              </Link>
            </Stack>
          )}
        </Flex>
      </Flex>
    </Box>
  );
} 
import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Container,
  Divider,
  Center,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box bg="white" p={8} rounded="lg" shadow="base">
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Sign In to AI Classroom
          </Text>

          <form onSubmit={handleSignIn}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Center>
            <Stack spacing={3} align="center">
              <Divider />
              <Text color="gray.500">or</Text>
              <Button
                w="full"
                variant="outline"
                leftIcon={<Text>G</Text>}
                onClick={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
            </Stack>
          </Center>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link href="/auth/signup" passHref>
              <Text as="span" color="blue.500" cursor="pointer">
                Sign up
              </Text>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
} 
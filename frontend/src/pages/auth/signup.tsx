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
  RadioGroup,
  Radio,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signUp(email, password, role);
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

  return (
    <Container maxW="container.sm" py={10}>
      <Box bg="white" p={8} rounded="lg" shadow="base">
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Create your Account
          </Text>

          <form onSubmit={handleSignUp}>
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

              <FormControl as="fieldset" isRequired>
                <FormLabel as="legend">I am a:</FormLabel>
                <RadioGroup value={role} onChange={(value: 'student' | 'teacher') => setRole(value)}>
                  <Stack direction="row" spacing={4}>
                    <Radio value="student">Student</Radio>
                    <Radio value="teacher">Teacher</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Sign up
              </Button>
            </Stack>
          </form>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link href="/auth/signin" passHref>
              <Text as="span" color="blue.500" cursor="pointer">
                Sign in
              </Text>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
} 
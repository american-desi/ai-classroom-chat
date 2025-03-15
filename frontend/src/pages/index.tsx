import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  useColorModeValue,
  Flex,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Chat from '@/components/chat/Chat';
import { FcGoogle } from 'react-icons/fc';

export default function Home() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={20}>
        <Stack spacing={16}>
          <Stack spacing={8} alignItems="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, blue.600)"
              backgroundClip="text"
            >
              Welcome to AI Classroom
            </Heading>
            
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              An innovative platform that combines traditional classroom learning with
              AI-powered assistance to create an engaging and effective learning experience.
            </Text>

            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              {user ? (
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={() => router.push('/auth/signin')}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/auth/signup')}
                  >
                    Sign Up
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Icon as={FcGoogle} />}
                    onClick={handleGoogleSignIn}
                  >
                    Sign in with Google
                  </Button>
                </>
              )}
            </Stack>
          </Stack>

          <Box>
            <Heading as="h2" size="lg" textAlign="center" mb={8}>
              Try Our AI Assistant
            </Heading>
            <Flex justify="center">
              <Box w={{ base: "100%", md: "70%" }}>
                <Chat isDemo={true} />
              </Box>
            </Flex>
          </Box>

          <Stack spacing={8}>
            <Divider />
            <Heading as="h2" size="xl" textAlign="center">
              Features
            </Heading>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={8}
              justify="center"
            >
              <Box
                p={6}
                bg="white"
                rounded="lg"
                shadow="base"
                maxW="sm"
                flex={1}
              >
                <Heading size="md" mb={4}>
                  Virtual Classrooms
                </Heading>
                <Text color="gray.600">
                  Create and manage virtual classrooms with real-time interaction
                  between teachers and students.
                </Text>
              </Box>

              <Box
                p={6}
                bg="white"
                rounded="lg"
                shadow="base"
                maxW="sm"
                flex={1}
              >
                <Heading size="md" mb={4}>
                  AI Assistance
                </Heading>
                <Text color="gray.600">
                  Get intelligent support for learning and teaching with our
                  advanced AI system powered by OpenAI's GPT-3.5.
                </Text>
              </Box>

              <Box
                p={6}
                bg="white"
                rounded="lg"
                shadow="base"
                maxW="sm"
                flex={1}
              >
                <Heading size="md" mb={4}>
                  Interactive Learning
                </Heading>
                <Text color="gray.600">
                  Engage in interactive discussions, assignments, and assessments
                  with immediate feedback.
                </Text>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
} 
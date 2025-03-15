import { useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useClassrooms } from '@/hooks/useClassrooms';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { classrooms, loading: classroomsLoading } = useClassrooms();
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading || classroomsLoading) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <Box>
        <Box mb={8}>
          <Heading size="lg">Welcome, {user.email}</Heading>
          <Text color="gray.600">Here's an overview of your classrooms</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Stat p={4} bg={cardBg} rounded="lg" shadow="base">
            <StatLabel>Total Classrooms</StatLabel>
            <StatNumber>{classrooms.length}</StatNumber>
            <StatHelpText>Active classrooms</StatHelpText>
          </Stat>

          {user.role === 'teacher' && (
            <>
              <Stat p={4} bg={cardBg} rounded="lg" shadow="base">
                <StatLabel>Total Students</StatLabel>
                <StatNumber>
                  {classrooms.reduce((acc, classroom) => acc + classroom.students.length, 0)}
                </StatNumber>
                <StatHelpText>Across all classrooms</StatHelpText>
              </Stat>

              <Link href="/classroom/create" passHref>
                <Button
                  as="a"
                  height="100%"
                  w="100%"
                  bg={cardBg}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  rounded="lg"
                  shadow="base"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                >
                  <Text fontSize="lg">Create New Classroom</Text>
                  <Text fontSize="sm" color="gray.500">
                    Get started with a new class
                  </Text>
                </Button>
              </Link>
            </>
          )}
        </SimpleGrid>

        <Heading size="md" mb={4}>
          Your Classrooms
        </Heading>

        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {classrooms.map((classroom) => (
            <Link key={classroom.id} href={`/classroom/${classroom.id}`} passHref>
              <Box
                as="a"
                p={6}
                bg={cardBg}
                rounded="lg"
                shadow="base"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <Heading size="md" mb={2}>
                  {classroom.name}
                </Heading>
                <Text color="gray.600" noOfLines={2} mb={4}>
                  {classroom.description}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {classroom.students.length} students
                </Text>
              </Box>
            </Link>
          ))}
        </Grid>
      </Box>
    </MainLayout>
  );
} 
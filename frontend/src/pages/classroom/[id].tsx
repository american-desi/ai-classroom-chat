import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  List,
  ListItem,
  Avatar,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase';
import type { Classroom } from '@/hooks/useClassrooms';

export default function ClassroomDetail() {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  useEffect(() => {
    const fetchClassroom = async () => {
      if (!id) return;

      try {
        const docRef = doc(firestore, 'classrooms', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClassroom({
            id: docSnap.id,
            ...docSnap.data(),
          } as Classroom);
        } else {
          toast({
            title: 'Error',
            description: 'Classroom not found',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          router.push('/dashboard');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [id, router, toast]);

  if (loading || !classroom) {
    return <Text>Loading...</Text>;
  }

  const isTeacher = user?.uid === classroom.teacherId;

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          <Box>
            <Heading size="lg" mb={2}>{classroom.name}</Heading>
            <Text color="gray.600">{classroom.description}</Text>
          </Box>

          <Tabs>
            <TabList>
              <Tab>Chat</Tab>
              <Tab>Students</Tab>
              {isTeacher && <Tab>Settings</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel>
                <Box bg="white" p={6} rounded="lg" shadow="base" minH="60vh">
                  {/* Chat interface will be implemented here */}
                  <Text>Chat interface coming soon...</Text>
                </Box>
              </TabPanel>

              <TabPanel>
                <Box bg="white" p={6} rounded="lg" shadow="base">
                  <Stack spacing={4}>
                    <Heading size="md">Students ({classroom.students.length})</Heading>
                    <List spacing={3}>
                      {classroom.students.map((studentId) => (
                        <ListItem key={studentId}>
                          <Stack direction="row" align="center" spacing={3}>
                            <Avatar size="sm" />
                            <Text>{studentId}</Text>
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </Box>
              </TabPanel>

              {isTeacher && (
                <TabPanel>
                  <Box bg="white" p={6} rounded="lg" shadow="base">
                    <Stack spacing={4}>
                      <Heading size="md">Classroom Settings</Heading>
                      {/* Add classroom settings here */}
                      <Text>Settings interface coming soon...</Text>
                    </Stack>
                  </Box>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Stack>
      </Container>
    </MainLayout>
  );
} 
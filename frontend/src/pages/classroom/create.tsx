import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  useToast,
  Container,
  Heading,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { addDoc, collection } from 'firebase/firestore';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase';

export default function CreateClassroom() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to create a classroom');
      }

      if (user.role !== 'teacher') {
        throw new Error('Only teachers can create classrooms');
      }

      const classroomData = {
        name,
        description,
        teacherId: user.uid,
        createdAt: new Date().toISOString(),
        students: [],
      };

      const docRef = await addDoc(collection(firestore, 'classrooms'), classroomData);
      
      toast({
        title: 'Success',
        description: 'Classroom created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push(`/classroom/${docRef.id}`);
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
    <MainLayout>
      <Container maxW="container.md" py={8}>
        <Stack spacing={8}>
          <Heading size="lg">Create New Classroom</Heading>

          <Box bg="white" p={6} rounded="lg" shadow="base">
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Classroom Name</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter classroom name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter classroom description"
                    rows={4}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={isLoading}
                >
                  Create Classroom
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </MainLayout>
  );
} 
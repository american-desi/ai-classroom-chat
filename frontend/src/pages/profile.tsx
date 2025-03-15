import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase';

interface UserProfile {
  email: string;
  role: 'student' | 'teacher';
  displayName?: string;
  createdAt: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setDisplayName(data.displayName || '');
        }
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

    fetchProfile();
  }, [user, router, toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const docRef = doc(firestore, 'users', user.uid);
      await updateDoc(docRef, {
        displayName,
      });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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

  if (!user || !profile) {
    return <Text>Loading...</Text>;
  }

  return (
    <MainLayout>
      <Container maxW="container.md" py={8}>
        <Stack spacing={8}>
          <Box textAlign="center">
            <Avatar
              size="2xl"
              name={displayName || user.email || undefined}
              src={user.photoURL || undefined}
              mb={4}
            />
            <Heading size="lg">{displayName || 'Your Profile'}</Heading>
            <Badge colorScheme={profile.role === 'teacher' ? 'green' : 'blue'}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Badge>
          </Box>

          <Box bg="white" p={6} rounded="lg" shadow="base">
            <form onSubmit={handleUpdateProfile}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={profile.email} isReadOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>Display Name</FormLabel>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Member Since</FormLabel>
                  <Input
                    value={new Date(profile.createdAt).toLocaleDateString()}
                    isReadOnly
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                >
                  Update Profile
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </MainLayout>
  );
} 
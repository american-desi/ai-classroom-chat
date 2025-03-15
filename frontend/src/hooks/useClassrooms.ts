import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  createdAt: string;
  students: string[];
}

export const useClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setClassrooms([]);
      setLoading(false);
      return;
    }

    const classroomsRef = collection(firestore, 'classrooms');
    let q;

    if (user.role === 'teacher') {
      q = query(classroomsRef, where('teacherId', '==', user.uid));
    } else {
      q = query(classroomsRef, where('students', 'array-contains', user.uid));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const classroomData: Classroom[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          classroomData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            teacherId: data.teacherId,
            createdAt: data.createdAt,
            students: data.students || [],
          });
        });
        setClassrooms(classroomData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { classrooms, loading, error };
}; 
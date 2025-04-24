import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { ActorList } from '../components/ActorList';
import { Actor } from '../types';
import { useActorModal } from '../hooks/useActorModal';

const API_URL = 'http://localhost:3001/api';

export function HallOfShamePage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onOpen } = useActorModal();

  useEffect(() => {
    const fetchBottomActors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/actors/bottom`); // Fetch bottom actors
        if (!response.ok) {
          throw new Error('Failed to fetch Hall of Shame');
        }
        const data = await response.json();
        setActors(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
        console.error('Error fetching bottom actors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBottomActors();
  }, []);

  const handleRate = (mode: 'rate', actor: Actor) => {
    console.warn('Rate functionality needs connection if modal isn\'t part of this page structure');
    onOpen(mode, actor);
  };

  return (
    <Box>
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Hall of Shame - Bottom 10 Rated
      </Heading>
      {loading && <Spinner size="xl" display="block" mx="auto" my={10} />}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {!loading && !error && actors.length > 0 && (
        <ActorList actors={actors} onRate={handleRate} onViewHistory={() => {}} />
      )}
      {!loading && !error && actors.length === 0 && (
        <Text textAlign="center">No actors found in the Hall of Shame yet.</Text>
      )}
    </Box>
  );
} 
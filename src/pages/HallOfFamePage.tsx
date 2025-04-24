import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { ActorList } from '../components/ActorList';
import { Actor } from '../types';
import { useActorModal } from '../hooks/useActorModal'; // We might need the modal logic here too

const API_URL = 'http://localhost:3001/api';

export function HallOfFamePage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onOpen } = useActorModal(); // Correctly destructure onOpen

  useEffect(() => {
    const fetchTopActors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/actors/top`);
        if (!response.ok) {
          throw new Error('Failed to fetch Hall of Fame');
        }
        const data = await response.json();
        setActors(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
        console.error('Error fetching top actors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopActors();
  }, []);

  // We need a way to open the rating modal from this page too.
  // Option 1: Pass down modal handlers (complex)
  // Option 2: Create a shared hook for modal state (better)
  // Option 3: Have ActorList handle its own modal opening (encapsulation)
  // Let's assume for now ActorList might need adjustment or we use a shared hook later.
  // For now, we'll pass a placeholder or the hook's handler.
  const handleRate = (mode: 'rate', actor: Actor) => {
    console.warn('Rate functionality needs connection if modal isn\'t part of this page structure');
    onOpen(mode, actor); // Use the onOpen from the hook
  };

  return (
    <Box>
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Hall of Fame - Top 10 Rated
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
        <Text textAlign="center">No actors found in the Hall of Fame yet.</Text>
      )}
    </Box>
  );
} 
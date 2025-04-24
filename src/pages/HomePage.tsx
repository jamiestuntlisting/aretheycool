import React, { useState, useEffect } from 'react';
import { Box, Input, Button, Text, VStack, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { ActorList } from '../components/ActorList';
import { Actor } from '../types';
import { useActorModal } from '../hooks/useActorModal';

const API_URL = 'http://localhost:3001/api';

interface HomePageProps {
  // Define any props needed from App, like the modal hook results
  onOpenModal: (mode: 'add' | 'rate', actor?: Actor, searchTerm?: string) => void;
}

export function HomePage({ onOpenModal }: HomePageProps) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state if needed
  const [error, setError] = useState<string | null>(null); // Add error state

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Delay of 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchActors(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const fetchActors = async (currentSearchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      // Modify the URL based on whether there's a search term
      const url = currentSearchTerm
        ? `${API_URL}/actors?search=${encodeURIComponent(currentSearchTerm)}`
        : `${API_URL}/actors`; // Fetch all if search term is empty

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch actors');
      }
      const data = await response.json();
      setActors(data.actors);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      console.error('Error fetching actors:', err);
      // Optionally show toast here if toast hook is passed down or used globally
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Function to refresh actors after adding/rating (could be passed down or handled via global state)
  const refreshActors = () => {
    fetchActors(debouncedSearchTerm);
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Input
          placeholder="Search for an actor..."
          size="lg"
          value={searchTerm}
          onChange={handleSearchChange}
          variant="filled"
          focusBorderColor="blue.500"
        />
      </Box>

      {/* Loading State */}
      {loading && <Spinner size="xl" display="block" mx="auto" my={10} />}

      {/* Error State */}
      {error && !loading && (
        <Alert status="error" borderRadius="lg" shadow="sm">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* No Results Message */}
      {searchTerm && !loading && !error && actors.length === 0 && (
        <Box textAlign="center" p={6} bg="white" borderRadius="lg" shadow="sm">
          <Text mb={4}>No actors found matching "{searchTerm}"</Text>
          <Button colorScheme="blue" onClick={() => onOpenModal('add', undefined, searchTerm)}>
            Add "{searchTerm}" as New Actor
          </Button>
        </Box>
      )}

      {/* Actor List - Render only if not loading and no error */}
      {!loading && !error && (
        <ActorList
          actors={actors}
          onRate={(mode, actor) => onOpenModal(mode, actor)} // Pass modal opener
          onViewHistory={() => { console.log('View History Clicked - Connect handler')}} // Connect if needed
        />
      )}
      {/* Note: The Add/Rate modal itself will likely live in App.tsx */}
    </VStack>
  );
} 
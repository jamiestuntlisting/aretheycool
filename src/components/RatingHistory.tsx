import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Divider,
} from '@chakra-ui/react';

interface Rating {
  id: number;
  score: number;
  note: string | null;
  createdAt: string;
}

interface RatingHistoryProps {
  actorId: number;
  actorName: string;
}

export function RatingHistory({ actorId, actorName }: RatingHistoryProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/actors/${actorId}/ratings`);
        const data = await response.json();
        setRatings(data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, [actorId]);

  return (
    <Box>
      <Heading size="md" mb={4}>Rating History for {actorName}</Heading>
      <VStack spacing={4} align="stretch">
        {ratings.map((rating) => (
          <Box key={rating.id} p={4} borderWidth="1px" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" color={rating.score >= 0 ? "green.500" : "red.500"}>
              Rating: {rating.score > 0 ? '+' : ''}{rating.score}
            </Text>
            {rating.note && (
              <Text mt={2}>{rating.note}</Text>
            )}
            <Text fontSize="sm" color="gray.500" mt={2}>
              {new Date(rating.createdAt).toLocaleDateString()} {new Date(rating.createdAt).toLocaleTimeString()}
            </Text>
          </Box>
        ))}
        {ratings.length === 0 && (
          <Text color="gray.500">No ratings yet</Text>
        )}
      </VStack>
    </Box>
  );
} 
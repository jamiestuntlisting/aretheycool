import React, { useState } from 'react';
import {
  VStack,
  Box,
  Text,
  Button,
  HStack,
  Link,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { Actor } from '../types';

interface ActorListProps {
  actors: Actor[];
  onRate: (mode: 'rate', actor: Actor) => void;
  onViewHistory: (actor: Actor) => void;
}

export function ActorList({ actors, onRate }: ActorListProps) {
  const [expandedActors, setExpandedActors] = useState<Record<number, boolean>>({});

  const toggleExpand = (actorId: number) => {
    setExpandedActors(prev => ({
      ...prev,
      [actorId]: !prev[actorId]
    }));
  };

  return (
    <VStack spacing={4} align="stretch">
      {actors.map((actor) => {
        const isExpanded = expandedActors[actor.id];
        const ratings = actor.ratings || [];
        const displayRatings = isExpanded ? ratings : ratings.slice(0, 3);
        const hasMoreRatings = ratings.length > 3;

        return (
          <Box
            key={actor.id}
            p={6}
            shadow="md"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            position="relative"
            bg="white"
            transition="all 0.2s ease-in-out"
            _hover={{
              shadow: 'lg',
              borderColor: 'gray.300',
            }}
          >
            <Flex direction="column" height="100%">
              {/* Header with name and rating */}
              <Flex justify="space-between" align="center" mb={4}>
                <Link 
                  href={actor.imdbUrl} 
                  isExternal 
                  color="blue.600"
                  fontWeight="semibold"
                  fontSize="xl"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {actor.name}
                </Link>
                <Badge 
                  fontSize="lg"
                  px={3}
                  py={1}
                  borderRadius="md"
                  variant="subtle"
                  colorScheme={actor.rating >= 0 ? "green" : "red"}
                  fontWeight="bold"
                >
                  {actor.rating > 0 ? '+' : ''}{actor.rating}
                </Badge>
              </Flex>

              {/* Ratings/Comments Section */}
              <VStack align="stretch" spacing={2} mb={4}>
                {displayRatings.map((rating, index) => (
                  <Box key={rating.id || index} borderLeft="3px solid" 
                       borderColor={rating.score >= 0 ? "green.200" : "red.200"} 
                       pl={3}
                  >
                    <Flex align="baseline" wrap="wrap"> 
                      <Badge 
                        colorScheme={rating.score >= 0 ? "green" : "red"}
                        variant="outline"
                        fontSize="xs"
                        mr={2}
                        verticalAlign="middle"
                      >
                        {rating.score > 0 ? '+' : ''}{rating.score}
                      </Badge>
                      <Text color="gray.700" mr={2} display="inline"> 
                        {rating.note}
                      </Text>
                      <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" display="inline"> 
                        ({new Date(rating.createdAt).toLocaleDateString()})
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </VStack>

              {/* Footer with actions */}
              <Flex justify="space-between" align="flex-end" mt="auto">
                <VStack align="flex-start" spacing={1}>
                  {hasMoreRatings && (
                    <Button
                      size="sm"
                      variant="link"
                      colorScheme="gray"
                      onClick={() => toggleExpand(actor.id)}
                      pb={1}
                    >
                      {isExpanded ? 'Show Less' : 'Show More Comments'}
                    </Button>
                  )}
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => onRate('rate', actor)}
                  >
                    Add Rating
                  </Button>
                </VStack>
                <Text fontSize="sm" color="gray.500">
                  {actor.ratingCount} rating{actor.ratingCount !== 1 ? 's' : ''}
                </Text>
              </Flex>
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
} 
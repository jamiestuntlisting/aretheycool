import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Flex, Link, Heading, Spacer, Image } from '@chakra-ui/react';

export function NavBar() {
  const location = useLocation();

  // Construct the correct logo path using the base URL
  const logoSrc = `${import.meta.env.BASE_URL}logo2.s.png`;

  const linkStyles = (path: string) => ({
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    color: location.pathname === path ? 'blue.600' : 'gray.600',
    textDecoration: location.pathname === path ? 'underline' : 'none',
    _hover: {
      textDecoration: 'underline',
      color: 'blue.500',
    }
  });

  return (
    <Box bg="white" py={3} px={8} mb={8} shadow="sm">
      <Flex align="center">
        <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} mr={8}>
          <Image 
            src={logoSrc}
            alt="Are They Cool? Logo" 
            maxH="40px"
          />
        </Link>
        <Link as={RouterLink} to="/" {...linkStyles('/')} mr={4}>
          Search / Add
        </Link>
        <Link as={RouterLink} to="/hall-of-fame" {...linkStyles('/hall-of-fame')} mr={4}>
          Hall of Fame
        </Link>
        <Link as={RouterLink} to="/hall-of-shame" {...linkStyles('/hall-of-shame')}>
          Hall of Shame
        </Link>
        <Spacer />
        {/* Potential future elements like login/user info */}
      </Flex>
    </Box>
  );
} 
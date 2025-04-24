import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import {
  Box,
  Button,
  ChakraProvider,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

import { NavBar } from './components/NavBar';
import { HomePage } from './pages/HomePage';
import { HallOfFamePage } from './pages/HallOfFamePage';
import { HallOfShamePage } from './pages/HallOfShamePage';
import { RatingHistory } from './components/RatingHistory';
import { Actor } from './types';
import { useActorModal } from './hooks/useActorModal'; // Import the modal hook

const API_URL = 'http://localhost:3001/api';

function AppContent() {
  const toast = useToast();
  // Use the custom hook for modal management
  const {
    isOpen,
    onOpen,
    onClose,
    modalMode,
    selectedActor,
    actorData, // Renamed from newActor for clarity with the hook
    setActorData,
  } = useActorModal();

  // Keep history drawer state here if needed, or move to its own hook
  const { 
    isOpen: isHistoryOpen, 
    onOpen: onHistoryOpen, 
    onClose: onHistoryClose 
  } = useDisclosure();
  const [actorForHistory, setActorForHistory] = useState<Actor | null>(null);

  // Callback to refresh data - placeholder, needs actual implementation
  // if pages need to refresh after modal actions
  const handleDataRefresh = useCallback(() => {
      console.log("Data refresh needed - implement based on page context or global state");
      // This might involve passing a refresh function down or using a state management library
  }, []);

  const handleAddActor = async () => {
    // Parse rating string to number before sending
    const ratingValue = parseFloat(actorData.rating) || 0; 
    if (actorData.name && actorData.imdbUrl) {
      try {
        const response = await fetch(`${API_URL}/actors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...actorData, // Spread existing data (name, imdbUrl, note)
            rating: ratingValue // Send the parsed number
          }),
        });
        if (!response.ok) throw new Error('Failed to add actor');
        await response.json();
        toast({ title: 'Actor Added', status: 'success', duration: 2000, isClosable: true });
        handleDataRefresh(); // Refresh data
        onClose(); // Close modal via hook
      } catch (error: any) {
        console.error('Error adding actor:', error);
        toast({ title: 'Error', description: error.message || 'Failed to add actor', status: 'error', duration: 3000, isClosable: true });
      }
    }
  };

  const handleRateActor = async () => {
    // Parse rating string to number before sending
    const ratingValue = parseFloat(actorData.rating) || 0;
    if (selectedActor && actorData.note) { // Keep note check for rate mode
      try {
        const response = await fetch(`${API_URL}/actors/${selectedActor.id}/ratings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            rating: ratingValue, // Send the parsed number
            note: actorData.note 
          }),
        });
        if (!response.ok) throw new Error('Failed to submit rating');
        await response.json();
        toast({ title: 'Rating Submitted', status: 'success', duration: 2000, isClosable: true });
        handleDataRefresh(); // Refresh data
        onClose(); // Close modal via hook
      } catch (error: any) {
        console.error('Error rating actor:', error);
        toast({ title: 'Error', description: error.message || 'Failed to add rating', status: 'error', duration: 3000, isClosable: true });
      }
    }
  };

  const handleViewHistory = (actor: Actor) => {
    setActorForHistory(actor);
    onHistoryOpen();
  };

   const handleTestUrl = () => {
    if (actorData.imdbUrl) {
      window.open(actorData.imdbUrl, '_blank');
    }
  };

  return (
    <Box bg="gray.100" minH="100vh">
      <NavBar />
      <Container maxW="container.lg" pb={12}> { /* Removed top padding as NavBar has padding */}
        <Routes>
          <Route path="/" element={<HomePage onOpenModal={onOpen} />} />
          <Route path="/hall-of-fame" element={<HallOfFamePage />} />
          <Route path="/hall-of-shame" element={<HallOfShamePage />} />
          {/* Add other routes here if needed */}
        </Routes>
      </Container>

      {/* Modal managed by the hook, rendered centrally in App */}
      <Modal isOpen={isOpen} onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
           <ModalHeader>
             {modalMode === 'add' ? 'Add New Actor' : `Rate ${selectedActor?.name}`}
           </ModalHeader>
           <ModalCloseButton />
           <ModalBody pb={6}>
             {modalMode === 'add' && (
               <>
                 <FormControl>
                   <FormLabel>Name</FormLabel>
                   <Input
                     value={actorData.name}
                     onChange={(e) =>
                       setActorData((prev) => ({ ...prev, name: e.target.value }))
                     }
                   />
                 </FormControl>

                 <FormControl mt={4}>
                   <FormLabel>IMDB URL</FormLabel>
                   <InputGroup>
                     <Input
                       value={actorData.imdbUrl}
                       onChange={(e) =>
                         setActorData((prev) => ({ ...prev, imdbUrl: e.target.value }))
                       }
                     />
                     <InputRightElement width="4.5rem">
                       <Button h="1.75rem" size="sm" onClick={handleTestUrl}>
                         Test
                       </Button>
                     </InputRightElement>
                   </InputGroup>
                   <FormHelperText>
                     Link to the actor's IMDB profile
                   </FormHelperText>
                 </FormControl>
               </>
             )}

             <FormControl mt={4}>
               <FormLabel>Rating</FormLabel>
               <NumberInput
                 value={String(actorData.rating)}
                 onChange={(valueAsString) => {
                   setActorData(prev => ({
                     ...prev,
                     rating: valueAsString,
                   }));
                 }}
                 min={-10}
                 max={10}
                 allowMouseWheel
               >
                 <NumberInputField />
                 <NumberInputStepper>
                   <NumberIncrementStepper />
                   <NumberDecrementStepper />
                 </NumberInputStepper>
               </NumberInput>
               <FormHelperText>
                 Rate from -10 (very difficult) to +10 (amazing)
               </FormHelperText>
             </FormControl>

             <FormControl mt={4}>
               <FormLabel>Note</FormLabel>
               <Textarea
                 value={actorData.note}
                 onChange={(e) =>
                   setActorData((prev) => ({ ...prev, note: e.target.value }))
                 }
                 placeholder="Share your experience..."
               />
             </FormControl>

             <Button
               colorScheme="blue"
               mr={3}
               mt={6}
               onClick={modalMode === 'add' ? handleAddActor : handleRateActor}
             >
               {modalMode === 'add' ? 'Add Actor' : 'Submit Rating'}
             </Button>
           </ModalBody>
         </ModalContent>
       </Modal>

       {/* Rating History Drawer - kept here for now */}
       <Drawer
            isOpen={isHistoryOpen}
            placement="right"
            onClose={onHistoryClose}
            size="md"
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Rating History</DrawerHeader>
              <DrawerBody>
                {actorForHistory && (
                  <RatingHistory
                    actorId={actorForHistory.id}
                    actorName={actorForHistory.name}
                  />
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>

    </Box>
  );
}

// Wrap AppContent with Router and ChakraProvider
function App() {
  return (
    <ChakraProvider>
      <Router>
        <AppContent />
      </Router>
    </ChakraProvider>
  );
}

export default App; 
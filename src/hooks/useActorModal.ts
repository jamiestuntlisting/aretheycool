import { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { Actor } from '../types';

export interface NewActorData {
  name: string;
  imdbUrl: string;
  rating: string;
  note: string;
}

export function useActorModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState<'add' | 'rate'>('add');
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [actorData, setActorData] = useState<NewActorData>({
    name: '',
    imdbUrl: '',
    rating: '',
    note: '',
  });

  const handleOpenModal = (mode: 'add' | 'rate', actor?: Actor, searchTerm?: string) => {
    setModalMode(mode);
    if (mode === 'rate' && actor) {
      setSelectedActor(actor);
      setActorData({
        name: actor.name,
        imdbUrl: actor.imdbUrl,
        rating: '',
        note: '',
      });
    } else { // 'add' mode
      setSelectedActor(null);
      setActorData(prev => ({
        ...prev,
        name: searchTerm || '',
        imdbUrl: searchTerm ? `https://www.imdb.com/find/?q=${encodeURIComponent(searchTerm)}` : '',
        rating: '',
        note: ''
      }));
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedActor(null);
    setActorData({ name: '', imdbUrl: '', rating: '', note: '' }); // Reset form
    onClose();
  };

  return {
    isOpen,
    onOpen: handleOpenModal, // Use the wrapped open handler
    onClose: handleCloseModal, // Use the wrapped close handler
    modalMode,
    selectedActor,
    actorData,
    setActorData,
  };
} 
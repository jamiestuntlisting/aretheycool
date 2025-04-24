"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useActorModal = void 0;
const react_1 = require("react");
const react_2 = require("@chakra-ui/react");
function useActorModal() {
    const { isOpen, onOpen, onClose } = (0, react_2.useDisclosure)();
    const [modalMode, setModalMode] = (0, react_1.useState)('add');
    const [selectedActor, setSelectedActor] = (0, react_1.useState)(null);
    const [actorData, setActorData] = (0, react_1.useState)({
        name: '',
        imdbUrl: '',
        rating: '',
        note: '',
    });
    const handleOpenModal = (mode, actor, searchTerm) => {
        setModalMode(mode);
        if (mode === 'rate' && actor) {
            setSelectedActor(actor);
            setActorData({
                name: actor.name,
                imdbUrl: actor.imdbUrl,
                rating: '',
                note: '',
            });
        }
        else {
            setSelectedActor(null);
            setActorData(prev => (Object.assign(Object.assign({}, prev), { name: searchTerm || '', imdbUrl: searchTerm ? `https://www.imdb.com/find/?q=${encodeURIComponent(searchTerm)}` : '', rating: '', note: '' })));
        }
        onOpen();
    };
    const handleCloseModal = () => {
        setSelectedActor(null);
        setActorData({ name: '', imdbUrl: '', rating: '', note: '' });
        onClose();
    };
    return {
        isOpen,
        onOpen: handleOpenModal,
        onClose: handleCloseModal,
        modalMode,
        selectedActor,
        actorData,
        setActorData,
    };
}
exports.useActorModal = useActorModal;
//# sourceMappingURL=useActorModal.js.map
import { Box, Heading, Modal } from 'react-bulma-components';

export interface GreetingModalProps {
  show: boolean;
  greeting: string;
  onClose: () => void;
}

export const GreetingModal = (props: GreetingModalProps) => (
  <Modal show={props.show} onClose={props.onClose}>
    <Modal.Content>
      <Box className="has-text-centered">
        <Heading>{props.greeting}</Heading>
      </Box>
    </Modal.Content>
  </Modal>
);

export default GreetingModal;

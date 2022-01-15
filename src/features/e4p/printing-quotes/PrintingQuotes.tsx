import { useState } from 'react';
import { Button, Heading, Icon } from 'react-bulma-components';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import QuoteFormModal from './QuoteFormModal';
import QuoteCard from './QuoteCard';
import { addQuote, deleteQuote } from './printingQuotesSlice';

export function PrintingQuotes() {
  const quotes = useAppSelector((state) => state.printingQuotes);
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Heading>Printing Quotes</Heading>
      {quotes.map((quote, index) => (
        <QuoteCard quote={quote} key={index} onDelete={() => dispatch(deleteQuote(index))} />
      ))}
      <Button color="link" fullwidth onClick={() => setShowModal(true)}>
        <Icon>
          <i className="fas fa-plus"></i>
        </Icon>
      </Button>
      <QuoteFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(quote) => dispatch(addQuote(quote))}
      />
    </>
  );
}

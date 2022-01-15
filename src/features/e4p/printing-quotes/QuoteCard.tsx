import { Card, Heading, Icon } from 'react-bulma-components';

import Quote from './Quote';

export interface QuoteCardProps {
  quote: Quote;
  onDelete(): void;
}

export const QuoteCard = ({ quote, onDelete }: QuoteCardProps) => (
  <Card className="mb-5">
    <Card.Content>
      <Heading size={4}>&#x201c;{quote.text}&#x201d;</Heading>
      <Heading size={6} subtitle>
        &mdash; {quote.author}
      </Heading>
    </Card.Content>
    <Card.Footer>
      <Card.Footer.Item renderAs="a" onClick={onDelete}>
        <Icon>
          <i className="fas fa-trash-alt"></i>
        </Icon>
      </Card.Footer.Item>
    </Card.Footer>
  </Card>
);

export default QuoteCard;

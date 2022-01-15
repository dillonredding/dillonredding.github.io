import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Quote from './Quote';

const initialState: Quote[] = [
  {
    text: 'There are only two hard things in Computer Science: cache invalidation and naming things.',
    author: 'Phil Karlton'
  },
  {
    text: 'It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures.',
    author: 'Alan J. Perlis'
  },
  {
    text: 'Premature optimization is the root of all evil (or at least most of it) in programming.',
    author: 'Donald Knuth'
  },
  {
    text: 'There are two methods in software design. One is to make the program so simple, there are obviously no errors. The other is to make it so complicated, there are no obvious errors.',
    author: 'Tony Hoare'
  }
];

export const printingQuotesSlice = createSlice({
  name: 'printing-quotes',
  initialState,
  reducers: {
    addQuote: (state, action: PayloadAction<Quote>) => {
      state.push(action.payload);
    },
    deleteQuote: (state, action: PayloadAction<number>) => {
      state.splice(action.payload, 1);
    }
  }
});

export const { addQuote, deleteQuote } = printingQuotesSlice.actions;

export default printingQuotesSlice.reducer;

// graphql and apollo imports
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { GET_BOOKS_QUERY } from '../queries/queries';

// components
import BookDetails from './BookDetails';


const BookList = () => {
  const [selected, setSelected] = useState(null);

  const { loading, error, data } = useQuery(GET_BOOKS_QUERY);

  if (loading) return <p>Loading books...</p>;
  if (error) return <p>Error loading books</p>;

  // const bookList = data.map(book => 0)
  // const bookList = () => {
  //   return data.books.map(book => {
  //     return <li key={book.id} onClick={e => setSelected(book.id)}>{book.name}</li>
  //   })
  // };

  const bookList = data.books.map(book => {
    return <li key={book.id} onClick={e => setSelected(book.id)}>{book.name}</li>
  });

  console.log(data);


  return (
    <div>
      <ul id="book-list">
        { bookList }
      </ul>
      <BookDetails bookId={selected} />
    </div>
  )
}

export default BookList;
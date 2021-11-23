import { useQuery } from '@apollo/client';
import { GET_BOOK_QUERY } from '../queries/queries';


const BookDetails = (props) => {
  const { loading, error, data } = useQuery(GET_BOOK_QUERY, {
    variables: {
      id: props.bookId
    }
  });

  const displayBookDetails = () => {
    if (loading) return <p>Loading book details...</p>;
    if (!data) return <p>No book selected...</p>;
    if (error) return <p>Error loading book details</p>;

    const { book } = data;
    return (
      <div>
        <h2>{ book.name }</h2>
        <p>Genre: { book.genre }</p>
        <p>Author: { book.author.name }</p>
        <p>All books by this author:</p>
        <ul className="other-books">
          { book.author.books.map(item => <li key={ item.id }>{ item.name }</li>)}
        </ul>
      </div>
    )
  }

  return (
    <div id="book-details">
      { displayBookDetails() }
    </div>
  )
}

export default BookDetails;
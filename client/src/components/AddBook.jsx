import { useQuery, useMutation } from "@apollo/client";
import { useState, useRef } from "react";
import { GET_AUTHORS_QUERY, ADD_BOOK_MUTATION, GET_BOOKS_QUERY } from '../queries/queries';

const AddBook = (props) => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [authorId, setAuthorId] = useState('');

  const getAuthors = useQuery(GET_AUTHORS_QUERY);

  const [addBookMutation, addBook] = useMutation(ADD_BOOK_MUTATION);

  const displayAuthors = () => {
    if (getAuthors.loading) {
      return <option disabled>Loading Authors...</option>;
    } else if (getAuthors.error) {
      return <option disabled>Failed to load authors</option>
    } else {
      return getAuthors.data.authors.map((author) => {
        return <option key={ author.id } value={ author.id }>{ author.name }</option>;
      });
    }
  };

  const formRef = useRef();

  const submitForm = (e) => {
    e.preventDefault();
    console.log(
      `name: ${name} \ngenre: ${genre} \nauthorId: ${authorId}`
    );
    addBookMutation({
      variables: {
        name: name,
        genre: genre,
        authorId: authorId
      },
      refetchQueries: [
        { query: GET_BOOKS_QUERY }
      ]
    });
    formRef.current.reset();
  }

  return (
    <form ref={ formRef } onSubmit={ (e) => submitForm(e) }>
      <div className="field">
        <label>Book name:</label>
        <input type="text" onChange={ e => setName(e.target.value) } />
      </div>

      <div className="field">
        <label>Genre:</label>
        <input type="text" onChange={ e => setGenre(e.target.value) } />
      </div>

      <div className="field">
        <label>Author:</label>
        <select onChange={ e => setAuthorId(e.target.value) }>
          <option>Select author</option>
          { displayAuthors() }
        </select>
      </div>

      <button>+</button>
    </form>
  );
};

export default AddBook;

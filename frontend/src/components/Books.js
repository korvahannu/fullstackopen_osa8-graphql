
import React, {useEffect, useState} from 'react'

import { useLazyQuery, useSubscription } from '@apollo/client';
import { BOOKS_BY_GENRE, BOOK_ADDED } from '../queries';

const BooksT = ({books}) => (
  <table>
    <tbody>
      <tr>
        <th></th>
        <th>
          author
        </th>
        <th>
          published
        </th>
      </tr>
      {books
      .map(a =>
        <tr key={a.title}>
          <td>{a.title}</td>
          <td>{a.author.name}</td>
          <td>{a.published}</td>
        </tr>
      )}
    </tbody>
  </table>
)

const Books = (props) => {

  const [filter, setFilter] = useState('');

  const [getBooks, result] = useLazyQuery(BOOKS_BY_GENRE, { fetchPolicy: "network-only" });

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      getBooks({
        variables: {
          genre: filter
        }
      })
    }
  });

  useEffect( () => {

    getBooks({
      variables: {
        genre: filter
      }
    })

  }, []); //eslint-disable-line


  if (!props.show) {
    return null
  }

  if(result.loading || result.data === undefined)
    return <div>loading books...</div>

  const books = props.books;

  let genres = [];
  books.forEach(book => {
    book.genres.forEach(genre => {
      genres.push(genre);
    });
  });
  genres = Array.from(new Set(genres));


  return (
    <div>
      <h2>books</h2>

      {
        filter === ''
        ? null
        : <div>filtering with genre <b>{filter}</b><hr/></div>
      }

      <BooksT books={result.data.allBooks} />

      
      <hr />
      select genre to filter with: 
          {
            genres.map(genre =>
              <button key={genre} onClick={() => setFilter(genre)}>{genre}</button>
              )
          }
    </div>
  )
}

export default Books
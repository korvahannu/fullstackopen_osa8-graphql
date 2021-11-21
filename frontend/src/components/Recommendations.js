import React, { useEffect } from "react";
import { useLazyQuery } from '@apollo/client';
import { CURRENT_USER, BOOKS_BY_GENRE } from '../queries';

const Recommendations = (props) => {

  const [getUser, userResult] = useLazyQuery(CURRENT_USER);
  const [getBooks, booksResult] = useLazyQuery(BOOKS_BY_GENRE);

  /*
    Nämä tiedot haetaan edelleen vanhalla tyylillä eli ilman subscriptionia, Books.js hakee subscriptioneita hyödyntäen.
    Jätin tätä vanhaa koodia tähän omaa tulevaisuutta ajatellen, kun näihin tulee aina aika-ajoin palattua :-)
  */

  useEffect(() => { // Eka haetaan käyttäjän tiedot
    if(props.show)
    {
      getUser();
    }
  }, [props.show]); //eslint-disable-line

  useEffect( () => {  // Kun käyttäjän tiedon muuttuu, haetaan hänen kirjat

    if(userResult.data !== null && userResult.data !== undefined
      && userResult.data.me !== null && userResult.data.me !== undefined) {
      getBooks({
        variables: {
          genre:userResult.data.me.favoriteGenre
        }
      })
    }

  }, [userResult.data]) //eslint-disable-line

  if(!props.show)
  return null;

  if(userResult.loading || userResult.data === undefined)
    return <div>loading user...</div>

  if(booksResult.loading || booksResult.data === undefined)
    return <div>loading books...</div>

  let user = userResult.data.me;
  let books = booksResult.data.allBooks;

  return(
    <div>
      <div>
        <h2>Recommendations</h2></div>
      <div>
        books in your favorite genre <b>{user.favoriteGenre}</b>

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
          {books.filter(b => b.genres.includes(user.favoriteGenre))
          .map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  )
}

export default Recommendations;
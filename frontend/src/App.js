import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries'

const updateBooksCache = (client, newBook) => {

  const includedIn = (set, object) => set.map(b => b.id).includes(object.id);

  const storedData = client.readQuery({query:ALL_BOOKS});

  if(!includedIn(storedData.allBooks, newBook)) { // Jos nykyisessä storessa ei ole uutta kirjaa
    client.writeQuery({
      query: ALL_BOOKS,
      data: { allBooks : storedData.allBooks.concat(newBook) }  // Eli aina kun uusi kirja lisätään, päivitetään välimuistiin
      
    })

    console.log('updated cache')
  }


};

const App = () => {

  const [token, setToken] = useState(null);
  const [page, setPage] = useState('authors')
  const ALL_AUTHORS_result = useQuery(ALL_AUTHORS);
  const ALL_BOOKS_result = useQuery(ALL_BOOKS)
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
        window.alert(`Book ${subscriptionData.data.bookAdded.title} by ${subscriptionData.data.bookAdded.author.name} has been added to the list of books!`);
        updateBooksCache(client, subscriptionData.data.bookAdded)
    }
  });

  const logout = () => {
    setPage('authors')
    setToken(null);
    localStorage.removeItem('kirjasto-user');
    client.resetStore();
  }

  useEffect( () => {

    const user = window.localStorage.getItem('kirjasto-user');

    if(user)
    {
      setToken(user);
    }

  }, [])

  if(ALL_AUTHORS_result.loading || ALL_BOOKS_result.loading)
  {
    return <div>Loading...</div>
  }
  return (
    <div style={{width:'1024px', marginLeft:'auto', marginRight:'auto', paddingTop:'64px'}}>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {
          token
          ? <span><button onClick={() => setPage('add')}>add book</button><button onClick={() => setPage('recommendations')}>recommendations</button><button onClick={logout}>Logout</button></span>
          : <button onClick={()=> setPage('login')}>login</button>
        }
      </div>

      <Authors
        token={token}
        authors = {ALL_AUTHORS_result.data.allAuthors}
        show={page === 'authors'}
      />

      <Books
        books = {ALL_BOOKS_result.data.allBooks}
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
        bookAdded={()=>setPage('books')}
      />

      <Recommendations
        token = {token}
        books = {ALL_BOOKS_result.data.allBooks}
        show={page === 'recommendations'}
      />

      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        finishLogin={()=>setPage('authors')}
      />

    </div>
  )
}

export default App
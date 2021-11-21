import { gql } from '@apollo/client';

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name,
      born,
      books
    }
  }
`;

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title,
      published,
      author {
        name
      },
      genres
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addNewBook($title: String!, $published:Int!, $author:String!, $genres:[String!]!)
  {

    addBook(title:$title, published:$published, author:$author, genres:$genres) {
      title,
      author {
        name
      },
      published,
      genres
    }

  }
`;

export const EDIT_AUTHOR = gql` 
  mutation editSingleAuthor($name: String!, $setBornTo: Int!)
  {

    editAuthor(name:$name, setBornTo:$setBornTo) {
      name,
      born
    }

  }
`;

export const LOGIN = gql`
  mutation userLogin($username: String!, $password: String!)
  {

    login(username:$username, password:$password) {
      value
    }

  }
`;

export const CURRENT_USER = gql`
  query{
    me {
      username,
      favoriteGenre
    }
  }
`;

export const BOOKS_BY_GENRE = gql`
  query booksByGenre($genre:String!){
    allBooks(genre:$genre) {
      title,
      published,
      genres,
      author {
        name
      }
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title,
      published,
      genres,
      author {
        name
      }
    }
  }
`;
import React from 'react'
import EditAuthor from './EditAuthor';

const Authors = (props) => {
  if (!props.show) {
    return null
  }
  const authors = props.authors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.books}</td>
            </tr>
          )}
        </tbody>
      </table>
      {
        props.token
        ? <EditAuthor authors={authors.map(a => a.name)}/>
        : null
      }
    </div>
  )
}

export default Authors
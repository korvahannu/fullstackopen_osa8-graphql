import React, { useState } from "react";
import { EDIT_AUTHOR, ALL_AUTHORS, ALL_BOOKS } from "../queries";
import { useMutation } from "@apollo/client";

const EditAuthor = (props) => {

  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const [ editSingleAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries:[{query:ALL_BOOKS}, {query:ALL_AUTHORS}]
  });

  const submit = (event) => {
    event.preventDefault();

    const b = parseInt(born);

    if(b)
    editSingleAuthor({
      variables: {
        name,
        setBornTo: b
      }
    })


    setName('');
    setBorn('')
  }

  return(
    <div>
      <h2>edit authors</h2>
      <form onSubmit={submit}>
        <select onChange={({target})=>setName(target.value)}>
          {
            props.authors.map(a => <option value={a} key={a}>{a}</option>)
          }
        </select>
        <div>
          born: <input type='text' name='born' value={born} onChange={({target}) => setBorn(target.value)}/>
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>

  )
}

export default EditAuthor;
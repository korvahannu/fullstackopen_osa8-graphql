import React, {useEffect, useState} from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries';
import { useApolloClient } from '@apollo/client'

const LoginForm = ({setToken, show, setUser, finishLogin}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [login, result] = useMutation(LOGIN, {    onError: (error) => {
    finishLogin();
  }
});
  const client = useApolloClient();

  useEffect(()=> {  // Kun result.data muuttuu login mutaation avulla, asetetaan se tokeniksi

    if(result.data)
      updateUser();

  },[result.data]); // eslint-disable-line

  const updateUser = async () => {

    const token = result.data.login.value;
    setToken(token);
    localStorage.setItem('kirjasto-user', token);
    await client.refetchQueries({
      include: "active",
    });

  }

  const submit = (event) => {
    event.preventDefault();


    login({
      variables: {
        username, password
      }
    });

    setUsername('');
    setPassword('');

    finishLogin();
  };

  if(!show)
    return null

  return(
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        Username <input type='text' value={username} onChange={({target})=>setUsername(target.value)} /> <br />
        Password <input type='password' value={password} onChange={({target})=>setPassword(target.value)} /> <br />
        <button type='submit'>Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
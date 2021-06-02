import { createContext, useEffect, useState } from "react";
import { setCookie, parseCookies } from 'nookies';
import Router from 'next/router';

import api from '../services/api';

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
}

type SignInData = {
  email: string;
  password: string;
}

type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({children}) {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user;


  useEffect(() => {
    const { 'nextauth-token': token } = parseCookies();

    if(token){
      api.get<{user: User}>('/recoveryUser').then(response => setUser(response.data.user));
    }
  }, [])

  async function signIn({email, password}: SignInData) {
    try{
      const response = await api.post('/auth', {email, password});
      
      const token = response.headers['authorization'];
      const { user } = response.data;
  
      setCookie(undefined, 'nextauth-token', token, {
        maxAge: 60 * 60 * 1, // 1 hour
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;
  
      setUser(user);
      Router.push('/dashboard');
    }catch(error){
      alert('usuario ou senha incorreto');
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
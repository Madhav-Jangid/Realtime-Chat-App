import { SignUp } from '@clerk/clerk-react';
import React, { useEffect } from 'react';
import NavBar from '../Components/NavBar';

export default function Register() {

    useEffect(() => {
        document.title = 'Register'
    }, [])
    return (
        <section className='page'>
            <NavBar />
            <SignUp signInUrl="/login" />
        </section>
    )
}

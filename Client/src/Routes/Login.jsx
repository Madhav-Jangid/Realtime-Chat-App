import { SignIn } from '@clerk/clerk-react'
import React, { useEffect } from 'react'
import NavBar from '../Components/NavBar'

export default function Login() {
    useEffect(() => {
        document.title = 'Login'
    },[])
    return (
        <section className='page'>
            <NavBar />
            <SignIn signUpUrl="/signup" />
        </section>
    )
}

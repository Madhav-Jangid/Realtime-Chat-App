import { SignIn } from '@clerk/clerk-react'
import React from 'react'

export default function Login() {
    return (
        <section className='page'>
            <SignIn signUpUrl="/signup" />
        </section>
    )
}

import { SignUp } from '@clerk/clerk-react';
import React from 'react';

export default function Register() {
    return (
        <section className='page'>
            <SignUp signInUrl="/login" />
        </section>
    )
}

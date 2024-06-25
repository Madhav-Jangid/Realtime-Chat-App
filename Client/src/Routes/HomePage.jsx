import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {

    const { user } = useUser();



    return (
        <section className='page'>
            Start here
            <SignedIn>
                <h2>Welcome {user?.username}</h2>
                <UserButton></UserButton>
            </SignedIn>
            <Link to={'/login'}>Login</Link>
            <Link to={'/signup'}>Register</Link>
        </section>
    )
}

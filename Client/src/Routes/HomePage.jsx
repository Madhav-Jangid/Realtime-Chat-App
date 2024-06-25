import { UserButton, useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {

    



    return (
        <section className='page'>
            Hello g
            <UserButton></UserButton>
            <Link to={'/login'}>Login</Link>
            <Link to={'/signup'}>Register</Link>
        </section>
    )
}

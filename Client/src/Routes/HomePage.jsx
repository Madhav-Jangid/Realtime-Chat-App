// import { UserButton, useUser } from '@clerk/clerk-react';
import React, { useEffect }  from 'react'
import { Link } from 'react-router-dom';
import "../css/Homepage.css"
import NavBar from '../Components/NavBar';

export default function HomePage() {

   



    return (
        <section className='page'>
            <NavBar/>
            <div className='middleContent'>
                <p>The power of communication 🚀</p>
                <h1>Discover a new way <br /> to stay in touch</h1>
                <p className='shortMessageForHomePage'>
                    A unified hub for all your messages, ensuring you never <br /> miss a beat when it comes to your communication.
                </p>
            </div>
            <div className='lastButtonHomePage'>
                <Link to={'/workflow'}>Learn More</Link>
                <Link to={'/signup'}>Get Started</Link>
            </div>
        </section>
    )
}

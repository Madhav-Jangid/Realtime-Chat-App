import React from 'react'
import { Users } from '@phosphor-icons/react'

export default function AllGroups({ heading }) {
    return (
        <div className='allUsers'>
            <h3 className='mainHeading'>
                <Users />
                <span>{heading}</span>
            </h3>


        </div>

    )
}

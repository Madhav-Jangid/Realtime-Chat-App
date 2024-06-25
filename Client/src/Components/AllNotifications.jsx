import { Bell } from '@phosphor-icons/react'
import React from 'react'

export default function AllNotifications({heading}) {
    return (
        <div className='allUsers notification'>
            <h3 className='mainHeading'>
                <Bell />
                <span>{heading}</span>
            </h3>
        </div>
    )
}

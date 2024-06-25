import React, { Suspense, useState, useEffect } from 'react';
import { CircularProgress, IconButton } from '@mui/material';
import { ChatTeardropDots } from '@phosphor-icons/react';
import CancelIcon from '@mui/icons-material/Cancel';
import { useUser } from '@clerk/clerk-react';
const UserSlide = React.lazy(() => import('./UserSlide.'));

export default function AllChats({ heading, users, highlight }) {


    const { user: currentUser } = useUser();
    const [serverUser, setServerUser] = useState(null);


    const [name, setName] = useState('');
    const [searchedUser, setSearchedUser] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    let searchTimeout;

    // useEffect(() => {
    //     return () => {
    //         if (searchTimeout) {
    //             clearTimeout(searchTimeout);
    //         }
    //     };
    // }, []);

    const handleInputChange = (event) => {
        const inputValue = event.target.value;
        setName(inputValue);
        setSearchedUser(true);
    };

    useEffect(() => {
        if (!name) {
            setSearchResults([]);
            return;
        }
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(() => {
            searchUsers();
        }, 100);

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [name]);

    const searchUsers = () => {
        const filteredUsers = users?.filter(user =>
            user.username.toLowerCase().includes(name.toLowerCase())
        );
        setSearchResults(filteredUsers);
    };

    const handleCancelSearch = () => {
        setName('');
        setSearchedUser(false);
        setSearchResults([]);
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    };

    const fetchUserInfo = async (userEmail) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/${userEmail}`);
            if (!response.ok) {
                return console.error(`Error while fetching user Data`);
            }

            const userInfo = await response.json();
            setServerUser(userInfo.user);
            findFriends(userInfo.user)
            // console.log(serverUser);
        } catch (error) {
            console.error(error);
        }
    }

    const [friendList, setFriendList] = useState(null);

    const findFriends = (user) => {
        const friendList = users?.filter((person) => user?.friendList?.includes(person?.email_addresses[0].email_address))
        setFriendList(friendList);
    }


    useEffect(() => {
        fetchUserInfo(currentUser?.primaryEmailAddress?.emailAddress);
    }, [users, currentUser])

    return (
        <div className='allUsers'>
            <h3 className='mainHeading'>
                <ChatTeardropDots />
                <span>{heading}</span>
            </h3>
            <div className="searchUserInputFeild">
                <input
                    type='text'
                    placeholder='Search or start a new chat'
                    value={name}
                    onChange={handleInputChange}
                />

                {searchedUser &&
                    <IconButton className='crossIcon' onClick={handleCancelSearch}>
                        <CancelIcon />
                    </IconButton>
                }
            </div>

            {searchedUser ?
                searchResults?.length !== 0 ?
                    searchResults?.map(user => (
                        <UserSlide key={user.id} user={user} add={searchedUser} serverUser={serverUser} />
                    )) : <div className="noResultsMessage" style={{ textAlign: 'center', marginTop: '2rem' }}>No users found.</div>
                :
                <Suspense fallback={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} id="conversation" name="conversation" className="conversation">
                        <CircularProgress />
                    </div>}>
                    {friendList ?
                        friendList?.map((user) => {
                            return (
                                <UserSlide highlight={highlight} key={user.id} user={user} add={false} serverUser={serverUser} />
                            )
                        }) : <div className='noMessages'>
                            <span>You can add friends by searching them and sending them friend request.</span>
                        </div>
                    }
                </Suspense>}
        </div >
    );
}
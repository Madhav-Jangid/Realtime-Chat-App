import React, { Suspense, useState, useEffect } from 'react';
import { CircularProgress, Drawer, IconButton } from '@mui/material';
import { ChatTeardropDots } from '@phosphor-icons/react';
import CancelIcon from '@mui/icons-material/Cancel';
import { UserButton, useUser } from '@clerk/clerk-react';
import SideBar from './Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
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
            findFriends(userInfo.user);
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

    const [open, setOpen] = useState(false);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };


    return (
        <div className='allUsers'>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <SideBar active={open} drawer={true} />
            </Drawer>


            <h3 className='mainHeading'>

                <IconButton id='shortNavIcon' onClick={toggleDrawer(true)}>
                    <MenuIcon />
                </IconButton>

                <ChatTeardropDots />

                <span>{heading}</span>

                <div id='userProfileButton'>
                    <UserButton showName />
                </div>
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
                        user.username !== currentUser.username && (
                            <UserSlide key={user.id} user={user} add={searchedUser} serverUser={serverUser} />
                        )
                    )) : <div className="noResultsMessage" style={{ textAlign: 'center', marginTop: '2rem' }}>No users found.</div>
                :


                friendList ?
                    friendList.length !== 0 ?
                        friendList?.map((user) => {
                            return (
                                <UserSlide highlight={highlight} key={user.id} user={user} add={false} serverUser={serverUser} />
                            )
                        }) :
                        <div className='noMessages'>
                            <span>You can add friends by searching them and sending them friend request.</span>
                        </div> : <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '70%'
                        }}>
                        <CircularProgress />
                    </div>
            }
        </div >
    );
}

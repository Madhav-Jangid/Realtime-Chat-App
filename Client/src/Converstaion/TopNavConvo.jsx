import React, { useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import '../css/Responsive.css';
import { Menu, MenuItem } from '@mui/material';

export default function TopNavConvo({
  selectedUser,
  searchQuery,
  onSearchChange,
  searchMeta,
  onSearchPrev,
  onSearchNext
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const open = Boolean(anchorEl);

  const searchCountLabel = useMemo(() => {
    if (!searchQuery.trim()) return '';
    if (!searchMeta.totalCount) return '0/0';
    return `${searchMeta.activeIndex + 1}/${searchMeta.totalCount}`;
  }, [searchMeta, searchQuery]);

  return (
    <div className='convoTopNav'>
      <div className='convoUserDetails'>
        <Link id='backButtonForChat' to={'/chats'}>
          <IconButton><ArrowLeft /></IconButton>
        </Link>
        <img className='avatarImage' src={selectedUser.avatar || selectedUser.image_url} alt={`${selectedUser.username}'s_Image`} />
        <div>
          <h3>{selectedUser.username || 'User'}</h3>
        </div>
      </div>

      <div className='convoChatOptions'>
        {searchOpen ? (
          <div className='chatSearchBar'>
            <input
              placeholder='Search in chat'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
            <span className='chatSearchCount'>{searchCountLabel}</span>
            <IconButton onClick={onSearchPrev} disabled={!searchQuery.trim() || !searchMeta.totalCount}><KeyboardArrowUpIcon /></IconButton>
            <IconButton onClick={onSearchNext} disabled={!searchQuery.trim() || !searchMeta.totalCount}><KeyboardArrowDownIcon /></IconButton>
            <IconButton onClick={() => {
              setSearchOpen(false);
              onSearchChange('');
            }}><CloseIcon /></IconButton>
          </div>
        ) : (
          <>
            <div className='ShortMenu'>
              <IconButton
                id='demo-positioned-button'
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup='true'
                aria-expanded={open ? 'true' : undefined}
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                <ArrowDropDownOutlinedIcon />
              </IconButton>
              <Menu
                id='demo-positioned-menu'
                aria-labelledby='demo-positioned-button'
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem disabled><VideocamOutlinedIcon />&nbsp;&nbsp; Video Call</MenuItem>
                <MenuItem disabled><CallOutlinedIcon />&nbsp;&nbsp;Voice Call</MenuItem>
                <MenuItem onClick={() => {
                  setSearchOpen(true);
                  setAnchorEl(null);
                }}><SearchOutlinedIcon />&nbsp;&nbsp;Search</MenuItem>
              </Menu>
            </div>

            <div className='longMenu'>
              <IconButton disabled><VideocamOutlinedIcon /></IconButton>
              <IconButton disabled><CallOutlinedIcon /></IconButton>
              <IconButton onClick={() => setSearchOpen(true)}><SearchOutlinedIcon /></IconButton>
              <span className='dropDown'></span>
              <IconButton><ArrowDropDownOutlinedIcon /></IconButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

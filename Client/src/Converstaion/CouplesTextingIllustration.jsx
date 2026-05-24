import React from 'react';

export default function CouplesTextingIllustration() {
  return (
    <div className='couplesScene' aria-label='Animated illustration of two couples texting each other'>
      <div className='sceneRow'>
        <div className='coupleCard left'>
          <div className='person one'>
            <span className='head' />
            <span className='body' />
            <span className='phone' />
          </div>
          <div className='person two'>
            <span className='head' />
            <span className='body' />
            <span className='phone' />
          </div>
          <div className='bubble bubbleA'>Hey cutie 💬</div>
          <div className='bubble bubbleB'>Miss you too</div>
        </div>

        <div className='heartPulse'>❤</div>

        <div className='coupleCard right'>
          <div className='person one'>
            <span className='head' />
            <span className='body' />
            <span className='phone' />
          </div>
          <div className='person two'>
            <span className='head' />
            <span className='body' />
            <span className='phone' />
          </div>
          <div className='bubble bubbleA'>Coffee later?</div>
          <div className='bubble bubbleB'>Yes! ☕</div>
        </div>
      </div>
    </div>
  );
}

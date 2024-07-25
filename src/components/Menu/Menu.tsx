import React, { useEffect, useRef } from 'react';
import useStore from '@store/store';

import NewChat from './NewChat';
import NewFolder from './NewFolder';
import ChatHistoryList from './ChatHistoryList';
import MenuOptions from './MenuOptions';

import CrossIcon2 from '@icon/CrossIcon2';
import DownArrow from '@icon/DownArrow';
import MenuIcon from '@icon/MenuIcon';

const Menu = () => {
  const hideSideMenu = useStore((state) => state.hideSideMenu);
  const setHideSideMenu = useStore((state) => state.setHideSideMenu);
  const menuWidth = useStore((state) => state.menuWidth);
  const setMenuWidth = useStore((state) => state.setMenuWidth);

  const windowWidthRef = useRef<number>(window.innerWidth);
  const isResizing = useRef<boolean>(false);

  useEffect(() => {
    if (window.innerWidth < 768) setHideSideMenu(true);
    window.addEventListener('resize', () => {
      if (
        windowWidthRef.current !== window.innerWidth &&
        window.innerWidth < 768
      )
        setHideSideMenu(true);
    });
  }, []);

  const handleMouseDown = () => {
    isResizing.current = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = e.clientX;
      if (newWidth > 100 && newWidth < window.innerWidth * 0.75) {
        setMenuWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div
        id='menu'
        className={`group/menu dark bg-gray-900 fixed md:inset-y-0 md:flex md:flex-col transition-transform z-[999] top-0 left-0 h-full max-md:w-3/4 ${
          hideSideMenu ? 'translate-x-[-100%]' : 'translate-x-[0%]'
        }`}
        style={{ width: `${menuWidth}px` }}
      >
        <div className='flex h-full min-h-0 flex-col'>
          <div className='flex h-full w-full flex-1 items-start border-white/20'>
            <nav className='flex h-full flex-1 flex-col space-y-1 px-2 pt-2'>
              <div className='flex gap-2'>
                <NewChat />
                <NewFolder />
              </div>
              <ChatHistoryList />
              <MenuOptions />
            </nav>
          </div>
        </div>
        <div
          id='menu-close'
          className={`${
            hideSideMenu ? 'hidden' : ''
          } md:hidden absolute z-[999] right-0 translate-x-full top-10 bg-gray-900 p-2 cursor-pointer hover:bg-black text-white`}
          onClick={() => {
            setHideSideMenu(true);
          }}
        >
          <CrossIcon2 />
        </div>
        <div
          className={`${
            hideSideMenu ? 'opacity-100' : 'opacity-0'
          } group/menu md:group-hover/menu:opacity-100 max-md:hidden transition-opacity absolute z-[999] right-0 translate-x-full top-10 bg-gray-900 p-2 cursor-pointer hover:bg-black text-white ${
            hideSideMenu ? '' : 'rotate-90'
          }`}
          onClick={() => {
            setHideSideMenu(!hideSideMenu);
          }}
        >
          {hideSideMenu ? (
            <MenuIcon className='h-4 w-4' />
          ) : (
            <DownArrow className='h-4 w-4' />
          )}
        </div>
        <div
          className='absolute top-0 right-0 h-full w-2 cursor-ew-resize'
          onMouseDown={handleMouseDown}
        />
      </div>
      <div
        id='menu-backdrop'
        className={`${
          hideSideMenu ? 'hidden' : ''
        } md:hidden fixed top-0 left-0 h-full w-full z-[60] bg-gray-900/70`}
        onClick={() => {
          setHideSideMenu(true);
        }}
      />
    </>
  );
};

export default Menu;

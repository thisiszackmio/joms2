import { Menu } from '@headlessui/react';
import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline'

const TopNav = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">

        {/* Notification Icon */}
        <div className="hidden md:flex items-center ml-4">
          <div className="relative">
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="notification-icon">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </Menu.Button>
              </div>
            </Menu>
          </div>
        </div>

      </div>
    </div>

  );
};

export default TopNav;
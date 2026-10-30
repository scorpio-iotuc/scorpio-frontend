import { useState } from 'react';
import { NavbarContext } from './NavbarContextObject';

export function NavbarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <NavbarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </NavbarContext.Provider>
  );
};

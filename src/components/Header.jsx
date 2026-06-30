import React, { useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window.currentUser === 'function') {
      setUser(window.currentUser());
    }
  }, []);

  const handleLogout = () => {
    if (typeof window.logoutUser === 'function') {
      window.logoutUser();
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <Navbar isBordered className="bg-surface/85 backdrop-blur-md border-border">
      <NavbarBrand>
        <Link href="/" className="font-black text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          ⚡ Pharmora
        </Link>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem>
          <Link href="/learn/" className="text-text-soft hover:text-primary font-semibold text-sm">Syllabus</Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/library" className="text-text-soft hover:text-primary font-semibold text-sm">Library</Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/community/" className="text-text-soft hover:text-primary font-semibold text-sm">Community</Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform border-primary"
                color="primary"
                name={user.name || user.email}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold text-text-soft text-xs">Signed in as</p>
                <p className="font-bold text-text text-sm">{user.name || user.email}</p>
              </DropdownItem>
              <DropdownItem key="dashboard" href="/profile">My Profile</DropdownItem>
              {['admin', 'owner'].includes(user.role) && (
                <DropdownItem key="admin" href="/admin/">Admin Workbench</DropdownItem>
              )}
              <DropdownItem key="logout" color="danger" onClick={handleLogout} className="text-danger">Log Out</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Button as={Link} href="/auth/login.html" color="primary" variant="flat" size="sm" className="font-bold text-xs">
              Log In
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}

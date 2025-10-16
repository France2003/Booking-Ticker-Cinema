import React, { useState } from "react";
import DropdownMenu from "./DropdownMenu";
interface NavItemProps {
    label: string;
    href?: string;
    submenu?: { label: string; href: string }[];
}
const NavItem: React.FC<NavItemProps> = ({ label, href = "#", submenu }) => {
    const [open, setOpen] = useState(false);

    return (
        <li className="relative"
            onMouseEnter={() => submenu && setOpen(true)}
            onMouseLeave={() => submenu && setOpen(false)} >
            <a href={href}
                className={`px-3 py-2 font-semibold hover:text-orange-500 transition-colors duration-200 ${ open ? "text-orange-500" : "text-white"
                    } after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-orange-500  after:transition-all after:duration-300 hover:after:w-full`}>{label}
            </a>
            {submenu && <DropdownMenu items={submenu} open={open} />}
        </li>
    );
};

export default NavItem;

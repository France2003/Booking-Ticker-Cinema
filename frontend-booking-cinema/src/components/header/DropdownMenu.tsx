import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownMenuProps {
    items: { label: string; href: string }[];
    open: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, open }) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-[2px] w-44 bg-[#03101f] text-white rounded shadow-lg z-20 " >
                    {items.map((item, idx) => (
                        <li key={idx} className="px-4 py-2 hover:bg-[#0c223d] hover:text-orange-500 hover:duration-300 cursor-pointer">
                            <a href={item.href}>{item.label}</a>
                        </li>
                    ))}
                </motion.ul>
            )}
        </AnimatePresence>
    );
};

export default DropdownMenu;

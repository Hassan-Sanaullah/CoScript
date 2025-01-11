import React, { useState, useRef, useEffect } from "react";

interface Props {
  children: string;
  options: { label: string; onClick: () => void }[];
}

function MenuItem({ children, options }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuItemRef = useRef<HTMLLIElement | null>(null); // Reference to the menu item
  const dropdownRef = useRef<HTMLUListElement | null>(null); // Reference to the dropdown menu

  const menuItemStyle: React.CSSProperties = {
    listStyleType: "none",
    padding: "5px 10px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    backgroundColor: isHovered ? "white" : "transparent",
    color: isHovered ? "#a0332c" : "white",
    position: "relative",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: isHovered ? "white" : "#a0332c",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    display: isOpen ? "block" : "none", // Show if open
    zIndex: 1000,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: "5px 10px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuItemRef.current &&
        !menuItemRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false); // Close dropdown if click is outside the menu or dropdown
      }
    };

    document.addEventListener("click", handleClickOutside); // Add event listener for clicks
    return () => {
      document.removeEventListener("click", handleClickOutside); // Clean up the event listener
    };
  }, []);

  return (
    <li
      ref={menuItemRef}
      style={menuItemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsOpen(!isOpen)} // Toggle dropdown on click
    >
      {children}
      <ul ref={dropdownRef} style={dropdownStyle}>
        {options.map((option, index) => (
          <li
            key={index}
            style={dropdownItemStyle}
            onClick={(e) => {
              e.stopPropagation(); // Prevent click from closing the dropdown prematurely
              option.onClick(); // Execute action
              setIsOpen(false); // Close dropdown after selection
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eee")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {option.label}
          </li>
        ))}
      </ul>
    </li>
  );
}

export default MenuItem;

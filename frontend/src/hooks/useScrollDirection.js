import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
    const [scrollDirection, setScrollDirection] = useState(null);

    useEffect(() => {
        const scrollContainer = document.getElementById('app-scroll-container');
        if (!scrollContainer) return;

        let lastScrollY = scrollContainer.scrollTop;

        const updateScrollDirection = () => {
            const scrollY = scrollContainer.scrollTop;
            const direction = scrollY > lastScrollY ? "down" : "up";
            if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
                setScrollDirection(direction);
            }
            lastScrollY = scrollY > 0 ? scrollY : 0;
        };
        scrollContainer.addEventListener("scroll", updateScrollDirection); // add event listener
        return () => {
            scrollContainer.removeEventListener("scroll", updateScrollDirection); // clean up
        }
    }, [scrollDirection]);

    return scrollDirection;
};

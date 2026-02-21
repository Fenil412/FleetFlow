import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, hover = true }) => {
    return (
        <div className={cn(
            "bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300",
            hover && "hover:shadow-xl hover:-translate-y-1",
            className
        )}>
            {children}
        </div>
    );
};

export default Card;

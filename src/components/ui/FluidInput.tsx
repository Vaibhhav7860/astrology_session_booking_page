import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FluidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const FluidInput = React.forwardRef<HTMLInputElement, FluidInputProps>(
    ({ className, label, error, ...props }, ref) => {
        const [focused, setFocused] = React.useState(false);

        return (
            <div className="relative w-full mb-6 mt-2">
                <label
                    className={cn(
                        "absolute left-4 transition-all duration-300 pointer-events-none text-white/70",
                        (focused || props.value || props.defaultValue)
                            ? "-top-6 text-sm text-fuchsia-400 font-medium tracking-wider uppercase font-serif"
                            : "top-3 text-base font-sans"
                    )}
                >
                    {label}
                </label>
                <input
                    ref={ref}
                    onFocus={(e) => {
                        setFocused(true);
                        if (props.onFocus) props.onFocus(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        if (props.onBlur) props.onBlur(e);
                    }}
                    className={cn(
                        "w-full bg-black/30 border border-white/20 text-white rounded-xl px-4 py-3 font-sans",
                        "backdrop-blur-sm outline-none transition-all duration-300",
                        "focus:bg-black/50 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/50 focus:shadow-[0_0_15px_rgba(232,121,249,0.2)]",
                        "placeholder:text-transparent",
                        error && "border-red-400/80 focus:border-red-400 focus:ring-red-400/50",
                        className
                    )}
                    placeholder={label} // For a11y, hiding it visually
                    {...props}
                />
                {error && (
                    <span className="absolute -bottom-5 left-1 text-xs text-red-400 font-medium">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);
FluidInput.displayName = "FluidInput";

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md bg-[#6b7c5c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a6b4c] focus:outline-none focus:ring-2 focus:ring-[#6b7c5c] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disabled && 'opacity-50'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

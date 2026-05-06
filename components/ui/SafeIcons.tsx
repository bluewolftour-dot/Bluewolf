type IconProps = {
    className?: string;
};

export function SearchIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
        </svg>
    );
}

export function PlaneIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg
            className={className}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="bw-pl-body" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#EBF2FE" />
                    <stop offset="100%" stopColor="#9DBCEC" />
                </linearGradient>
                <linearGradient id="bw-pl-wing-top" x1="100%" y1="0%" x2="20%" y2="100%">
                    <stop offset="0%" stopColor="#F8FBFF" />
                    <stop offset="100%" stopColor="#7FA3D6" />
                </linearGradient>
                <linearGradient id="bw-pl-wing-bottom" x1="100%" y1="0%" x2="20%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#DCE9FD" />
                    <stop offset="100%" stopColor="#7DA1D6" />
                </linearGradient>
                <linearGradient id="bw-pl-tail" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F4F8FF" />
                    <stop offset="100%" stopColor="#86A8D8" />
                </linearGradient>
            </defs>

            <path
                d="M28 24 Q24 22 20 18 L12 10 Q8 8 8 12 L10 22 Q12 28 18 30 L30 30 Z"
                fill="url(#bw-pl-wing-top)"
            />

            <path
                d="M18 38 L8 44 Q4 46 8 48 L12 50 Q16 50 20 46 L22 40 Z"
                fill="url(#bw-pl-tail)"
                opacity="0.95"
            />

            <path
                d="M52 12 Q58 14 56 20 L26 50 Q20 56 14 54 Q10 50 14 46 L46 14 Q48 11 52 12 Z"
                fill="url(#bw-pl-body)"
            />

            <path
                d="M30 32 L50 38 Q56 42 54 48 L46 56 Q42 58 38 54 L28 38 Z"
                fill="url(#bw-pl-wing-bottom)"
            />

            <path
                d="M48 14 Q52 14 54 18 L26 46 Q23 48 22 46 L50 18 Q50 14 48 14 Z"
                fill="#FFFFFF"
                opacity="0.55"
            />

            <path
                d="M40 38 L48 42 Q50 44 48 46 L42 50 Q40 50 39 48 L38 42 Z"
                fill="#FFFFFF"
                opacity="0.45"
            />
        </svg>
    );
}

export function PinIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 1.75a5.75 5.75 0 0 0-5.75 5.75c0 4.02 4.62 9.23 5.15 9.82a.75.75 0 0 0 1.1 0c.53-.59 5.15-5.8 5.15-9.82A5.75 5.75 0 0 0 10 1.75Zm0 7.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" />
        </svg>
    );
}

export function ThumbIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.76a2 2 0 0 1 1.79 2.89l-3.5 7A2 2 0 0 1 15.26 21h-4.01c-.17 0-.33-.02-.49-.06L7 20m7-10V5a2 2 0 0 0-2-2h-.1a.9.9 0 0 0-.9.9c0 .72-.21 1.42-.61 2.01L7 11v9m0 0H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2.5" />
        </svg>
    );
}

export function CommentIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-8 8 3.5-3.5H17a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v5.5a4 4 0 0 0 4 4" />
        </svg>
    );
}

export function CameraIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Zm8 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        </svg>
    );
}

export function CalendarIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 9h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
        </svg>
    );
}

export function PeopleIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0m8 0a4 4 0 1 1 4 4m-4-4a4 4 0 0 0 4 4M8 11a4 4 0 1 0-4 4m4-4a4 4 0 0 1-4 4m0 5a6 6 0 0 1 12 0m-16 0a4 4 0 0 1 7.2-2.4M16.8 17.6A4 4 0 0 1 24 20" />
        </svg>
    );
}

export function SunIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.42-1.42M4.92 19.08l1.42-1.42m0-11.32L4.92 4.92m14.16 14.16-1.42-1.42M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        </svg>
    );
}

export function MoonIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z" />
        </svg>
    );
}

export function StarIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 0 0 .95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 0 0-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 0 0-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 0 0-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 0 0 .95-.69l1.07-3.29Z" />
        </svg>
    );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
    );
}

export function XIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6 18 18M18 6 6 18" />
        </svg>
    );
}

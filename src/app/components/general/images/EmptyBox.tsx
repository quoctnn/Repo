import * as React from 'react'
type Props = {
} & React.SVGProps<SVGSVGElement>
export default (props:Props) => {
    const { ...rest} = props
    return (<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="361" height="363" {...rest} viewBox="0 0 361 363">
    <defs>
        <filter id="emptybox-a" width="106.9%" height="111.5%" x="-3.4%" y="-5.7%" filterUnits="objectBoundingBox">
            <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
            <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
            <feColorMatrix in="shadowBlurOuter1" result="shadowMatrixOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <linearGradient id="emptybox-c" x1="50%" x2="55.185%" y1="50%" y2="113.767%">
            <stop offset="0%" stopColor="#989898"/>
            <stop offset="100%" stopColor="#7C7C7C"/>
        </linearGradient>
        <path id="emptybox-b" d="M30 0v59H11z"/>
        <linearGradient id="emptybox-e" x1="50%" x2="55.185%" y1="65.084%" y2="121.023%">
            <stop offset="0%" stopColor="#989898"/>
            <stop offset="100%" stopColor="#7C7C7C"/>
        </linearGradient>
        <path id="emptybox-d" d="M339 0v59h-19z"/>
        <linearGradient id="emptybox-g" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#CACACA"/>
            <stop offset="100%" stopColor="#ACACAC"/>
        </linearGradient>
        <path id="emptybox-f" d="M30 0h290v69H30z"/>
        <linearGradient id="emptybox-i" x1="50%" x2="50%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="#989898"/>
            <stop offset="100%" stopColor="#636363"/>
        </linearGradient>
        <rect id="emptybox-h" width="106" height="24" x="122" y="122" rx="10"/>
        <path id="emptybox-j" d="M0 0h333v185H0z"/>
        <linearGradient id="emptybox-k" x1="42.279%" x2="14.076%" y1="48.02%" y2="69.397%">
            <stop offset="0%" stopColor="#525252"/>
            <stop offset="100%" stopColor="#919191"/>
        </linearGradient>
        <linearGradient id="emptybox-n" x1="0%" x2="76.759%" y1="38.779%" y2="73.485%">
            <stop offset="0%" stopColor="#8F8F8F"/>
            <stop offset="100%" stopColor="#565656"/>
        </linearGradient>
        <path id="emptybox-m" d="M338.19 21.877c-8.621 9.319-14.939-5.636-5.473-5.636C324.626 13.816 330.15 1.8 331.746 0c4.89 0 10.562 6.848 9.736 13.816 1.604-3.253 13.325-9.01 19.429-6.14.929 4.327-5.509 15.6-14.412 11.87 7.257 7.203-7.271 13.598-8.31 2.33z"/>
    </defs>
    <g fill="none" fillRule="evenodd">
        <g filter="url(#emptybox-a)" transform="translate(0 154)">
            <use fill="#989898" xlinkHref="#emptybox-b"/>
            <use fill="url(#emptybox-c)" xlinkHref="#emptybox-b"/>
            <g transform="matrix(-1 0 0 1 659 0)">
                <use fill="#989898" xlinkHref="#emptybox-d"/>
                <use fill="url(#emptybox-e)" xlinkHref="#emptybox-d"/>
            </g>
            <use fill="#CACACA" xlinkHref="#emptybox-f"/>
            <use fill="url(#emptybox-g)" xlinkHref="#emptybox-f"/>
            <rect width="350" height="150" y="59" fill="#F3F3F3" rx="15"/>
            <g>
                <use fill="#989898" xlinkHref="#emptybox-h"/>
                <use fill="url(#emptybox-i)" xlinkHref="#emptybox-h"/>
            </g>
        </g>
        <g transform="translate(9 28)">
            <mask id="emptybox-l" fill="#fff">
                <use xlinkHref="#emptybox-j"/>
            </mask>
            <path stroke="url(#emptybox-k)" strokeDasharray="1,17" strokeLinecap="round" strokeLinejoin="bevel" strokeWidth="6" d="M66.322 203.444c113.78-97.056 85.246-173.557 15.452-157.014-69.794 16.544-39.638 138.477 92.53 99.24C262.416 119.512 312.848 74.27 325.6 9.945" mask="url(#emptybox-l)"/>
        </g>
        <use fill="#535353" xlinkHref="#emptybox-m"/>
        <use fill="url(#emptybox-n)" xlinkHref="#emptybox-m"/>
    </g>
</svg>)
}
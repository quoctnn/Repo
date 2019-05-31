import * as React from 'react'
type Props = {
} & React.SVGProps<SVGSVGElement>
export default (props:Props) => {
    const { ...rest} = props
    return (<svg xmlns="http://www.w3.org/2000/svg"  xmlnsXlink="http://www.w3.org/1999/xlink" width="320" height="261" {...rest} viewBox="0 0 320 261">
        <defs>
            <path id="b" d="M250.205 229.727C275.115 203.097 287 172.546 287 136.5 287 61.113 225.887 0 150.5 0S14 61.113 14 136.5c0 36.277 14.152 69.249 37.236 93.696 0 0 198.97-.25 198.97-.47z"/>
            <filter id="a" width="105.1%" height="106.1%" x="-2.6%" y="-2.2%" filterUnits="objectBoundingBox">
                <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="d" d="M0 228h29"/>
            <filter id="c" width="162.1%" height="900%" x="-31%" y="-300%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="2" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="f" d="M39 228h33"/>
            <filter id="e" width="154.5%" height="900%" x="-27.3%" y="-300%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="2" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="h" d="M228 228h28"/>
            <filter id="g" width="164.3%" height="900%" x="-32.1%" y="-300%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="2" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="j" d="M271.5 227.946H316"/>
            <filter id="i" width="138.9%" height="900%" x="-18.9%" y="-302.7%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="2" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="l" d="M0 0l51.059 200.161-41.5 4.333z"/>
            <filter id="k" width="127.4%" height="106.8%" x="-13.7%" y="-2.4%" filterUnits="objectBoundingBox">
                <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="n" d="M0 0l51.059 200.161 67.867-8.913z"/>
            <filter id="m" width="111.8%" height="107%" x="-5.9%" y="-2.5%" filterUnits="objectBoundingBox">
                <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="p" d="M2.001 252.108h132.814c1.787-6.115-1.36-10.816-8.8-10.816 3.589-12.218.312-44.416-8.968-48.79L8.838 204.691c-3.641 5.64-5.532 29.47-2.208 36.601-4.629 0-8.084 6.007-4.629 10.816z"/>
            <filter id="o" width="113.3%" height="130.3%" x="-6.7%" y="-11.8%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="2" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="r" d="M0 0l9.292 204.494 109.634-13.246z"/>
            <filter id="q" width="116.6%" height="111.6%" x="-7.9%" y="-6.1%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="2" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <circle id="t" cx="22" cy="4" r="4"/>
            <filter id="s" width="275%" height="275%" x="-87.5%" y="-62.5%" filterUnits="objectBoundingBox">
                <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="v" d="M24 21.5a9.5 9.5 0 0 0-19 0c0 2.461 19 2.461 19 0z"/>
            <filter id="u" width="174.1%" height="223.4%" x="-36.6%" y="-44.1%" filterUnits="objectBoundingBox">
                <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="4" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <circle id="x" cx="4" cy="4" r="4"/>
            <filter id="w" width="275%" height="275%" x="-87.5%" y="-62.5%" filterUnits="objectBoundingBox">
                <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <filter id="y" width="138%" height="121.5%" x="-19.6%" y="-9.5%" filterUnits="objectBoundingBox">
                <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" result="shadowMatrixOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
                <feMerge>
                    <feMergeNode in="shadowMatrixOuter1"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <path id="A" d="M6.5.5l-6 8"/>
            <filter id="z" width="325.7%" height="275.6%" x="-112.9%" y="-65.6%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="C" d="M0 17.5l59.5 69"/>
            <filter id="B" width="127.2%" height="122.6%" x="-14%" y="-8.4%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="E" d="M18.5 20.5l-17 20"/>
            <filter id="D" width="187.9%" height="175.3%" x="-43.9%" y="-28.1%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="G" d="M30 40.5l-27.5 32"/>
            <filter id="F" width="158.3%" height="147.9%" x="-28.3%" y="-17.9%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="I" d="M1 52l83.5 97.5"/>
            <filter id="H" width="119.4%" height="116.7%" y="-6.5%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="K" d="M91.5 136.5l-12 13.5"/>
            <filter id="J" width="221.7%" height="202.2%" x="-60.9%" y="-39.4%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="M" d="M79 117.5l-31.5 36"/>
            <filter id="L" width="146.4%" height="142.8%" x="-24%" y="-16%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="O" d="M3 87.5l55.392 65"/>
            <filter id="N" width="128.9%" height="124%" x="-15%" y="-9%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="Q" d="M43 58.5l-39 46"/>
            <filter id="P" width="143.1%" height="133.7%" x="-21.6%" y="-12.6%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="S" d="M54.5 78.5L5.5 136"/>
            <filter id="R" width="131.6%" height="128.1%" x="-15.8%" y="-10.2%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="U" d="M67.5 97.5l-52 60"/>
            <filter id="T" width="129.9%" height="125.9%" x="-14.9%" y="-9.7%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
            <path id="W" d="M4.5 123.5l28 32"/>
            <filter id="V" width="154.6%" height="147.9%" x="-27.3%" y="-17.9%" filterUnits="objectBoundingBox">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="shadowSpreadOuter1"/>
                <feOffset dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"/>
                <feMorphology in="SourceAlpha" radius="1" result="shadowInner"/>
                <feOffset dy="2" in="shadowInner" result="shadowInner"/>
                <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
            </filter>
        </defs>
        <g fill="none" fill-rule="evenodd">
            <g transform="translate(2 31)">
                <use fill="#000" filter="url(#a)" xlinkHref="#b"/>
                <use fill="#F2F2F2" xlinkHref="#b"/>
            </g>
            <g stroke-linecap="round" transform="translate(2 31)">
                <use fill="#000" filter="url(#c)" xlinkHref="#d"/>
                <use stroke="#979797" stroke-width="4" xlinkHref="#d"/>
            </g>
            <g stroke-linecap="round" transform="translate(2 31)">
                <use fill="#000" filter="url(#e)" xlinkHref="#f"/>
                <use stroke="#979797" stroke-width="4" xlinkHref="#f"/>
            </g>
            <g stroke-linecap="round" transform="translate(2 31)">
                <use fill="#000" filter="url(#g)" xlinkHref="#h"/>
                <use stroke="#979797" stroke-width="4" xlinkHref="#h"/>
            </g>
            <g stroke-linecap="round" transform="translate(2 31)">
                <use fill="#000" filter="url(#i)" xlinkHref="#j"/>
                <use stroke="#979797" stroke-width="4" xlinkHref="#j"/>
            </g>
            <g>
                <g transform="translate(83 7)">
                    <use fill="#000" filter="url(#k)" xlinkHref="#l"/>
                    <use fill="#D8D8D8" xlinkHref="#l"/>
                </g>
                <g transform="translate(83 7)">
                    <use fill="#000" filter="url(#m)" xlinkHref="#n"/>
                    <use fill="#E9E9E9" xlinkHref="#n"/>
                </g>
                <g transform="translate(83 7)">
                    <use fill="#000" filter="url(#o)" xlinkHref="#p"/>
                    <use stroke="#979797" stroke-width="4" xlinkHref="#p"/>
                </g>
                <g transform="translate(83 7)">
                    <use fill="#000" filter="url(#q)" xlinkHref="#r"/>
                    <use stroke="#979797" stroke-width="4" xlinkHref="#r"/>
                </g>
            </g>
            <g>
                <g transform="translate(143 223)">
                    <use fill="#000" filter="url(#s)" xlinkHref="#t"/>
                    <use fill="#979797" xlinkHref="#t"/>
                </g>
                <g transform="translate(143 223)">
                    <use fill="#000" filter="url(#u)" xlinkHref="#v"/>
                    <path stroke="#979797" stroke-linejoin="square" stroke-width="4" d="M21.95 20.63a7.501 7.501 0 0 0-14.9 0c.326.099.752.196 1.26.284 1.606.277 3.846.432 6.19.432 2.344 0 4.584-.155 6.19-.432.508-.088.934-.185 1.26-.283z"/>
                </g>
                <g transform="translate(143 223)">
                    <use fill="#000" filter="url(#w)" xlinkHref="#x"/>
                    <use fill="#979797" xlinkHref="#x"/>
                </g>
            </g>
            <g stroke-linecap="round" stroke-linejoin="round" filter="url(#y)" transform="translate(93 43)">
                <use fill="#000" filter="url(#z)" xlinkHref="#A"/>
                <use stroke="#979797" stroke-width="2" xlinkHref="#A"/>
                <use fill="#000" filter="url(#B)" xlinkHref="#C"/>
                <use stroke="#979797" stroke-width="2" xlinkHref="#C"/>
                <use fill="#000" filter="url(#D)" xlinkHref="#E"/>
                <use stroke="#979797" stroke-width="2" xlinkHref="#E"/>
                <use fill="#000" filter="url(#F)" xlinkHref="#G"/>
                <use stroke="#979797" stroke-width="2" xlinkHref="#G"/>
                <use fill="#000" filter="url(#H)" xlinkHref="#I"/>
                <use stroke="#979797" stroke-width="2" xlinkHref="#I"/>
                <use fill="#000" filter="url(#J)" xlinkHref="#K"/>
                <use stroke="#979797" stroke-width="2" xlinkHref="#K"/>
                <g>
                    <use fill="#000" filter="url(#L)" xlinkHref="#M"/>
                    <use stroke="#979797" stroke-width="2" xlinkHref="#M"/>
                </g>
                <g>
                    <use fill="#000" filter="url(#N)" xlinkHref="#O"/>
                    <use stroke="#979797" stroke-width="2" xlinkHref="#O"/>
                </g>
                <g>
                    <use fill="#000" filter="url(#P)" xlinkHref="#Q"/>
                    <use stroke="#979797" stroke-width="2" xlinkHref="#Q"/>
                </g>
                <g>
                    <use fill="#000" filter="url(#R)" xlinkHref="#S"/>
                    <use stroke="#979797" stroke-width="2" xlinkHref="#S"/>
                </g>
                <g>
                    <use fill="#000" filter="url(#T)" xlinkHref="#U"/>
                    <use stroke="#979797" stroke-width="2" xlinkHref="#U"/>
                </g>
                <g>
                    <use fill="#000" filter="url(#V)" xlinkHref="#W"/>
                    <use stroke="#979797" stroke-width="2" xlinkHref="#W"/>
                </g>
            </g>
        </g>
    </svg>)
}
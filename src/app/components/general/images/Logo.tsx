import * as React from 'react'
type Props = {
    progress:number
    idPrefix:string
} & React.SVGProps<SVGSVGElement>
export default (props:Props) => {
    const { progress, idPrefix, ...rest} = props
    return (<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" {...rest} x="0px" y="0px" viewBox="0 0 2000 500" >
    <defs>
        <clipPath id={props.idPrefix + "_clipPath"}>
            <rect x="0" y="0" width={progress * 2000} height="500" />
        </clipPath>
        <linearGradient id={props.idPrefix + "_gradient"} className="gradient">
                <stop className="first-stop" offset="0%" />
                <stop className="last-stop" offset="100%" />
        </linearGradient>
        <g id={props.idPrefix + "_content"}>
          <path d="M101.484 131.353c0 8.096-2.671 14.327-8.017 18.708-5.341 4.364-11.414 6.562-18.216 6.562-7.125 0-13.197-2.103-18.217-6.317-5.024-4.214-7.527-10.516-7.527-18.944 0-7.124 2.426-12.643 7.286-16.517 4.858-3.89 11.002-5.835 18.458-5.835 6.803 0 12.875 1.945 18.216 5.835 5.346 3.873 8.017 9.384 8.017 16.508zm-7.285 281.751H52.907V184.785h41.292v228.319zM328.821 413.104h-45.177V277.909c0-16.478-3.885-30.03-11.659-40.703-9.4-12.604-22.834-18.897-40.319-18.897-17.172 0-31.017 5.416-41.537 16.24-10.524 10.824-15.786 24.146-15.786 39.976V413.11h-40.806V274.177c0-27.199 8.908-49.875 26.716-68.012 19.111-19.426 44.036-29.143 74.812-29.143 20.403 0 39.663 6.633 57.809 19.908 23.965 17.489 35.947 41.952 35.947 73.365v142.809zM493.984 225.599h-86.956v116.583c0 10.032 1.134 16.84 3.404 20.405 3.886 6.152 12.628 9.235 26.23 9.235h53.436v41.288h-56.836c-22.992 0-40.975-7.772-53.921-23.316-11.343-13.607-17.003-30.764-17.003-51.495V127.463h44.69v56.848h86.956v41.288zM640.69 218.309h-11.175c-20.404 2.578-35.632 11.149-45.662 25.681-10.041 14.54-15.061 36.18-15.061 64.928v104.186h-41.288v-228.8h41.288v22.343c4.858-7.448 11.329-13.75 19.434-18.944 11.001-7.123 23.146-10.681 36.433-10.681h16.03v41.287zM897.17 413.104h-45.66V281.458c0-17.164-5.345-30.922-16.035-41.296-12.952-12.31-32.542-18.454-58.776-18.454-16.851 0-32.223 5.013-46.15 15.055-19.43 13.931-29.144 34.172-29.144 60.722 0 25.586 8.42 45.51 25.257 59.758 14.577 12.31 32.548 18.445 53.922 18.445 10.361 0 19.676-2.332 27.934-7.045 8.259-4.681 17.562-12.215 27.93-22.58v51.977c-8.097 6.151-16.688 10.849-25.743 14.081-9.076 3.234-21.546 4.864-37.406 4.864-30.444 0-56.52-10.517-78.212-31.571-23.315-22.668-34.974-51.979-34.974-87.929 0-33.666 10.198-61.205 30.602-82.576 22.024-22.992 51.978-34.488 89.869-34.488 35.623 0 64.438 10.033 86.469 30.124 20.071 18.454 30.117 40.797 30.117 67.031v135.528zM985.101 386.877c0 9.708-2.757 17.33-8.259 22.826-5.517 5.511-11.982 8.262-19.434 8.262-7.774 0-14.411-2.594-19.918-7.781-5.509-5.17-8.257-12.942-8.257-23.307 0-8.746 2.348-15.308 7.045-19.68 4.689-4.373 11.091-6.556 19.188-6.556h5.347c6.143 0 11.729 2.508 16.757 7.528 5.011 5.02 7.531 11.259 7.531 18.708zM1332.907 341.856c0 21.98-7.858 40.474-23.562 55.505-15.718 15.021-32.797 22.532-51.251 22.532-17.813 0-31.894-2.308-42.269-6.926-10.357-4.633-20.24-13.33-29.625-26.106-6.808 8.941-15.228 16.286-25.262 22.027-12.635 7.336-26.883 11.005-42.742 11.005-27.854 0-49.398-10.326-64.604-31.025-11.663-15.828-17.489-32.796-17.489-50.901V184.303h44.695v146.326c0 12.287 3.164 22.779 9.474 31.508 6.31 8.721 15.622 13.077 27.942 13.077 15.859 0 27.435-3.803 34.724-11.385 7.282-7.582 10.927-21.237 10.927-40.948V184.303h44.696v146.326c0 17.126 4.688 29.239 14.091 36.339 7.438 5.503 18.128 8.246 32.06 8.246 11.654 0 20.81-4.451 27.45-13.322 6.628-8.887 9.956-21.885 9.956-39.011V184.303h40.805v157.553h-.016zM1602.03 297.485c0 29.483-9.408 55.867-28.179 79.184-21.697 26.882-49.875 40.316-84.521 40.316-41.461 0-73.032-12.145-94.736-36.435-19.742-22.012-29.616-51.329-29.616-87.92 0-34.323 11.819-62.509 35.46-84.521 22.343-20.723 49.392-31.088 81.129-31.088 32.385 0 59.426 9.061 81.129 27.198 26.21 21.704 39.334 52.801 39.334 93.266zm-45.669-4.594c0-22.604-6.482-40.687-19.434-54.246-12.951-13.552-31.404-20.336-55.379-20.336-24.288 0-42.915 8.231-55.85 24.7-10.689 13.56-16.02 30.188-16.02 49.882 0 21.309 4.855 39.383 14.563 54.232 12.635 19.055 31.736 28.565 57.323 28.565 22.992 0 40.639-5.637 52.958-16.943 14.55-13.552 21.839-35.516 21.839-65.854zM1748.729 218.309h-11.165c-20.415 2.578-35.642 11.149-45.667 25.681-10.043 14.54-15.055 36.18-15.055 64.928v104.186h-41.305v-228.8h41.305v22.343c4.854-7.448 11.322-13.75 19.418-18.944 11.005-7.123 23.149-10.681 36.434-10.681h16.035v41.287zM1959.563 184.303c-15.235 28.503-26.883 48.744-34.979 60.722-13.282 20.076-23.972 30.923-32.068 32.551 17.173 1.937 30.438 9.235 39.848 21.854 8.082 11.014 12.145 23.973 12.145 38.869v74.805h-40.814v-59.751c0-14.247-3.398-24.938-10.198-32.062-8.111-8.42-21.221-12.626-39.351-12.626h-37.397v104.43h-41.295V78.885h41.295v187.511h22.352c9.701 0 17.884-2.577 24.519-7.771 6.632-5.179 13.67-15.046 21.135-29.626l26.233-44.695h48.575z"/>
        </g>
    </defs>
      <use href={"#" + props.idPrefix + "_content"} className="background" display={progress == 1 ? "none" : undefined}>
      </use>
        <use href={"#" + props.idPrefix + "_content"} className="foreground" clipPath={"url(#" + props.idPrefix + "_clipPath)"} >
        </use>
  </svg>)
}

  
import * as React from 'react'
import classnames from 'classnames';
type Props = {
    size:number
    className?:string
    color?:string
}
export const Mark = (props:Props) => {
    return <div className={classnames("mark", props.className)}
                style={{width:props.size, 
                    height:props.size, 
                    borderRadius:"50%", 
                    display:"inline-block",
                    backgroundColor:props.color
                    }}>
                    </div>
}
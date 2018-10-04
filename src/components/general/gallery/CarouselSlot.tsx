import * as React from 'react';
export interface Props 
{
    numSlides:number
    order:number
    position:number
    children:React.ReactElement<any>
}
export const CarouselSlot = (props:Props) => 
{
    const getOpacity = () => {
        if (props.numSlides === 1) return 1
        if (props.numSlides === 2) return props.order === props.position ? 1 : 0.5
        return props.order === 1 ? 1 : 0.5
    }
    let styles = 
    {
        flex:"1 0 100%",
        flexBasis: "100%",
        marginRight: "0px",
        order:props.order,
        transition:"opacity 0.3s ease-in-out",
        opacity:getOpacity(),
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        height: "100%",
    }
    return (
        <div style={styles} className={props.order.toString()}>
            {props.children}
        </div>
    );
}
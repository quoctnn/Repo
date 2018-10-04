import * as React from 'react';
export interface Props
{
    sliding:boolean
    numSlides:number
    direction:string
    children:JSX.Element[]
}
export const CarouselContainer = (props:Props) => 
{
    const getTransform = () => 
    {
        if (props.numSlides === 1) return 'translateX(0%)'
        if (props.numSlides === 2) {
          if (!props.sliding && props.direction === 'next') return 'translateX(calc(-100% + 0px))'
          if (!props.sliding && props.direction === 'prev') return 'translateX(0%)'
          if (props.direction === 'prev') return 'translateX(calc(-100% + 0px))'
          return 'translateX(0%)'
        }
        if (!props.sliding) return 'translateX(calc(-100% - 0px))'
        if (props.direction === 'prev') return 'translateX(calc(2 * (-100% - 0px)))'
        return 'translateX(0%)'
    }
    let styles = 
    {
        display:"flex",
        margin: "0 0 0px 0px",
        transition: props.sliding ? 'none' : 'transform 0.3s ease-in-out',
        transform:getTransform(),
        height: "100%",
    }
    return (
        <div style={styles}>
        {props.children}
        </div>
    );
}
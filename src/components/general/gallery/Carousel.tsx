import * as React from 'react';
import * as Swipeable from 'react-swipeable'
import { throttle } from 'lodash'

import {CarouselContainer} from './CarouselContainer'
import {CarouselSlot} from './CarouselSlot'

export interface Props 
{
    children:React.ReactNode[]
    position:number
    className:string
}
interface State 
{
    position:number
    direction:string
    sliding:boolean
}
export default class Carousel extends React.Component<Props,State> {
  constructor(props:Props) {
    super(props);
    this.state = {
      position: props.position,
      direction: props.children.length === 2 && props.position === 0 ? 'prev' : 'next',
      sliding: false
    }
  }

  getOrder(itemIndex) {
    const { position } = this.state
    const { children } = this.props
    const numItems = children.length
    if (numItems === 2) 
        return itemIndex

    let k = itemIndex + 1 - position
    let k1 = k.mod(numItems)
    return k1
  }

  doSliding = (direction, position) => {
    this.setState({
      sliding: true,
      direction,
      position
    })

    setTimeout(() => {
      this.setState({
        sliding: false
      })
    }, 50)
  }

  nextSlide = () => {
    const { position } = this.state
    const { children } = this.props
    const numItems = children.length

    if (numItems === 2 && position === 1) return

    this.doSliding('next', position === numItems - 1 ? 0 : position + 1)
  }

  prevSlide = () => {
    const { position } = this.state
    const { children } = this.props
    const numItems = children.length

    if (numItems === 2 && position === 0) return

    this.doSliding('prev', position === 0 ? numItems - 1 : position - 1)
  }

  handleSwipe = throttle((isNext) => {
    const { children } = this.props
    const numItems = children.length || 1

    if (isNext && numItems > 1) {
      this.nextSlide()
    } else if (numItems > 1) {
      this.prevSlide()
    }
  }, 500, { trailing: false })

  render() {
    const { children } = this.props
    const { sliding, direction, position } = this.state

    const childrenWithProps = React.Children.map(children,
      (child) => React.cloneElement(child as React.ReactElement<any>, {
        numSlides: children.length || 1
      })
    )
    const showArrows = childrenWithProps.length > 1
    return (
      <div className={this.props.className}>
        <Swipeable trackMouse={false}
          onSwipingLeft={ () => this.handleSwipe(true) }
          onSwipingRight={ () => this.handleSwipe() }
        >
          <div style={{width: "100%", overflow: "hidden", position: "absolute", top: "0", left: "0", right: "0", bottom: "0"}}>
            <CarouselContainer
              sliding={ sliding }
              direction={ direction }
              numSlides={ childrenWithProps.length }
            >
              { childrenWithProps.map((child, index) => (
                <CarouselSlot
                  key={ index }
                  order={ this.getOrder(index) }
                  numSlides={ childrenWithProps.length }
                  position={ position }
                >
                  {child}
                </CarouselSlot>
              )) }
            </CarouselContainer>
          </div>
        </Swipeable>
        {showArrows && <LeftArrow onClick={this.prevSlide}/>}
        {showArrows && <RightArrow onClick={this.nextSlide}/>}
      </div>
    )
  }
}
interface ArrowProps
{
    onClick:(event) => void
}
const RightArrow = (props:ArrowProps) => {
    return (
        <div className="right-arrow" onClick={props.onClick}>
        <i className="fas fa-angle-right fa-2x" aria-hidden="true"></i>
        </div>
    );
}
const LeftArrow = (props:ArrowProps) => {
    return (
        <div className="left-arrow" onClick={props.onClick} >
            <i className="fas fa-angle-left fa-2x" aria-hidden="true"></i>
        </div>
    );
}
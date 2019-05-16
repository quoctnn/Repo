import * as React from 'react';
import "./RadialProgress.scss"

export interface OwnProps 
{
    percent:number
    size:number
    strokeWidth:number
}
interface State 
{
}
export default class RadialProgress extends React.Component<OwnProps, State> {     
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render() {
        const sqSize = this.props.size;
        const radius = (this.props.size - this.props.strokeWidth) / 2;
        const viewBox = `0 0 ${sqSize} ${sqSize}`;
        const dashArray = radius * Math.PI * 2;
        const dashOffset = dashArray - dashArray * this.props.percent / 100;
    
        return (
          <svg
              width={this.props.size}
              height={this.props.size}
              viewBox={viewBox}>
              <circle
                className="circle-background"
                cx={this.props.size / 2}
                cy={this.props.size / 2}
                r={radius}
                strokeWidth={`${this.props.strokeWidth}px`} />
              <circle
                className="circle-progress"
                cx={this.props.size / 2}
                cy={this.props.size / 2}
                r={radius}
                strokeWidth={`${this.props.strokeWidth}px`}
                transform={`rotate(-90 ${this.props.size / 2} ${this.props.size / 2})`}
                style={{
                  strokeDasharray: dashArray,
                  strokeDashoffset: dashOffset
                }} />
              <text
                className="circle-text"
                x="50%"
                y="50%"
                dy=".3em"
                textAnchor="middle">
                {`${this.props.percent}%`}
              </text>
          </svg>
        );
      }
}
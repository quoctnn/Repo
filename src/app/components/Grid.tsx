import * as React from "react";
import * as ReactDOM from "react-dom";
import classnames from 'classnames';
import { DashboardComponents, DashboardComponent, DashboardGridPosition } from "../Dashboard";
import { ResponsiveBreakpoint } from "./general/observers/ResponsiveComponent";

export interface Props {
    grid:DashboardGridPosition[]
    components:DashboardComponent[]
    breakpoint:ResponsiveBreakpoint

    className?:string,
    childClassName?:string,
    id?:string
    enableAnimation:boolean
}
export interface State {

    items:React.ReactChild[]
    rects:{[id:number]:DOMRect}
}
export class Grid extends React.PureComponent<Props, {}> {
    static defaultProps:Props = {
        className:null,
        grid:null,
        components:null,
        id:null,
        enableAnimation:true,
        breakpoint:ResponsiveBreakpoint.mini
    }
    state:State
    constructor(props) {
        super(props);
        this.state = {items:[], rects:{}}
    }
    componentWillReceiveProps(newProps) {
        if(this.props.enableAnimation)
        {
            let keys = this.getKeys()
            if(keys.length > 0) {
                let rects = {}
                keys.forEach(key => {
                    var domNode = ReactDOM.findDOMNode(this.refs[key]);
                    var boundingBox = (domNode as any).getBoundingClientRect();
                    rects[key] = boundingBox
                })
                this.setState({rects:rects})
            }
        }
    }
    getKeys = () => 
    {
        return Object.keys(this.refs)
    }
    componentDidUpdate(previousProps) 
    {
        if(this.props.enableAnimation)
        {
            var doNeedAnimation = [];
            this.getKeys().forEach((key) =>  {
            if(this.doesNeedAnimation(key) === 0) {
                doNeedAnimation.push(key);
            }
            });
            doNeedAnimation.forEach(this.animateAndTransform);
        }
    }
    animateAndDestroy = (key:string, n) =>
    {
        var domNode = ReactDOM.findDOMNode(this.refs[key]) as any
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
            domNode.style.opacity = "0";
            domNode.style.transform = "scale(2)"
            });
        });
    }
    animateAndTransform = (key:string, n) =>
        {
        var domNode = ReactDOM.findDOMNode(this.refs[key]) as any;
        
        var [dX, dY] = this.getPositionDelta(domNode, key);
        
        requestAnimationFrame(function(){
            domNode.style.transition = 'transform 0s';
            domNode.style.transform = 'translate('+ dX + 'px, ' + dY + 'px)';
            requestAnimationFrame(function() {
            domNode.style.transform  = '';
            domNode.style.transition = 'transform 350ms';
            })
        });
    }
    doesNeedAnimation = (key:string) => 
    {
        var isNotMovable = !key;
        var isNew = !this.state.rects[key];
        var isDestroyed = !this.refs[key];
        
        if(isDestroyed) return 2;
        if(isNotMovable || isNew) return;
        
        var domNode = ReactDOM.findDOMNode(this.refs[key]);
        var [dX, dY] = this.getPositionDelta(domNode, key);
        var isStationary = dX === 0 && dY === 0;

        return (isStationary === true) ? 1 : 0;
    }
    getPositionDelta = (domNode, key:string) =>
    {
        var newBox = domNode.getBoundingClientRect();
        var oldBox = this.state.rects[key];
        
        return [
            oldBox.left - newBox.left,
            oldBox.top - newBox.top
        ];
    }
    render() 
    {
        const cn = classnames("module-grid", this.props.className)
        const ccn = classnames("module-grid-item", this.props.className)
        return(
            <div className={cn} >
                {this.props.components.map((component, colIndex) => {
                        const gridPosition = this.props.grid.find(g => g.id == component.position)
                        const props = component.props
                        props.key = "module_" + component.id
                        props.ref = "module_" + component.id
                        props.className = ccn
                        props.style = {gridColumn:gridPosition.columnStart + "/ span " + gridPosition.columnSpan, gridRow: gridPosition.rowStart + " / span " + gridPosition.rowSpan}
                        props.breakpoint = this.props.breakpoint
                        return DashboardComponents.getComponent(component.component, component.props)
                    })}
            </div>
        );
    }
}
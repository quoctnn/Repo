import * as React from "react";
import * as ReactDOM from "react-dom";
import classnames from 'classnames';
import { DashboardComponents} from "../Dashboard";
import { ResponsiveBreakpoint } from "./general/observers/ResponsiveComponent";
import { GridLayout } from "../types/intrasocial_types";
import { parseJSONObject } from "../utilities/Utilities";

type OwnProps = {
    grid:GridLayout
    className?:string,
    childClassName?:string,
    id?:string
    fill:boolean
    updateKey?:string
}
type DefaultProps = {

    enableAnimation:boolean
    breakpoint:number
}
export interface State {

    items:React.ReactChild[]
    rects:{[id:number]:DOMRect}
}
type Props = OwnProps & DefaultProps
export class Grid extends React.PureComponent<Props, State> {
    static modeFillClass = "dash-fill"
    bodyClassAdded = false
    static defaultProps:DefaultProps = {
        enableAnimation:true,
        breakpoint:ResponsiveBreakpoint.mini,
    }
    constructor(props:Props) {
        super(props);
        this.state = {items:[], rects:{}}
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.props.fill != prevProps.fill && this.props.breakpoint != prevProps.breakpoint)
        {
            if(this.props.fill && this.props.breakpoint > ResponsiveBreakpoint.standard)
            {
                this.bodyClassAdded = true
                document.body.classList.add(Grid.modeFillClass)
            }
            else 
            {
                this.bodyClassAdded = false
                document.body.classList.remove(Grid.modeFillClass)
            }
        }
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
    componentWillUnmount = () => {
        if(this.bodyClassAdded)
            document.body.classList.remove(Grid.modeFillClass)
    }
    componentWillReceiveProps = (newProps:Props) => {
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
    animateAndDestroy = (key:string, n) =>
    {
        var domNode = ReactDOM.findDOMNode(this.refs[key]) as any
        requestAnimationFrame(() => {
            requestAnimationFrame(() =>  {
            domNode.style.opacity = "0";
            domNode.style.transform = "scale(2)"
            });
        });
    }
    animateAndTransform = (key:string, n) =>
        {
        var domNode = ReactDOM.findDOMNode(this.refs[key]) as any;
        
        var [dX, dY] = this.getPositionDelta(domNode, key);
        
        requestAnimationFrame(() => {
            domNode.style.transition = 'transform 0s';
            domNode.style.transform = 'translate('+ dX + 'px, ' + dY + 'px)';
            requestAnimationFrame(() => {
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
    render = () => {
        const modules = this.props.grid.grid_modules
        const cn = classnames("module-grid", this.props.className)
        const rows = modules.reduce((a, b) => Math.max(a, b.height + b.row), 0) - 1
        const style:React.CSSProperties = this.props.fill ? {gridAutoRows:`minmax(100px, calc(${100 / rows}% - 15px))`} : undefined
        const ccn = classnames("module-grid-item", this.props.className)
        const dict:{[key:string]:number} = {}
        const fixKey = (key:string) => {
            let dk = dict[key]
            if(!dk)
            {
                dict[key] = 1
                return key
            }
            else {
                dk += 1
                dict[key] = dk
                return key + "_" + dk
            }
            
        }
        return(
            <div className={cn} style={style}>
                {modules.map(m => {
                    const key = fixKey("module_" + m.module.id)
                    const props:any = parseJSONObject(m.module.properties) || {}
                    props.key = key
                    props.ref = key
                    props.className = ccn
                    props.style = {gridColumn:m.column + "/ span " + m.width, gridRow: m.row + " / span " + m.height}
                    props.breakpoint = this.props.breakpoint
                    return DashboardComponents.getComponent(m.module.type, props)
                })}
            </div>
        );
    }
}
import * as React from "react";
import * as ReactDOM from "react-dom";
import classnames from 'classnames';
import { DashboardComponents} from "../Dashboard";
import { ResponsiveBreakpoint } from "./general/observers/ResponsiveComponent";
import { GridColumns, Module, GridColumn } from '../types/intrasocial_types';
import { Col } from "reactstrap";
import StickyBox from "./external/StickyBox";

type OwnProps = {
    grid:GridColumns
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
    private keyDict:{[key:string]:number} = {}
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
        this.bodyClassAdded = null;
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
    fixKey = (key:string) => {
        let dk = this.keyDict[key]
        if(!dk)
        {
            this.keyDict[key] = 1
            return key
        }
        else {
            dk += 1
            this.keyDict[key] = dk
            return key + "_" + dk
        }
    }
    renderModule = (module:Module) => {
        if(module.disabled)
            return null
        const key = this.fixKey("module_" + module.id)
        const props:any = module.properties || {}
        const ccn = classnames("module-grid-item", this.props.className)
        console.log("key", key)
        props.key = key
        props.ref = key
        props.className = ccn
        props.breakpoint = this.props.breakpoint
        return DashboardComponents.getComponent(module.type, props)
    }
    renderRow = (columns:GridColumn[], level:number) => {
        const cn = classnames("row", {"fill" : this.props.fill})
        const colCN = classnames({"fill" : this.props.fill})
        return  <div className={cn}>
                    {columns.map(c => {
                        const key = "col_" + c.id + "_" + level
                        if(c.module)
                            return <Col className={colCN} key={key} xs={c.width}>{this.renderModule(c.module)}</Col>
                        else return  <Col className={colCN} key={key} xs={c.width}>{this.renderColumns(c, c.children, level + 1)}</Col>
                    })}
                </div>
    }
    renderColumns = (parent: GridColumn, columns:GridColumn[], level:number) => {
        if(columns.length == 0)
            return null
        const useSticky = !!parent && parent.sticky
        const cn = classnames({"container" :  !parent, "fill" : this.props.fill})
        if(useSticky){
            return <StickyBox className={cn} offsetTop={75} offsetBottom={20}>
                        {this.renderRow(columns, level)}
                    </StickyBox>

        }
        return <div className={cn}>
                    {this.renderRow(columns, level)}
                </div>
    }
    render = () => {
        this.keyDict = {}
        const columns = this.props.grid.columns
        return this.renderColumns(null, columns, 0)
    }
}
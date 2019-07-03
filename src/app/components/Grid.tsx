import * as React from "react";
import * as ReactDOM from "react-dom";
import classnames from 'classnames';
import { DashboardComponents} from "../Dashboard";
import { ResponsiveBreakpoint } from "./general/observers/ResponsiveComponent";
import { GridColumns, Module, GridColumn } from '../types/intrasocial_types';
import { Col } from "reactstrap";
import StickyBox from "./external/StickyBox";
import "./Grid.scss";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
//import "react-tabs/style/react-tabs.css";

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
    private moduleRefs:{[key:string]:Element} = {}
    static defaultProps:DefaultProps = {
        enableAnimation:true,
        breakpoint:ResponsiveBreakpoint.mini,
    }
    constructor(props:Props) {
        super(props);
        this.state = {items:[], rects:{}}
    }
    componentDidUpdate = (prevProps:Props) => {
        if((this.props.fill && !this.bodyClassAdded || !this.props.fill && this.bodyClassAdded))
        {
            if(this.bodyClassAdded)
            {
                this.bodyClassAdded = false
                document.body.classList.remove(Grid.modeFillClass)
            }
            else
            {
                this.bodyClassAdded = true
                document.body.classList.add(Grid.modeFillClass)
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
                    var domNode = this.moduleRefs[key]
                    if (domNode) {
                        var boundingBox = domNode.getBoundingClientRect();
                        rects[key] = boundingBox
                    }
                })
                this.setState({rects:rects})
            }
        }
    }
    getKeys = () =>
    {
        return Object.keys(this.moduleRefs)
    }
    animateAndDestroy = (key:string, n) =>
    {
        var domNode = this.moduleRefs[key] as any
        requestAnimationFrame(() => {
            requestAnimationFrame(() =>  {
            domNode.style.opacity = "0";
            domNode.style.transform = "scale(2)"
            });
        });
    }
    animateAndTransform = (key:string, n) =>
        {
        var domNode = this.moduleRefs[key] as any

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
        var isDestroyed = !this.moduleRefs[key];

        if(isDestroyed) return 2;
        if(isNotMovable || isNew) return;

        var domNode = this.moduleRefs[key]
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
    connectRef = (key:string) => (ref) => {
        this.moduleRefs[key] = ref
    }
    renderTabbedLayout = (columns:GridColumn[], level:number) => {
        const cn = classnames("tab-list")
        let tabWidth = 12
        if (columns) {
            tabWidth = 12 / columns.length
        }
        const colCN = classnames("tab-item", "col-" + tabWidth)
        columns.map(c => {return c.module.name})
        return <Tabs>
                    <TabList className={cn}>
                        {columns.map(c => {
                            return <Tab className={colCN} key={c.id}>{c.module.name}</Tab>
                        })}
                    </TabList>
                    {this.renderRow(columns, level, true)}
            </Tabs>

    }
    renderModule = (module:Module) => {
        if(module.disabled)
            return null
        const key = this.fixKey("module_" + module.id)
        const props:any = module.properties || {}
        const ccn = classnames("module-grid-item", this.props.className)
        props.key = key
        props.moduleRef = this.connectRef(key)
        props.className = ccn
        props.breakpoint = this.props.breakpoint
        return DashboardComponents.getComponent(module.type, props)
    }
    renderRow = (columns:GridColumn[], level:number, tabbed?:boolean) => {
        const cn = classnames("row", {"fill" : this.props.fill})
        const colCN = classnames({"fill" : this.props.fill})
        return  <div className={cn}>
                    {columns.map(c => {
                        const key = "col_" + c.id + "_" + level
                        if(tabbed && c.module)
                            return <TabPanel className={colCN} key={key} xs={c.width}>{this.renderModule(c.module)}</TabPanel>
                        else if(c.module)
                            return <Col className={colCN} key={key} xs={c.width}>{this.renderModule(c.module)}</Col>
                        else return  <Col className={colCN} key={key} xs={c.width}>{this.renderColumns(c, c.children, level + 1)}</Col>
                    })}
                </div>
    }
    renderColumns = (parent: GridColumn, columns:GridColumn[], level:number) => {
        if(columns.length == 0)
            return null
        const useSticky = !!parent && parent.sticky
        const useTabbed = !!parent && parent.tabbed_layout
        const cn = classnames({"container" :  !parent, "fill" : this.props.fill})
        if (useTabbed && useSticky) {
            return <StickyBox className={cn} offsetTop={75} offsetBottom={20}>
                        {this.renderTabbedLayout(columns, level)}
                    </StickyBox>
        }
        else if(useSticky){
            return <StickyBox className={cn} offsetTop={75} offsetBottom={20}>
                        {this.renderRow(columns, level)}
                    </StickyBox>

        }
        else if(useTabbed){
            return <div className={cn}>
                {this.renderTabbedLayout(columns, level)}
            </div>
        }
        else {
            return <div className={cn}>
                {this.renderRow(columns, level)}
            </div>
}
    }
    render = () => {
        this.keyDict = {}
        const columns = this.props.grid.columns
        return this.renderColumns(null, columns, 0)
    }
}
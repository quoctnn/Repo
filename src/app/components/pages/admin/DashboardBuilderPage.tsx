import * as React from "react";
import { connect } from 'react-redux'
import "./DashboardBuilderPage.scss"
import { ReduxState } from "../../../redux";
import { Button, FormGroup, Label, Input } from "reactstrap";
import { uniqueId } from "../../../utilities/Utilities";
import { translate } from '../../../localization/AutoIntlProvider';
export interface OwnProps
{
    match:any,
}
type ReduxStateProps = {
}
type ReduxDispatchProps = {
}
type State = {
    columns:number
    rows:Row[]
    useFillMode:boolean
    gap:number
    modules:GridModule[]
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
type Row = {
    id:string
}
type GridModule = {
    column:number
    row:number
    width:number
    height:number
    id:string
}
class DashboardBuilderPage extends React.Component<Props, State>
{
    static modeFillClass = "dash-fill"
    bodyClassAdded = false
    constructor(props:Props) {
        super(props);
        this.state = {
            columns:12,
            rows:[{id:uniqueId()}],
            useFillMode:false,
            gap:15,
            modules:[]//[{id:uniqueId(), column:1, row:1, width:3, height:3}]
        }
        this.setBodyClass()
    }
    setBodyClass = () => {
        this.bodyClassAdded = true
        document.body.classList.add(DashboardBuilderPage.modeFillClass)
    }
    componentWillUnmount = () => {
        if(this.bodyClassAdded)
            document.body.classList.remove(DashboardBuilderPage.modeFillClass)
    }
    onModuleMouseDown = (index:number) => (event: React.MouseEvent<HTMLDivElement>) => {
        const element = event.target as HTMLElement
        element.style.zIndex = "1000";
        // move it out of any current parents directly into body
        // to make it positioned relative to the body
        //document.body.appendChild(element);
        // ...and put that absolutely positioned ball under the cursor

        //moveAt(event.pageX, event.pageY);

        // centers the ball at (pageX, pageY) coordinates
        const rect = element.getBoundingClientRect()
        element.style.width = rect.width + "px"
        element.style.height = rect.height + "px"

        function moveAt(movementX:number, movementY:number) {
            const l = parseInt(element.style.left) || 0
            const t = parseInt(element.style.top) || 0
            element.style.left = (l + movementX) + "px";
            element.style.top += (t + movementY) + 'px';
        }

        function onMouseMove(event:MouseEvent) {
            moveAt(event.movementX, event.movementY);
        }

        // (3) move the ball on mousemove
        document.addEventListener('mousemove', onMouseMove);

        // (4) drop the ball, remove unneeded handlers
        element.onmouseup = function() {
            element.style.width = null
            element.style.height = null
            element.style.left = null
            element.style.top = null
            document.removeEventListener('mousemove', onMouseMove);
            element.onmouseup = null;
        }
    }
    renderGrid = () => {

        const items = []
        for (let row = 0; row < this.state.rows.length; row++) {
            for (let column = 0; column < this.state.columns; column++) {
                items.push(<div key={"item_" + row + "_" + column} className="grid-item"></div>)
            }
        }
        const gridStyle:React.CSSProperties = {}
        gridStyle.display = "grid"
        gridStyle.gridTemplateColumns = `repeat(${this.state.columns}, 1fr)`
        gridStyle.gridAutoRows = `minmax(100px, calc(${100 / this.state.rows.length}% - 15px))`
        gridStyle.height = this.state.useFillMode ? "100%" : undefined
        gridStyle.gridGap = this.state.gap
        return (<div className="grid" style={gridStyle}>
                {items}
                {this.state.modules.map((module, index) => {

                    const moduleStyle = {gridColumn:module.column + "/ span " + module.width, gridRow: module.row + " / span " + module.height}
                    return <div
                            onMouseDown={this.onModuleMouseDown(index)}
                            onDragStart={() => {return false}}
                            key={"module_" + module.id}
                            style={moduleStyle}
                            className="grid-module"></div>
                })}
                </div>)
    }
    removeRow = (index:number) => (e:React.SyntheticEvent<any>) => {
        if(this.state.rows.length > 1)
        {
            const rows = this.state.rows
            rows.splice(index, 1)
            this.setState({rows})
        }
    }
    addRow = () => {
        const rows = this.state.rows
        rows.push({id:uniqueId()})
        this.setState({rows})
    }
    useFillModeChanged = (event:React.ChangeEvent<HTMLInputElement>) => {

        this.setState({useFillMode:event.target.checked})
    }
    renderSidebar = () => {
        return <>

                    <div className="section">
                        <h3>Settings</h3>
                        <div className="content">
                            <FormGroup check={true}>
                                <Label check={true}>
                                    <Input type="checkbox" onChange={this.useFillModeChanged} checked={this.state.useFillMode} />{" " + translate("Fill Mode")}
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    <div className="section">
                        <h3>Grid Rows</h3>
                        <div className="content">
                            <Button className="" onClick={this.addRow}>Add</Button>
                            {this.state.rows.map((row, index) => {
                                return (<div key={"row_" + row.id} className="row-item">
                                        <div className="title">{row.id}</div>
                                        <Button onClick={this.removeRow(index)} color="danger"><i className="fas fa-times"></i></Button>
                                    </div>)
                            })}
                        </div>
                    </div>
                </>
    }
    render() {
        const {} = this.props
        return(
            <div id="dashboard-builder-page" className="dashboard-container">
                <div className="sidebar">
                    {this.renderSidebar()}
                </div>
                <div className="content">
                    {this.renderGrid()}
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    return {
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(DashboardBuilderPage);
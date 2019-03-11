import * as React from "react";
import { FormGroup, Label, ButtonGroup, Button } from "reactstrap";
import { translate } from "../../localization/AutoIntlProvider";
import { ProjectFilter } from "./ProjectFilter";
import { ContextValue } from "../../components/general/input/ContextFilter";
import { TaskState } from "../../types/intrasocial_types";

export type ProjectMenuData = {
    project:ContextValue
    statusFilter:string[]
    priority:string[]
    assignedTo:number
    responsible:number 
    tags:string[]
    category:string
    term:string
}
type Props = 
{
    data:ProjectMenuData
    onUpdate:(data:ProjectMenuData) => void
}
type State = {
    data:ProjectMenuData
}
export default class ProjectMenu extends React.Component<Props, State> {
    
    constructor(props:Props) {
        super(props);
        this.state = {
            data:{...this.props.data}
        }
    }
    onContextChange = (context:ContextValue) => {
        const data = this.state.data
        data.project = context
        this.setState({data}, this.sendUpdate)
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate(data)
    }
    stateActive = (state:TaskState) => {
        return this.state.data.statusFilter.contains(state)
    }
    toggleState = (state:TaskState) => (event:any) => {
        const data = this.state.data
        const arr = [...data.statusFilter]
        const index = arr.indexOf(state)
        if(index > -1)
            arr.splice(index, 1)
        else 
            arr.push(state)
        data.statusFilter = arr
        this.setState({data}, this.sendUpdate)
    }
    render() {
        const statuses:TaskState[] = Object.keys(TaskState).map(k => TaskState[k])
        return(
            <div className="project-menu">
                <FormGroup>
                    <Label>{translate("project.module.menu.projectfilter.title")}</Label>
                    <ProjectFilter onValueChange={this.onContextChange} value={this.state.data.project} />
                </FormGroup>
                <ButtonGroup className="flex-wrap">
                    {statuses.map(s => <Button color="light" onClick={this.toggleState(s)} key={s} active={this.stateActive(s)}>{s}</Button>)}
                </ButtonGroup>
            </div>
        );
    }
}

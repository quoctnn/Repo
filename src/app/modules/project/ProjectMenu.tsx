import * as React from "react";
import { FormGroup, Label, ButtonGroup, Button } from "reactstrap";
import { translate } from "../../localization/AutoIntlProvider";
import { ProjectFilter } from "./ProjectFilter";
import { ContextValue } from "../../components/general/input/ContextFilter";
import { TaskState, TaskPriority, UserProfile } from '../../types/intrasocial_types';
import { ProfileManager } from "../../managers/ProfileManager";
import { userFullName, userAvatar } from '../../utilities/Utilities';
import { ProjectProfileFilter, ProfileFilterOption } from "./ProjectProfileFilter";

export type ProjectMenuData = {
    project:ContextValue
    state:string[]
    priority:string[]
    assignedTo:number
    responsible:number 
    creator:number 
    tags:string[]
    category:string
    term:string,
    notAssigned:boolean
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
    componentDidUpdate = (prevProps:Props, prevState:State ) => {
        /*
        const data = this.state.data
        let updated = false
        if(prevState.data.project != this.state.data.project && (data.assignedTo || data.responsible))
        {
            data.assignedTo = null
            data.responsible = null
            updated = true
        }
        //more updates?
        if(updated)
        {
            this.setState({data})
        }
        */
    } 
    onContextChange = (context:ContextValue) => {
        const data = {...this.state.data}
        data.project = context
        this.setState({data}, this.sendUpdate)
    }
    onAssignedChange = (value:ProfileFilterOption) => {
        const data = this.state.data
        data.assignedTo = value && value.id
        this.setState({data}, this.sendUpdate)
    }
    onResponsibleChange = (value:ProfileFilterOption) => {
        const data = this.state.data
        data.responsible = value && value.id
        this.setState({data}, this.sendUpdate)
    }
    onCreatorChange = (value:ProfileFilterOption) => {
        const data = this.state.data
        data.creator = value && value.id
        this.setState({data}, this.sendUpdate)
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate(data)
    }
    stateActive = (state:TaskState) => {
        return this.state.data.state.contains(state)
    }
    toggleState = (state:TaskState) => (event:any) => {
        const data = this.state.data
        const arr = [...data.state]
        arr.toggleElement(state)
        data.state = arr
        this.setState({data}, this.sendUpdate)
    }

    priorityActive = (priority:TaskPriority) => {
        return this.state.data.priority.contains(priority)
    }
    togglePriority = (priority:TaskPriority) => (event:any) => {
        const data = this.state.data
        const arr = [...data.priority]
        arr.toggleElement(priority)
        data.priority = arr
        this.setState({data}, this.sendUpdate)
    }
    getProfileFilterOption = (profile:UserProfile):ProfileFilterOption => {
        return {value:profile.slug_name, label:userFullName(profile), id:profile.id, icon:userAvatar(profile)}
    }
    render() {
        const statuses:TaskState[] = Object.keys(TaskState).map(k => TaskState[k])
        const priorities:TaskPriority[] = Object.keys(TaskPriority).map(k => TaskPriority[k])

        const assignedTo = this.state.data.assignedTo && ProfileManager.getProfileById(this.state.data.assignedTo)
        const assignedToValue = assignedTo && this.getProfileFilterOption(assignedTo)

        const responsible = this.state.data.responsible && ProfileManager.getProfileById(this.state.data.responsible)
        const responsibleValue = responsible && this.getProfileFilterOption(responsible)

        const creator = this.state.data.creator && ProfileManager.getProfileById(this.state.data.creator)
        const creatorValue = creator && this.getProfileFilterOption(creator)

        return(
            <div className="project-menu">
                <FormGroup>
                    <Label>{translate("project.module.menu.projectfilter.title")}</Label>
                    <ProjectFilter onValueChange={this.onContextChange} value={this.state.data.project} />
                </FormGroup>
                <FormGroup>
                    <Label>{translate("project.module.menu.state.title")}</Label>
                    <ButtonGroup className="flex-wrap d-block">
                        {statuses.map(s => <Button color="light" onClick={this.toggleState(s)} key={s} active={this.stateActive(s)}>{s}</Button>)}
                    </ButtonGroup>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("project.module.menu.priority.title")}</Label>
                    <ButtonGroup className="flex-wrap d-block">
                        {priorities.map(p => <Button color="light" onClick={this.togglePriority(p)} key={p} active={this.priorityActive(p)}>{p}</Button>)}
                    </ButtonGroup>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("project.module.menu.assigned_to.title")}</Label>
                    <ProjectProfileFilter project={this.state.data.project && this.state.data.project.id} value={assignedToValue} onValueChange={this.onAssignedChange} />
                </FormGroup>
                <FormGroup>
                    <Label>{translate("project.module.menu.responsible.title")}</Label>
                    <ProjectProfileFilter project={this.state.data.project && this.state.data.project.id} value={responsibleValue} onValueChange={this.onResponsibleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>{translate("project.module.menu.creator.title")}</Label>
                    <ProjectProfileFilter project={this.state.data.project && this.state.data.project.id} value={creatorValue} onValueChange={this.onCreatorChange} />
                </FormGroup>
                
            </div>
        );
    }
}

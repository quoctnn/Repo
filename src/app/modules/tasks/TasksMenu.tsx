import * as React from "react";
import { FormGroup, Label, ButtonGroup, Button } from "reactstrap";
import { translate } from "../../localization/AutoIntlProvider";
import { ProjectFilter } from "./ProjectFilter";
import { ContextValue } from "../../components/general/input/ContextFilter";
import { TaskState, TaskPriority, UserProfile } from '../../types/intrasocial_types';
import { ProfileManager } from "../../managers/ProfileManager";
import { userFullName, userAvatar } from '../../utilities/Utilities';
import { ProjectProfileFilter } from "./ProjectProfileFilter";
import { ProfileSelectorOption } from "../../components/general/input/SelectExtensions";
import CollapseComponent from "../../components/general/CollapseComponent";
import { AnimatedIconStack } from "../../components/general/AnimatedIconStack";

export type TasksMenuData = {
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
    data:TasksMenuData
    onUpdate:(data:TasksMenuData) => void
    disableContextSearch?:boolean
    projectMembers:number[]
}
type State = {
    data:TasksMenuData
    subMenuVisible:boolean
}
export default class TaskMenu extends React.Component<Props, State> {
    
    constructor(props:Props) {
        super(props);
        this.state = {
            data:{...this.props.data},
            subMenuVisible:false
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
    onAssignedChange = (value:ProfileSelectorOption) => {
        const data = this.state.data
        data.assignedTo = value && value.id
        this.setState({data}, this.sendUpdate)
    }
    onResponsibleChange = (value:ProfileSelectorOption) => {
        const data = this.state.data
        data.responsible = value && value.id
        this.setState({data}, this.sendUpdate)
    }
    onCreatorChange = (value:ProfileSelectorOption) => {
        const data = this.state.data
        data.creator = value && value.id
        this.setState({data}, this.sendUpdate)
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate({...data})
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
    toggleSubMenu = () => {
        this.setState((prevState:State) => {
            return {subMenuVisible:!prevState.subMenuVisible}
        })
    }
    getProfileFilterOption = (profile:UserProfile):ProfileSelectorOption => {
        return {value:profile.slug_name, label:userFullName(profile), id:profile.id, icon:userAvatar(profile, true)}
    }
    render() {
        const states:TaskState[] = TaskState.all
        const priorities:TaskPriority[] = TaskPriority.all

        const assignedTo = this.state.data.assignedTo && ProfileManager.getProfileById(this.state.data.assignedTo)
        const assignedToValue = assignedTo && this.getProfileFilterOption(assignedTo)

        const responsible = this.state.data.responsible && ProfileManager.getProfileById(this.state.data.responsible)
        const responsibleValue = responsible && this.getProfileFilterOption(responsible)

        const creator = this.state.data.creator && ProfileManager.getProfileById(this.state.data.creator)
        const creatorValue = creator && this.getProfileFilterOption(creator)

        return(
            <div className="tasks-menu">
                {!this.props.disableContextSearch && 
                <FormGroup>
                    <Label>{translate("task.module.menu.projectfilter.title")}</Label>
                    <ProjectFilter onValueChange={this.onContextChange} value={this.state.data.project} />
                </FormGroup>
                }
                <FormGroup>
                    <Label>{translate("task.module.menu.state.title")}</Label>
                    <ButtonGroup className="flex-wrap d-block">
                        {states.map(s => <Button size="sm" color="secondary" outline={true} onClick={this.toggleState(s)} key={s} active={this.stateActive(s)}>{translate("task.state." + s)}</Button>)}
                    </ButtonGroup>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("task.module.menu.priority.title")}</Label>
                    <ButtonGroup className="flex-wrap d-block">
                        {priorities.map(p => <Button size="sm" color="secondary" outline={true} onClick={this.togglePriority(p)} key={p} active={this.priorityActive(p)}>{translate("task.priority." + p)}</Button>)}
                    </ButtonGroup>
                </FormGroup>
                <div onClick={this.toggleSubMenu} className="collapse-trigger d-flex">
                    <div>{translate("task.menu.secondary.filters.title")}</div>                            
                    <AnimatedIconStack iconA="fas fa-chevron-down" iconB="fas fa-chevron-down" active={this.state.subMenuVisible} />
                </div>
                <CollapseComponent visible={this.state.subMenuVisible}>
                    <FormGroup>
                        <Label>{translate("task.module.menu.assigned_to.title")}</Label>
                        <ProjectProfileFilter projectMembers={this.props.projectMembers} value={assignedToValue} onValueChange={this.onAssignedChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>{translate("task.module.menu.responsible.title")}</Label>
                        <ProjectProfileFilter projectMembers={this.props.projectMembers} value={responsibleValue} onValueChange={this.onResponsibleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>{translate("task.module.menu.creator.title")}</Label>
                        <ProjectProfileFilter projectMembers={this.props.projectMembers} value={creatorValue} onValueChange={this.onCreatorChange} />
                    </FormGroup>
                </CollapseComponent>
            </div>
        );
    }
}

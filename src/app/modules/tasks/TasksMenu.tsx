import * as React from "react";
import { FormGroup, Label, ButtonGroup, Button, ButtonDropdown, DropdownItem, DropdownToggle, DropdownMenu, Input } from "reactstrap";
import { translate } from "../../localization/AutoIntlProvider";
import { ProjectFilter } from "./ProjectFilter";
import { ContextValue } from "../../components/general/input/ContextFilter";
import { TaskState, TaskPriority, UserProfile, Project } from '../../types/intrasocial_types';
import { ProfileManager } from "../../managers/ProfileManager";
import { userFullName, userAvatar, uniqueId } from '../../utilities/Utilities';
import { ProfileSelectorOption } from "../../components/general/input/SelectExtensions";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import "./TasksMenu.scss";
import { ContextDataProps, withContextData } from '../../hoc/WithContextData';

export type TasksMenuData = {
    project: ContextValue
    state: string[]
    priority: string[]
    assignedTo: number
    responsible: number
    creator: number
    tags: string[]
    category: string
    term: string,
    notAssigned: boolean
}
type OwnProps = {
    data: TasksMenuData
    onUpdate: (data: TasksMenuData) => void
    disableContextSearch?: boolean
    projectMembers: number[]
}
type Props = OwnProps & ContextDataProps

type State = {
    data: TasksMenuData
    subMenuVisible: boolean
    categoryMenuOpen: boolean

}
class TaskMenu extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            data: { ...this.props.data },
            subMenuVisible: false,
            categoryMenuOpen: false
        }
    }
    componentDidUpdate = (prevProps: Props, prevState: State) => {
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
    onContextChange = (context: ContextValue) => {
        const data = { ...this.state.data }
        data.project = context
        this.setState({ data }, this.sendUpdate)
    }
    onAssignedChange = (value: ProfileSelectorOption) => {
        const data = this.state.data
        data.assignedTo = value && value.id
        this.setState({ data }, this.sendUpdate)
    }
    onResponsibleChange = (value: ProfileSelectorOption) => {
        const data = this.state.data
        data.responsible = value && value.id
        this.setState({ data }, this.sendUpdate)
    }
    onCreatorChange = (value: ProfileSelectorOption) => {
        const data = this.state.data
        data.creator = value && value.id
        this.setState({ data }, this.sendUpdate)
    }
    sendUpdate = () => {
        const { data } = this.state
        this.props.onUpdate({ ...data })
    }
    stateActive = (state: TaskState) => {
        return this.state.data.state.contains(state)
    }
    toggleState = (state: TaskState) => (event: any) => {
        const data = this.state.data
        const arr = [...data.state]
        arr.toggleElement(state)
        data.state = arr
        this.setState({ data }, this.sendUpdate)
    }
    toggleCategory = () => {
        this.setState({ categoryMenuOpen: !this.state.categoryMenuOpen })
    }
    setCategory = (newCategory: string) => (e: React.MouseEvent) => {
        const { category, ...rest } = this.state.data
        this.setState({ data: { category: newCategory, ...rest } }, this.sendUpdate)
    }
    tagsValueChanged = (event: React.KeyboardEvent<HTMLElement>) => {
        switch (event.key) {
            case 'Enter':
                const tagsElement = document.getElementById("tags") as HTMLInputElement
                if (tagsElement){
                    const { tags, ...rest } = this.state.data
                    var value = tagsElement.value
                    if (!value) {
                        this.setState({ data: { tags: [], ...rest } }, this.sendUpdate)
                    } else {
                        this.setState({ data: { tags: value.replace(" ", "").split(","), ...rest } }, this.sendUpdate)
                    }
                }
        }
    }

    priorityActive = (priority: TaskPriority) => {
        return this.state.data.priority.contains(priority)
    }
    togglePriority = (priority: TaskPriority) => (event: any) => {
        const data = this.state.data
        const arr = [...data.priority]
        arr.toggleElement(priority)
        data.priority = arr
        this.setState({ data }, this.sendUpdate)
    }
    toggleSubMenu = () => {
        this.setState((prevState: State) => {
            return { subMenuVisible: !prevState.subMenuVisible }
        })
    }
    getProfileFilterOption = (profile: UserProfile): ProfileSelectorOption => {
        return { value: profile.slug_name, label: userFullName(profile), id: profile.id, icon: userAvatar(profile, true) }
    }
    toggleAssignedTo = () => {
        this.setState((prevState: State) => {
            const data = prevState.data
            if (!!data.assignedTo)
                data.assignedTo = null
            else
                data.assignedTo = AuthenticationManager.getAuthenticatedUser().id
            return { data: data }
        }, this.sendUpdate)
    }
    toggleResponsible = () => {
        this.setState((prevState: State) => {
            const data = prevState.data
            if (!!data.responsible)
                data.responsible = null
            else
                data.responsible = AuthenticationManager.getAuthenticatedUser().id
            return { data: data }
        }, this.sendUpdate)
    }
    render() {
        const project = this.props.contextData.project as Project
        if (!project) return null
        const states: TaskState[] = TaskState.all
        const priorities: TaskPriority[] = TaskPriority.all
        const assignedTo = this.state.data.assignedTo && ProfileManager.getProfileById(this.state.data.assignedTo)
        // const assignedToValue = assignedTo && this.getProfileFilterOption(assignedTo)

        const responsible = this.state.data.responsible && ProfileManager.getProfileById(this.state.data.responsible)
        // const responsibleValue = responsible && this.getProfileFilterOption(responsible)

        // const creator = this.state.data.creator && ProfileManager.getProfileById(this.state.data.creator)
        // const creatorValue = creator && this.getProfileFilterOption(creator)

        return (
            <div className="tasks-menu">
                {!this.props.disableContextSearch &&
                    <FormGroup>
                        <Label className="form-group-title">{translate("task.module.menu.projectfilter.title")}</Label>
                        <ProjectFilter onValueChange={this.onContextChange} value={this.state.data.project} />
                    </FormGroup>
                }
                <FormGroup>
                    <Label className="form-group-title">{translate("task.module.menu.state.title")}</Label>
                    <ButtonGroup className="form-button-group">
                        {states.map(s => <Button size="sm" color="secondary" outline={true} onClick={this.toggleState(s)} key={s} active={this.stateActive(s)}>{translate("task.state." + s)}</Button>)}
                    </ButtonGroup>
                </FormGroup>
                <FormGroup>
                    <Label className="form-group-title">{translate("task.module.menu.priority.title")}</Label>
                    <ButtonGroup className="form-button-group">
                        {priorities.map(p => <Button size="sm" color="secondary" outline={true} onClick={this.togglePriority(p)} key={p} active={this.priorityActive(p)}>{translate("task.priority." + p)}</Button>)}
                    </ButtonGroup>
                </FormGroup>
                <FormGroup>
                    <Label className="form-group-title">{translate("task.module.menu.related_me.title")}</Label>
                    <ButtonGroup className="form-button-group">
                        <Button size="sm" color="secondary" outline={true} onClick={this.toggleAssignedTo} active={!!assignedTo}>{translate("task.assigned.me")}</Button>
                        <Button size="sm" color="secondary" outline={true} onClick={this.toggleResponsible} active={!!responsible}>{translate("task.responsible.me")}</Button>
                    </ButtonGroup>
                </FormGroup>
                {project.categories.length > 0 &&
                    <FormGroup>
                        <Label className="form-group-title">{translate("task.category.title")}</Label>
                        <ButtonDropdown isOpen={this.state.categoryMenuOpen} toggle={this.toggleCategory}>
                            <DropdownToggle caret>
                                {this.state.data.category &&
                                    this.state.data.category.length > 50 ? this.state.data.category.substring(0, 50) + ".." : this.state.data.category
                                    ||
                                    translate("task.category.select")
                                }
                            </DropdownToggle>
                            <DropdownMenu style={{ position: "absolute" }}>
                                <DropdownItem onClick={this.setCategory(undefined)}>&nbsp;</DropdownItem>
                                {project.categories.map((category) => <DropdownItem key={uniqueId()} onClick={this.setCategory(category)}>{category.length > 50 ? category.substring(0, 50) + ".." : category}</DropdownItem>)}
                            </DropdownMenu>
                        </ButtonDropdown>
                    </FormGroup>
                }
                {project.tags.length > 0 &&
                    <FormGroup>
                        <Label className="form-group-title">{translate("task.tags.filter.title")}</Label>
                        <Input className="form-text-input" id="tags" type="text" placeholder={"Ex. " + project.tags[0]} onKeyDown={this.tagsValueChanged} />
                    </FormGroup>
                }
            </div>
        );
    }
}
export default withContextData(TaskMenu)

/* <div className="collapse-menu">
    <div className="trigger-container">
        <div onClick={this.toggleSubMenu} className="collapse-trigger">
            <div className="collapse-text">{translate("task.menu.secondary.filters.title")}</div>
            <AnimatedIconStack iconA="fas fa-chevron-down" iconB="fas fa-chevron-down" active={this.state.subMenuVisible} />
        </div>
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
</div></> */
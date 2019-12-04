import * as React from "react";
import classnames from 'classnames';
import { MenuItem } from '../../../../types/menuItem';
import { translate } from '../../../../localization/AutoIntlProvider';
import "../SideBarItem.scss";
import SideBarProjectContent from "./SideBarProjectContent";
import { uniqueId } from "../../../../utilities/Utilities";
import ProjectCreateComponent from "../../../general/contextCreation/ProjectCreateComponent";
import { Project, ObjectHiddenReason } from "../../../../types/intrasocial_types";
import { ContextDataProps, withContextData } from "../../../../hoc/WithContextData";

type State = {
    menuItem: MenuItem
    createProjectFormVisible: boolean
    createProjectFormReloadKey: string
}

type OwnProps = {
    index:string
    active:string
    addMenuItem:(item:MenuItem) => void // This should be a menuItem
    onClick:(e:React.MouseEvent) => void
}

type Props = ContextDataProps & OwnProps

class SideBarProjectItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            menuItem: undefined,
            createProjectFormVisible: false,
            createProjectFormReloadKey: undefined,
        }
    }

    componentDidMount = () => {
        if (this.props.index) {
            const menuItem:MenuItem = {
                index: this.props.index,
                title: translate("common.project.projects"),
                subtitle: undefined,
                content: <SideBarProjectContent onCreate={this.createNew} />,
            }
            this.setState({menuItem: menuItem})
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        this.props.addMenuItem(this.state.menuItem)
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const createProjectForm = this.state.createProjectFormVisible != nextState.createProjectFormVisible || this.state.createProjectFormReloadKey != nextState.createProjectFormReloadKey
        const changedFocus = (this.props.active == this.props.index || nextProps.active == this.props.index) && this.props.active != nextProps.active
        return changedFocus || createProjectForm
    }

    createNew = (e?: React.MouseEvent) => {
        this.setState({createProjectFormVisible:true, createProjectFormReloadKey:uniqueId()})
    }

    renderAddProjectForm = () => {
        const visible = this.state.createProjectFormVisible
        const {community} = this.props.contextData
        if (community) {
            return <ProjectCreateComponent groups={[]} onCancel={this.hideProjectCreateForm} community={community.id} key={this.state.createProjectFormReloadKey} visible={visible} onComplete={this.handleProjectCreateForm} />
        } else {
            return null
        }
    }

    hideProjectCreateForm = () => {
        this.setState((prevState:State) => {
            return {createProjectFormVisible:false}
        })
    }

    handleProjectCreateForm = (project:Project) => {
        if(!!project)
        {
            if(project.hidden_reason && project.hidden_reason == ObjectHiddenReason.review)
            {
                this.hideProjectCreateForm()
                alert("Project has been sent for review, and will be available when accepted")
            }
            else if(project.uri)
            {
                this.hideProjectCreateForm()
                window.app.navigateToRoute(project.uri)
            }
        }
    }

    render = () => {
        const active = this.props.active == this.props.index
        const css = classnames("sidebar-item", {active: active})
        const iconCss = classnames("fa-circle", active ? "fa" : "far")
        return (
            <div id={this.props.index} className={css} onClick={this.props.onClick}>
                <i className={iconCss}></i>
                {this.state.menuItem &&
                    this.state.menuItem.title
                    ||
                    translate("common.project.projects")
                }
                {this.renderAddProjectForm()}
            </div>
        )
    }
}

export default withContextData(SideBarProjectItem)
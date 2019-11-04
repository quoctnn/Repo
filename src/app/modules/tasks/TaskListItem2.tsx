import * as React from 'react'
import "./TaskListItem.scss"
import { Task, TaskActions, TaskPriority, TaskState } from '../../types/intrasocial_types';
import { GenericListItem } from '../../components/general/GenericListItem';
import classnames from 'classnames';
import { ProfileManager } from '../../managers/ProfileManager';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import StackedAvatars from '../../components/general/StackedAvatars';
import { Mark } from '../../components/general/Mark';
import { TimeComponent } from '../../components/general/TimeComponent';
import UserProfileAvatar from '../../components/general/UserProfileAvatar';

type OwnProps = {
    communityId:number
    task:Task
    onActionPress:(action:TaskActions, extra?:Object, completion?:(success:boolean) => void) => void
    user:number
}
type State = {
}
type Props = OwnProps
export default class TaskListItem2 extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    renderFooter = () => {
        const {task, user} = this.props
        return <>
                    {task.state && <Badge className="ml-1" color={TaskState.colorForState(task.state)}>{translate("task.state." + task.state)}</Badge>}
                    {task.priority && <Badge className="ml-1" color={TaskPriority.colorForPriority(task.priority)}>{translate("task.priority." + task.priority)}</Badge>}
                    {task.due_date && <Badge className="ml-1" color="secondary"><TimeComponent date={task.due_date}/></Badge>}
                </>
    }
    renderRight = () => {
        const {task} = this.props
        const assignedTo = task.assigned_to || []
        const showVbar = (task.priority || task.due_date) && assignedTo.length > 0
        return <div className="d-flex align-items-center h-100">
                    <div className="d-flex flex-column small-text align-items-end">
                        {task.priority && <div className={"text-" + TaskPriority.colorForPriority(task.priority)}>{translate("task.priority." + task.priority)}</div>}
                        {task.due_date && <TimeComponent date={task.due_date}/>}
                    </div>
                    {showVbar && <div className="v-bar mx-2" style={{ width: 1, height: "75%" }}></div>}
                    <StackedAvatars size={24} userIds={assignedTo} />
                </div>
    }
    navigateToTask = () => {
        window.app.navigateToRoute(this.props.task.uri)
    }
    render()
    {
        const {task, user} = this.props
        const stateId = "tasklistitem_tooltip_state_" + task.id
        const stateTooltip = <UncontrolledTooltip target={stateId}>{translate("task.state." + task.state)}</UncontrolledTooltip>
        const header = task.title
        const footer = null//this.renderFooter()
        const assignedTo = task.assigned_to || []
        const right = this.renderRight()
        const hasAssignees = assignedTo.length > 0
        const assigned = hasAssignees && assignedTo.find(p => p == user)
        const responsible = task.responsible && task.responsible == user ? task.responsible : undefined
        const profile = ProfileManager.ensureExists(assigned || responsible)
        const avatarClass = classnames({
            "task-responsible border-success":!!responsible,
            "task-assigned":!!assigned,
            "task-unassigned border-warning":!hasAssignees,
            //"border-success": hasAssignees,
            "border-w0":!responsible
        })
        const left = <>
                    <UserProfileAvatar size={40} image={profile && profile.avatar} containerClassName={avatarClass} />
                    <Mark id={stateId} size={8} className={"bg-" + TaskState.colorForState(task.state)} />
                    {stateTooltip}
                    </>
        const cn = classnames("task-list-item main-content-secondary-background")
        return <GenericListItem onClick={this.navigateToTask}
                header={header}
                footer={footer}
                right={right}
                left={left}
                containerClassName="task-list-item-container"
                className={cn} />

    }
}
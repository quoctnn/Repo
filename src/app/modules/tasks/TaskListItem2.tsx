import * as React from 'react'
import "./TaskListItem.scss"
import { Task, TaskActions, TaskPriority, TaskState, TimeSpent, ObjectAttributeType } from '../../types/intrasocial_types';
import { GenericListItem } from '../../components/general/GenericListItem';
import classnames from 'classnames';
import { ProfileManager } from '../../managers/ProfileManager';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import StackedAvatars from '../../components/general/StackedAvatars';
import { Mark } from '../../components/general/Mark';
import { TimeComponent } from '../../components/general/TimeComponent';
import UserProfileAvatar from '../../components/general/UserProfileAvatar';
import { ObjectAttributeTypeExtension, StatusBadgeList } from '../../components/status/StatusBadgeList';
import Moment from 'react-moment';
import { DateFormat, uniqueId } from '../../utilities/Utilities';
import ReactDOM = require('react-dom');

type OwnProps = {
    communityId: number
    task: Task
    onActionPress: (action: TaskActions, extra?: Object, completion?: (success: boolean) => void) => void
    user: number
}
type State = {
    hover: boolean
    mouseY: number
}
type Props = OwnProps
export default class TaskListItem2 extends React.Component<Props, State> {
    private itemRef = React.createRef<HTMLDivElement>();
    constructor(props: Props) {
        super(props);
        this.state = {
            hover: false,
            mouseY: 0
        }
    }

    showHoverCard = (e: React.MouseEvent) => {
        this.setState({ hover: true, mouseY: e.pageY })
    }

    removeHoverCard = () => {
        this.setState({ hover: false })
    }

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        const hover = this.state.hover != nextState.hover
        const mouse = this.state.mouseY != nextState.mouseY
        return hover || mouse
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.state.hover) {
            const height = document.getElementById("hover-card").hasChildNodes() ? document.getElementById("hover-card").children[0].clientHeight : 150
            var taskCard = this.renderTaskCard()
            const style = taskCard.props.style
            if (height + this.state.mouseY + 50 > window.pageYOffset + window.innerHeight) {
                style["bottom"] = window.innerHeight - this.state.mouseY + 30
                taskCard = React.cloneElement(taskCard, {style})
            } else {
                style["top"] = this.state.mouseY + 30
                taskCard = React.cloneElement(taskCard, {style})
            }
            ReactDOM.render(taskCard, document.getElementById("hover-card"))
        } else if (!this.state.hover && prevState.hover) {
            ReactDOM.render(null, document.getElementById("hover-card"))
        }
    }

    componentWillUnmount = () => {
        ReactDOM.render(null, document.getElementById("hover-card"))
    }

    renderFooter = () => {
        const { task, user } = this.props
        return <>
            {task.state && <Badge className="ml-1" color={TaskState.colorForState(task.state)}>{translate("task.state." + task.state)}</Badge>}
            {task.priority && <Badge className="ml-1" color={TaskPriority.colorForPriority(task.priority)}>{translate("task.priority." + task.priority)}</Badge>}
            {task.due_date && <Badge className="ml-1" color="secondary"><TimeComponent date={task.due_date} /></Badge>}
        </>
    }
    renderRight = () => {
        const { task } = this.props
        const assignedTo = task.assigned_to || []
        const showVbar = (task.priority || task.due_date) && assignedTo.length > 0
        return <div className="d-flex align-items-center h-100">
            <div className="d-flex flex-column small-text align-items-end">
                {task.priority && <div className={"text-" + TaskPriority.colorForPriority(task.priority)}>{translate("task.priority." + task.priority)}</div>}
                {task.due_date && <TimeComponent date={task.due_date} />}
            </div>
            {showVbar && <div className="v-bar mx-2" style={{ width: 1, height: "75%" }}></div>}
            <StackedAvatars size={24} userIds={assignedTo} />
        </div>
    }
    navigateToTask = () => {
        window.app.navigateToRoute(this.props.task.uri)
    }
    getAttributeBadgeSettings = (task: Task) => {
        const attrs = task.attributes || []
        const attributes: { [id: string]: boolean } = {}
        attrs.forEach(a => {
            if (a.attribute != ObjectAttributeType.link &&
                a.attribute != ObjectAttributeType.update &&
                a.user == this.props.user) // TODO: Is this right?
                attributes[a.attribute] = true
        })
        return Object.keys(attributes) as (ObjectAttributeType | ObjectAttributeTypeExtension)[]
    }
    renderTaskAttributes = (task: Task) => {
        const badgeSettings = this.getAttributeBadgeSettings(task)
        return <StatusBadgeList setting={badgeSettings} />
    }

    renderTaskCard = () => {
        const task = this.props.task
        const creator = ProfileManager.getProfileById(task.creator)
        const lastChanged = ProfileManager.getProfileById(task.latest_change_by)
        const estimatedTime: TimeSpent = { hours: task.estimated_hours || 0, minutes: task.estimated_minutes || 0 }
        const itemRect = this.itemRef.current.getBoundingClientRect()
        const css = classnames("task-hover-card", { "visible": this.state.hover })
        return (
            <div className={css} onClick={this.navigateToTask} style={{left: itemRect.left, width: itemRect.width }
            }>
                <div className="state-info">
                    {task.priority &&
                        <div className="task-priority">
                            {translate("task.module.menu.priority.title")}:
                            <span style={{ color: TaskPriority.hexColor(task.priority) }}>
                                {translate("task.priority." + task.priority)}
                            </span>
                        </div>
                        ||
                        <div className="task-priority">
                            {translate("task.module.menu.priority.title")}:
                            <span style={{ color: "grey" }}>
                                {translate("task.priority.not-set")}
                            </span>
                        </div>
                    }
                    <div className="task-state">
                        {translate("task.module.menu.state.title")}:
                        <span style={{ color: TaskState.hexColor(task.state) }}>
                            {translate("task.state." + task.state)}
                        </span>
                    </div>
                    {task.due_date &&
                        <div className="task-due-date">
                            {translate("task.due_date.title")}: <Moment date={task.due_date} format={DateFormat.day} />
                        </div>
                    }
                </div>
                <div className="task-details">
                    {task.attributes &&
                        <div className="task-attributes">{this.renderTaskAttributes(task)}</div>
                    }
                    {task.tags &&
                        <div className="task-tags">
                            {task.tags.map((tag) => <Badge key={uniqueId()} className="tag" color="info">{tag}</Badge>)}
                        </div>
                    }
                </div>
                {task.description &&
                    <div className="task-description">{task.description}</div>
                    ||
                    <div className="task-description">{task.title}</div>
                }
                <div className="task-hover-card-footer">
                    <div className="task-user-details">
                        {creator &&
                            <div className="task-creator">
                                {translate("task.module.menu.creator.title") + ": " + creator.first_name + " " + creator.last_name}
                            </div>
                        }
                        {lastChanged &&
                            <div className="task-last-changed">
                                {translate("task.module.menu.last-changed.title") + ": " + lastChanged.first_name + " " + lastChanged.last_name}
                            </div>
                        }
                    </div>
                    <div className="task-time-use">
                        {estimatedTime &&
                            <div className="task-estimated-time">
                                {translate("task.module.menu.estimated-time.title") + ": " + TimeSpent.toString(estimatedTime)}
                            </div>
                        }
                        {task.spent_time &&
                            <div className="task-spent-time">
                                {translate("task.module.menu.spent-time.title") + ": " + TimeSpent.toString(task.spent_time)}
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
    render() {
        const { task, user } = this.props
        const stateId = "tasklistitem_tooltip_state_" + task.id
        const stateTooltip = <UncontrolledTooltip target={stateId}>{translate("task.state." + task.state)}</UncontrolledTooltip>
        const header = task.title
        const footer = this.renderFooter()
        const assignedTo = task.assigned_to || []
        const right = this.renderRight()
        const hasAssignees = assignedTo.length > 0
        const assigned = hasAssignees && assignedTo.find(p => p == user)
        const responsible = task.responsible && task.responsible == user ? task.responsible : undefined
        const profile = ProfileManager.ensureExists(assigned || responsible)
        const avatarClass = classnames({
            "task-responsible border-success": !!responsible,
            "task-assigned": !!assigned,
            "task-unassigned border-warning": !hasAssignees,
            //"border-success": hasAssignees,
            "border-w0": !responsible
        })
        const left = <>
            <UserProfileAvatar size={40} profileId={profile && profile.id} containerClassName={avatarClass} />
            <Mark id={stateId} size={8} className={"bg-" + TaskState.colorForState(task.state)} />
            {stateTooltip}
        </>
        const cn = classnames("task-list-item main-content-secondary-background")
        return <div ref={this.itemRef} className="task-item-hover-container" onMouseMove={this.showHoverCard} onMouseLeave={this.removeHoverCard}>
            <GenericListItem onClick={this.navigateToTask}
                className={cn}
                header={header}
                // footer={footer}
                right={right}
                left={left}
                containerClassName="task-list-item-container" />
        </div>
    }
}
//onMouseEnter={this.showHoverCard}
import * as React from 'react'
import classnames from "classnames"
import "./TaskListItem.scss"
import { SimpleTask } from '../../types/intrasocial_types';
import { translate } from '../../localization/AutoIntlProvider';

type OwnProps = {
    task:SimpleTask
}
type State = {
}
type Props = OwnProps
export default class TaskListItem extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    shouldComponentUpdate = (nextProps:Props) => {
        return nextProps.task.updated_at != this.props.task.updated_at
    }
    render()
    {
        const task = this.props.task
        const cn = classnames("task-content", "task-state-" + task.state)
        const taskPriorityClass = "task-priority " + task.priority
        return (<div className="task-list-item">
                    <div className={cn}>
                        <div className="title text-truncate">{task.title}</div>
                        {task.priority && <div className={taskPriorityClass}>{translate("task.priority." + task.priority)}</div>} 
                    </div>
                </div>)
    }
}
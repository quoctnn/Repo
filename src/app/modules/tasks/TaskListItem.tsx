import * as React from 'react'
import classnames from "classnames"
import "./TaskListItem.scss"
import { SimpleTask, TaskPriority, TaskActions, TaskState, StatusActions, ContextNaturalKey, UploadedFile } from '../../types/intrasocial_types';
import { translate } from '../../localization/AutoIntlProvider';
import {ButtonGroup, Button, FormGroup, Label } from 'reactstrap';
import { StatusComposerComponent } from '../../components/status/StatusComposerComponent';
import { DateTimePicker } from '../../components/general/input/DateTimePicker';
import * as moment from 'moment-timezone';
import ConfirmDialog from '../../components/general/dialogs/ConfirmDialog';
import CollapseComponent from '../../components/general/CollapseComponent';
let timezone = moment.tz.guess()

type OwnProps = {
    communityId:number
    task:SimpleTask
    onActionPress:(action:TaskActions, extra?:Object, completion?:(success:boolean) => void) => void
}
type State = {
    open:boolean
    time:moment.Moment
    showConfirmCloseDialog:boolean
}
type Props = OwnProps
export default class TaskListItem extends React.Component<Props, State> {  
    timepicker =  React.createRef<DateTimePicker>();
    timecomposer =  React.createRef<StatusComposerComponent>();
    statuscomposer = React.createRef<StatusComposerComponent>();
    constructor(props:Props) {
        super(props);
        this.state = {
            open:false,
            time:moment({hour: 8}).tz(timezone),
            showConfirmCloseDialog:false,
            
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.task.updated_at != this.props.task.updated_at || 
                nextProps.task.serialization_date != this.props.task.serialization_date || 
                nextState.open != this.state.open || 
                nextState.time.diff(this.state.time) != 0 || 
                nextState.showConfirmCloseDialog != this.state.showConfirmCloseDialog
        return ret

    }
    setPriority = (priority:TaskPriority) => (event) => {
        this.props.onActionPress(TaskActions.setPriority, {priority})
    }
    stateActive = (state:TaskState) => {
        return this.props.task.state == state
    }
    setTaskState = (state:TaskState) => (event:any) => {
        this.props.onActionPress(TaskActions.setState,{state})
    }
    onTaskClick = (event) => {
        const open = this.state.open
        if(open)
        {
            const canClose = this.canClose()
            if(canClose)
            {
                this.setState({open:!open})
            }
            else {
                this.setState({showConfirmCloseDialog:true})
            }
        }
        else {

            this.setState({open:!open})
        }
    }
    onConfirmClose = (confirmed:boolean) => {
        if(confirmed)
        {
            this.setState( (previousState, currentProps) => {
                return { showConfirmCloseDialog: false, open:false};
            })
        }
        else {
            this.setState( (previousState, currentProps) => {
                return { showConfirmCloseDialog: false};
            })
        }
    }
    renderConfirmCloseDialog = () => {
        const visible = this.state.showConfirmCloseDialog
        if(!visible)
            return null
        const title = translate("task.module.task.preventclose.title")
        const message = translate("task.module.task.preventclose.description")
        const okButtonTitle = translate("common.yes")
        return <ConfirmDialog visible={visible} title={title} message={message} didComplete={this.onConfirmClose} okButtonTitle={okButtonTitle}/>
    }
    stateStyle = (state:TaskState) => {
        const style:React.CSSProperties = {}
        const color = TaskState.colorForState(state)
        if(this.props.task.state == state)
            style.background = color
        else 
            style.color = color
        style.borderColor = color
        return style
    }
    onAddStatusActionPress = (action: StatusActions, extra?: Object, completion?: (success: boolean) => void) => {
        console.log("onAddStatusActionPress", action, extra)
        this.props.onActionPress(TaskActions.addStatus, extra)
    }
    onAddTimeActionPress = (action: StatusActions, extra?: any, completion?: (success: boolean) => void) => {
        const date = this.timepicker.current.getValue()
        const hours = date.get("hours")
        const minutes = date.get("minutes")
        const description = extra.message as string
        this.props.onActionPress(TaskActions.addTime, {date, hours, minutes, description})
    }
    canPostTime = () => {
        if(this.timepicker.current)
        {
            const time = this.timepicker.current.getValue()
            const hours = time.get("hours")
            const minutes = time.get("minutes")
            const timecomposerContent = this.timecomposer.current.getContent()
            return (hours > 0 || minutes > 0) && timecomposerContent.text.length > 0
        }
        return false
    }
    canClose = () => {

        const timecomposerContent = this.timecomposer.current.getContent()
        const statuscomposerContent = this.statuscomposer.current.getContent()
        const statusFileCount = this.statuscomposer.current.getFilesCount()
        return timecomposerContent.text.length == 0 && statuscomposerContent.text.length == 0 && statusFileCount == 0
    }
    onTimeChange = (time:moment.Moment) => {
        this.setState({time:time.clone()})
    }
    render()
    {
        const task = this.props.task
        const cn = classnames("task-content")
        const taskClass = classnames("task-list-item", {active:this.state.open})
        const taskPriorityClass = "task-priority"
        const states = TaskState.all
        const datetime = this.state.time
        const refresh = datetime.toString()
        const maxDay = moment().tz(timezone).startOf('day')
        return (<div className={taskClass}>
                    <div style={{background:TaskState.colorForState(task.state)}} className={cn} onClick={this.onTaskClick}>
                        <div className="title text-truncate">{task.title}</div>
                        {task.priority && <div className={taskPriorityClass} style={{background:TaskPriority.colorForPriority(task.priority)}}>{translate("task.priority." + task.priority)}</div>} 
                    </div>
                    <CollapseComponent visible={this.state.open}>
                        <div className="collapse-body p-2">
                            <FormGroup>
                                <Label>{translate("task.module.menu.addtime.title")}</Label>
                                <StatusComposerComponent 
                                    ref={this.timecomposer} 
                                    canUpload={false}
                                    canMention={false}
                                    canComment={true}
                                    canPost={this.canPostTime}
                                    onActionPress={this.onAddTimeActionPress}
                                    contextNaturalKey={ContextNaturalKey.TASK}
                                    contextObjectId={task.id}
                                    communityId={this.props.communityId}
                                    renderPlaceholder={false}
                                    showEmojiPicker={true}
                                    placeholder={translate("task.module.menu.addtime.placeholder")}
                                    taggableMembers={[]/* tagging not available*/}
                                    refresh={refresh}
                                >
                                    <div className="date-picker-container">
                                        <DateTimePicker 
                                            ref={this.timepicker} 
                                            onChange={this.onTimeChange} 
                                            value={datetime}
                                            max={maxDay}
                                        />
                                    </div>
                                </StatusComposerComponent>
                            </FormGroup>
                            <FormGroup>
                                <Label>{translate("task.module.menu.setstate.title")}</Label>
                                <ButtonGroup className="flex-wrap d-block">
                                    {states.map(s => <Button outline={true} size="xs" color="secondary" onClick={this.setTaskState(s)} key={s} active={this.stateActive(s)}>{translate("task.state." + s)}</Button>)}
                                </ButtonGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label>{translate("task.module.menu.addstatus.title")}</Label>
                                <StatusComposerComponent 
                                    ref={this.statuscomposer} 
                                    canUpload={true}
                                    canMention={true}
                                    canComment={true}
                                    onActionPress={this.onAddStatusActionPress}
                                    contextNaturalKey={ContextNaturalKey.TASK}
                                    contextObjectId={task.id}
                                    placeholder={translate("task.module.menu.addstatus.placeholder")}
                                    communityId={this.props.communityId}
                                    renderPlaceholder={false}
                                    taggableMembers={task.visibility}
                                />
                            </FormGroup>
                        </div>
                    </CollapseComponent>
                    {this.renderConfirmCloseDialog()}
                </div>)
    }
}
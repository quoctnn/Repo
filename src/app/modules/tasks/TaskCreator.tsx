import * as React from 'react';
import { ContextDataProps, withContextData } from '../../hoc/WithContextData';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import './TaskCreator.scss';
import { Button } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import { uniqueId, DateFormat } from '../../utilities/Utilities';
import { SelectInput } from '../../components/form/components/SelectInput';
import { TaskState, TaskPriority, RequestErrorData } from '../../types/intrasocial_types';
import { InputOption } from '../../components/form/components/RichRadioGroupInput';
import { TextInput } from '../../components/form/components/TextInput';
import { DateTimePicker } from '../../components/general/input/DateTimePicker';
import { TextAreaInput } from '../../components/form/components/TextAreaInput';
import { ApiClient } from '../../network/ApiClient';
import moment = require('moment');

type State = {
    creating: boolean
    errors: RequestErrorData[]
    clearForm: string
}

type OwnProps = {
    onCreate: () => void
}

type Props = OwnProps & RouteComponentProps<any> & ContextDataProps

class TaskCreator extends React.Component<Props, State> {
    taskFormRefs = {
        titleRef: React.createRef<TextInput>(),
        responsibleRef: React.createRef<SelectInput>(),
        assignedRef: React.createRef<SelectInput>(),
        stateRef: React.createRef<SelectInput>(),
        priorityRef: React.createRef<SelectInput>(),
        estHoursRef: React.createRef<TextInput>(),
        estMinutesRef: React.createRef<TextInput>(),
        dueDateRef: React.createRef<DateTimePicker>(),
        tagsRef: React.createRef<SelectInput>(),
        categoryRef: React.createRef<SelectInput>(),
        descriptionRef: React.createRef<TextAreaInput>()
    }
    constructor(props: Props) {
        super(props);
        this.state = {
            creating: false,
            errors: [],
            clearForm: null
        }
    }

    titleChanged = (id: string, value: string, isRequired: boolean) => {
        this.setState({ creating: !!value })
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.state.clearForm != null) this.setState({ clearForm: null })
    }

    clearForm = (e?: React.MouseEvent) => {
        this.setState({ creating: false, clearForm: uniqueId() })
    }

    uploadFile = (e: React.MouseEvent) => {

    }

    getErrors = (keys:string[]):{[key:string]:string} => {
        if(this.state.errors)
        {
            let errors:{[key:string]:string} = {}
            this.state.errors.forEach(fec =>
                {
                    const e = fec.getErrorMessagesForFields(keys)
                    if(e)
                    {
                        errors = Object.assign(errors, e)
                    }
                })
            return errors
        }
        return null
    }
    createTask = (e: React.MouseEvent) => {
        // Collect all the values to variables
        if (!this.props.contextData.project) return;
        const project = this.props.contextData.project.id
        const title = this.taskFormRefs.titleRef.current.getValue()
        const responsible = this.taskFormRefs.responsibleRef.current.getValue()
        const assigned_to = this.taskFormRefs.assignedRef.current.getValue() || []
        const state = this.taskFormRefs.stateRef.current.getValue() || TaskState.notStarted
        const priority = this.taskFormRefs.priorityRef.current.getValue()
        const estimated_hours = this.taskFormRefs.estHoursRef.current.getValue()
        const estimated_minutes = this.taskFormRefs.estMinutesRef.current.getValue()
        const due_date = this.taskFormRefs.dueDateRef.current.getValue() ? this.taskFormRefs.dueDateRef.current.getValue().format("YYYY-MM-DD") : null
        const tags = this.taskFormRefs.tagsRef.current.getValue() || []
        const category = this.taskFormRefs.categoryRef.current.getValue()
        const description = this.taskFormRefs.descriptionRef.current.getValue()
        ApiClient.createTask({ project, title, responsible, assigned_to, state, priority, estimated_hours, estimated_minutes, due_date, tags, category, description }, (data, status, error) => {
            if (error) {
                this.setState({errors: [error.data]})
                return
            }
            if (!error && data) {
                this.props.onCreate();
                this.clearForm();
            }
        });
    }

    render() {
        const states: InputOption[] = TaskState.all.map((state) => { return { label: translate("task.state." + state), value: state } })
        const priorities: InputOption[] = TaskPriority.all.map((priority) => { return { label: translate("task.priority." + priority), value: priority } });
        const tags: InputOption[] = this.props.contextData.project ? this.props.contextData.project.tags.map((tag) => { return { label: tag, value: tag } }) : []
        const categories: InputOption[] = this.props.contextData.project ? this.props.contextData.project.categories.map((category) => { return { label: category, value: category } }) : []
        return <div className="task-create-container">
            {this.state.clearForm == null &&
                <div className="task-title">
                    <TextInput
                        value={null}
                        id={"task-title"}
                        title={null}
                        ref={this.taskFormRefs.titleRef}
                        placeholder={translate("task.module.menu.title.placeholder")}
                        onValueChanged={this.titleChanged}
                    />
                </div>
            }
            {this.state.creating &&
                <div className="task-hidden-fields">
                    <SelectInput
                        options={[]}
                        errors={null}
                        ref={this.taskFormRefs.responsibleRef}
                        value={null}
                        title={translate("task.module.menu.responsible.title")}
                        id={"task-responsible"}
                        isRequired={false}
                    />
                    <SelectInput
                        options={[]}
                        errors={null}
                        ref={this.taskFormRefs.assignedRef}
                        value={null}
                        title={translate("task.module.menu.assigned_to.title")}
                        id={uniqueId()}
                        isRequired={false}
                    />
                    <div className="task-flex-fields">
                        <SelectInput
                            options={states}
                            errors={null}
                            ref={this.taskFormRefs.stateRef}
                            value={states[0].value}
                            title={translate("task.module.menu.state.title")}
                            id={uniqueId()}
                            isRequired={false}
                        />
                        <SelectInput
                            options={priorities}
                            errors={null}
                            ref={this.taskFormRefs.priorityRef}
                            value={null}
                            title={translate("task.module.menu.priority.title")}
                            id={uniqueId()}
                            isRequired={false}
                        />
                    </div>
                    <div className="task-flex-fields">
                        <TextInput
                            errors={null}
                            ref={this.taskFormRefs.estHoursRef}
                            value={null}
                            title={translate("task.module.menu.estimated-time.title")}
                            placeholder={translate("date.format.hours.long")}
                            id={uniqueId()}
                            isRequired={false}
                        />
                        <TextInput
                            errors={null}
                            ref={this.taskFormRefs.estMinutesRef}
                            value={null}
                            title={"-"}
                            placeholder={translate("date.format.minutes.long")}
                            id={uniqueId()}
                            isRequired={false}
                        />
                        <div className="spacer" />
                        <div className="form-group form-input d-block input-group">
                            <label className="col-form-label">{translate("task.due_date.title")}</label>
                            <DateTimePicker min={moment().startOf('day')} ref={this.taskFormRefs.dueDateRef} allowHoursPicker={false} format={DateFormat.day} />
                        </div>
                    </div>
                    <div className="task-flex-fields">
                        <SelectInput
                            options={tags}
                            errors={null}
                            ref={this.taskFormRefs.tagsRef}
                            value={null}
                            title={translate("task.tags")}
                            id={uniqueId()}
                            isRequired={false}
                        />
                        <SelectInput
                            options={categories}
                            errors={null}
                            ref={this.taskFormRefs.categoryRef}
                            value={null}
                            title={translate("task.category.title")}
                            id={uniqueId()}
                            isRequired={false}
                        />
                    </div>
                    {/* <div className="task-parent-task">task-parent</div> */}
                    <TextAreaInput
                        errors={null}
                        ref={this.taskFormRefs.descriptionRef}
                        value={null}
                        title={translate("common.description")}
                        id={uniqueId()}
                    />
                    <div className="button-container">
                        <Button disabled={true} className="btn btn-info task-file-upload" onClick={this.uploadFile}>{translate("task.create.upload.file")}</Button>
                        <div className="flex-grow-1" />
                        <Button className="btn btn-success task-create" onClick={this.createTask}>{translate("Save")}</Button>
                        <Button className="btn btn-danger task-cancel" onClick={this.clearForm}>{translate("Cancel")}</Button>
                    </div>
                    <div className="bottom-separator" />
                </div>
            }
        </div>
    }
}

export default withContextData(withRouter(TaskCreator))

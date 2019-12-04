import * as React from 'react';
import { ContextDataProps, withContextData } from '../../hoc/WithContextData';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import './TaskCreator.scss';
import { Button } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import { uniqueId, DateFormat } from '../../utilities/Utilities';
import { SelectInput } from '../../components/form/components/SelectInput';
import { TaskState, TaskPriority, RequestErrorData, RelationshipStatus } from '../../types/intrasocial_types';
import { InputOption } from '../../components/form/components/RichRadioGroupInput';
import { TextInput } from '../../components/form/components/TextInput';
import { DateTimePicker } from '../../components/general/input/DateTimePicker';
import { TextAreaInput } from '../../components/form/components/TextAreaInput';
import { ApiClient } from '../../network/ApiClient';
import moment = require('moment');
import { NumberInput } from '../../components/form/components/NumberInput';
import { SelectCreateInput } from '../../components/form/components/SelectCreateInput';
import { ProfileSelectInput } from '../../components/form/components/ProfileSelectorInput';
import { ProfileManager } from '../../managers/ProfileManager';
import ProfileEducationModule from '../profileModules/education/ProfileEducationModule';

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
        responsibleRef: React.createRef<ProfileSelectInput>(),
        assignedRef: React.createRef<ProfileSelectInput>(),
        stateRef: React.createRef<SelectInput>(),
        priorityRef: React.createRef<SelectInput>(),
        estHoursRef: React.createRef<NumberInput>(),
        estMinutesRef: React.createRef<NumberInput>(),
        dueDateRef: React.createRef<DateTimePicker>(),
        tagsRef: React.createRef<SelectCreateInput>(),
        categoryRef: React.createRef<SelectCreateInput>(),
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

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        return this.state.creating != nextState.creating ||
               this.state.clearForm != nextState.clearForm ||
               this.state.errors != nextState.errors
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
        const project = this.props.contextData.project
        const members = ProfileManager.getProfiles(project.members)
        const states: InputOption[] = TaskState.all.map((state) => { return { label: translate("task.state." + state), value: state } })
        const priorities: InputOption[] = TaskPriority.all.map((priority) => { return { label: translate("task.priority." + priority), value: priority } });
        const tags: InputOption[] = project ? project.tags.map((tag) => { return { label: tag, value: tag } }) : []
        const categories: InputOption[] = project ? project.categories.map((category) => { return { label: category, value: category } }) : []
        const responsible: InputOption[] = members ? members.map((profile) => {
            var option = {label: profile.first_name + " " + profile.last_name, value: profile.id.toString()};
            if (profile.relationship && profile.relationship.includes(RelationshipStatus.manager))
                option['description'] = translate("common.manager");
            return option
        }): []
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
                    <ProfileSelectInput
                        allowedProfiles={members}
                        selectedProfiles={[]}
                        autoFocus={false}
                        errors={null}
                        ref={this.taskFormRefs.responsibleRef}
                        title={translate("task.module.menu.responsible.title")}
                        id={uniqueId()}
                        isRequired={false}
                    />
                    <ProfileSelectInput
                        allowedProfiles={members}
                        multiSelect={true}
                        selectedProfiles={[]}
                        autoFocus={false}
                        errors={null}
                        ref={this.taskFormRefs.assignedRef}
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
                        <div className="form-group form-input d-block input-group">
                            <label className="col-form-label">{translate("task.module.menu.estimated-time.title")}</label>
                            <div className="task-flex-fields" style={{marginTop: "0"}}>
                                <NumberInput
                                    errors={null}
                                    ref={this.taskFormRefs.estHoursRef}
                                    value={null}
                                    title={null}
                                    placeholder={translate("date.format.hours.long")}
                                    id={uniqueId()}
                                    isRequired={false}
                                />
                                <NumberInput
                                    errors={null}
                                    ref={this.taskFormRefs.estMinutesRef}
                                    value={null}
                                    title={null}
                                    placeholder={translate("date.format.minutes.long")}
                                    id={uniqueId()}
                                    isRequired={false}
                                />
                            </div>
                        </div>
                        <div className="form-group form-input d-block input-group">
                            <label className="col-form-label">{translate("task.due_date.title")}</label>
                            <DateTimePicker min={moment().startOf('day')} ref={this.taskFormRefs.dueDateRef} allowHoursPicker={false} format={DateFormat.day} />
                        </div>
                    </div>
                    <div className="task-flex-fields">
                        <SelectCreateInput
                            canCreateValue={(value: string) => true}
                            multiSelect={true}
                            selectableValues={tags}
                            errors={null}
                            ref={this.taskFormRefs.tagsRef}
                            // value={null}
                            title={translate("task.tags")}
                            id={uniqueId()}
                            isRequired={false}
                        />
                        <SelectCreateInput
                            canCreateValue={(value: string) => true}
                            selectableValues={categories}
                            errors={null}
                            ref={this.taskFormRefs.categoryRef}
                            // value={null}
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

import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { RequestErrorData, Task, Project, TaskState, TaskPriority, RelationshipStatus } from '../../../types/intrasocial_types';
import FormController, { FormStatus } from '../../form/FormController';
import { ApiClient } from '../../../network/ApiClient';
import { uniqueId, removeEmptyEntriesFromObject, nullOrUndefined, nameofFactory, DateFormat } from '../../../utilities/Utilities';
import { TextInput } from '../../form/components/TextInput';
import { TextAreaInput } from '../../form/components/TextAreaInput';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormPage } from '../../form/FormPage';
import { FormMenuItem } from '../../form/FormMenuItem';
import { SelectInput } from '../../form/components/SelectInput';
import { InputOption } from '../../form/components/RichRadioGroupInput';
import { ProfileSelectInput } from '../../form/components/ProfileSelectorInput';
import { NumberInput } from '../../form/components/NumberInput';
import { DateTimePicker } from '../input/DateTimePicker';
import moment = require('moment');
import { SelectCreateInput } from '../../form/components/SelectCreateInput';
import { ProfileManager } from '../../../managers/ProfileManager';

type OwnProps = {
    task?: Task
    project?: Project
    visible?: boolean
    onComplete?: (task?: Task) => void
    onCancel?: () => void
}
type State = {
    formVisible: boolean
    formReloadKey?: string
    formStatus: FormStatus
    formErrors?: RequestErrorData[]
    formValues: Partial<Task>
}
type Props = OwnProps & RouteComponentProps<any>

const nameof = nameofFactory<Task>()
class TaskCreateComponent extends React.Component<Props, State> {
    formController: FormController = null
    constructor(props: Props) {
        super(props);
        this.state = {
            formVisible: true,
            formStatus: FormStatus.normal,
            formErrors: null,
            formReloadKey: uniqueId(),
            formValues: {
            }
        }
    }
    private hasOutsideVisibilityToggle = () => {
        return !nullOrUndefined(this.props.visible)
    }
    isVisible = () => {
        if (this.hasOutsideVisibilityToggle())
            return this.props.visible
        return this.state.formVisible
    }
    back = () => {
        const goBack = () => {
            setTimeout(this.props.history.goBack, 450)
        }
        this.setState(() => {
            return { formVisible: false }
        }, goBack)
    }
    handleUpdateTaskFormSubmit = () => {
        const task: Partial<Task> = this.props.task || {}
        const data = this.state.formValues
        const create = !this.props.task
        if (create)
            data.project = this.props.project.id
        //const hasDataToSave = Object.keys(communityData).length > 0
        this.setFormStatus(FormStatus.submitting)
        const { title, state, priority, description, project, responsible, assigned_to, due_date, ...rest } = data
        const updateData = removeEmptyEntriesFromObject({ title, state, priority, description, project, responsible, assigned_to, due_date })

        let createdTask: Task = null
        const completed = () => {
            if (errors.length > 0) {
                this.setState(() => {
                    return { formErrors: errors }
                })
                this.setFormStatus(FormStatus.normal)
            }
            else {
                const updatedTask = { ...(createdTask || task) } as Task
                this.setFormStatus(FormStatus.normal)
                if (this.props.onComplete) {
                    this.props.onComplete(updatedTask)
                }
                else {
                    const shouldRedirect = updatedTask && updatedTask.uri
                    if (shouldRedirect) {
                        this.setState(() => {
                            return { formVisible: false }
                        }, () => {
                            window.app.navigateToRoute(updatedTask.uri)
                        })
                    }
                    else
                        this.didCancel()
                }
            }
        }
        const errors: RequestErrorData[] = []
        const pushError = (error?: RequestErrorData) => {
            if (!!error) {
                errors.push(error)
            }
        }
        const requests: (() => void)[] = []
        let requestsCompleted = 0
        const requestCompleter = (data, status, errorData) => {
            requestsCompleted += 1
            pushError(errorData)
            if (requestsCompleted == requests.length) {
                completed()
            }
            else {
                const request = requests[requestsCompleted]
                request && request()
            }
        }
        if (create) {
            ApiClient.createTask(updateData, (data, status, errorData) => {
                if (!errorData && data && data.id) {
                    createdTask = data
                    if (requests.length > 0)
                        requests[0]() // start
                    else {
                        completed()
                    }
                }
                else {
                    pushError(errorData)
                    completed()
                }
            })
        }
        else {

            if (Object.keys(updateData).length > 0)
                requests.push(() => ApiClient.updateTask(this.props.task.id, updateData, (data, status, error) => {
                    createdTask = data
                    requestCompleter(data, status, error)
                }))
            if (requests.length > 0)
                requests[0]() // start
            else {
                completed()
            }
        }
    }
    setFormStatus = (status: FormStatus, resetError?: boolean) => {
        this.setState((prevState: State) => {
            if (prevState.formStatus != status) {
                if (resetError)
                    return { formStatus: status, formErrors: null }
                return { formStatus: status }
            }
        })
    }
    handleValueChanged = (id: string, value: any) => {
        this.setState((prevState: State) => {
            return { formValues: { ...prevState.formValues, [id]: value } }
        }, () => { })
    }
    didCancel = () => {
        if (this.props.onCancel)
            this.props.onCancel()
        else
            this.back()
    }
    render = () => {
        const visible = this.isVisible()
        const task: Partial<Task> = this.props.task || {}
        const project = this.props.project
        if (!project) {
            return null
        }
        const members = ProfileManager.getProfiles(project.members)
        const states: InputOption[] = TaskState.all.map((state) => { return { label: translate("task.state." + state), value: state } })
        const priorities: InputOption[] = TaskPriority.all.map((priority) => { return { label: translate("task.priority." + priority), value: priority } });
        const tags: InputOption[] = project ? project.tags.map((tag) => { return { label: tag, value: tag } }) : []
        const categories: InputOption[] = project ? project.categories.map((category) => { return { label: category, value: category } }) : []
        const responsible: InputOption[] = members ? members.map((profile) => {
            var option = { label: profile.first_name + " " + profile.last_name, value: profile.id.toString() };
            if (profile.relationship && profile.relationship.includes(RelationshipStatus.manager))
                option['description'] = translate("common.manager");
            return option
        }) : []
        const create = !this.props.task
        return <FormController
            ref={(controller) => this.formController = controller}
            key={this.state.formReloadKey}
            visible={visible}
            formErrors={this.state.formErrors}
            didCancel={this.didCancel}
            status={this.state.formStatus}
            onFormSubmit={this.handleUpdateTaskFormSubmit}
            title={translate(create ? "task.create" : "task.update")}
            onValueChanged={this.handleValueChanged}
            render={(form) => {
                return {
                    menuItems: [
                        <FormMenuItem key="1"
                            form={form}
                            pageId="1"
                            title={translate("task.settings.page.title.primary")}
                            description={translate("task.settings.page.description.primary")}
                        />,
                        <FormMenuItem key="2"
                            form={form}
                            pageId="2"
                            title={translate("task.settings.page.title.appearance")}
                            description={translate("task.settings.page.description.appearance")}
                        />
                    ],
                    pages: [<FormPage key="page1" form={this.formController} pageId="1" render={(pageId, form) => {
                        return <>
                            <TextInput
                                errors={form.getErrors}
                                isRequired={true}
                                hasSubmitted={form.hasSubmitted()}
                                ref={form.setFormRef(pageId)}
                                onValueChanged={form.handleValueChanged(pageId)}
                                value={task.title}
                                title={translate("common.title")}
                                id={nameof("title")}
                            />
                            <TextAreaInput
                                errors={form.getErrors}
                                hasSubmitted={form.hasSubmitted()}
                                ref={form.setFormRef(pageId)}
                                onValueChanged={form.handleValueChanged(pageId)}
                                value={task.description}
                                title={translate("common.description")}
                                id={nameof("description")}
                            />
                            <SelectInput
                                options={responsible}
                                errors={form.getErrors}
                                value={task.responsible && task.responsible.toString()}
                                title={translate("task.module.menu.responsible.title")}
                                id={"task-responsible"}
                                isRequired={false}
                            />
                            <ProfileSelectInput
                                allowedProfiles={members}
                                selectedProfiles={[]}
                                autoFocus={false}
                                errors={form.getErrors}
                                title={translate("task.module.menu.assigned_to.title")}
                                id={uniqueId()}
                                isRequired={false}
                            />
                            <SelectInput
                                options={states}
                                errors={form.getErrors}
                                value={task.state || states[0].value}
                                title={translate("task.module.menu.state.title")}
                                id={uniqueId()}
                                isRequired={false}
                            />
                            <SelectInput
                                options={priorities}
                                errors={form.getErrors}
                                value={task.priority}
                                title={translate("task.module.menu.priority.title")}
                                id={uniqueId()}
                                isRequired={false}
                            />
                            <NumberInput
                                errors={form.getErrors}
                                value={task.estimated_hours && task.estimated_hours.toString()}
                                title={translate("task.module.menu.estimated-time.title")}
                                placeholder={translate("date.format.hours.long")}
                                id={uniqueId()}
                                isRequired={false}
                            />
                            <NumberInput
                                errors={form.getErrors}
                                value={task.estimated_minutes && task.estimated_minutes.toString()}
                                title={"-"}
                                placeholder={translate("date.format.minutes.long")}
                                id={uniqueId()}
                                isRequired={false}
                            />
                            <DateTimePicker
                                min={moment().startOf('day')}
                                allowHoursPicker={false}
                                format={DateFormat.day}
                                value={moment(task.due_date)}
                            />

                            <SelectCreateInput
                                canCreateValue={(value: string) => true}
                                errors={form.getErrors}
                                // value={task.tags}
                                title={translate("task.tags")}
                                id={uniqueId()}
                                isRequired={false}
                            />
                            <SelectInput
                                options={[]}
                                errors={form.getErrors}
                                value={task.category}
                                title={translate("task.category.title")}
                                id={uniqueId()}
                                isRequired={false}
                            />
                        </>
                    }} />]
                }
            }}
        >
        </FormController>
    }
}

export default withRouter(TaskCreateComponent)
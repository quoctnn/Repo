import * as React from 'react';
import { translate, lazyTranslate } from '../../../localization/AutoIntlProvider';
import { RequestErrorData, Task, Project, TaskState, TaskPriority, RelationshipStatus, UploadedFile } from '../../../types/intrasocial_types';
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
import moment = require('moment');
import { SelectCreateInput } from '../../form/components/SelectCreateInput';
import { ProfileManager } from '../../../managers/ProfileManager';
import { DateInput } from '../../form/components/DateInput';
import { InputGroup } from 'reactstrap';
import "./TaskCreateComponent.scss";
import FilesUpload from '../../status/FilesUpload';
import { ToastManager } from '../../../managers/ToastManager';

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
    files: UploadedFile[]
    uploading: boolean
}
type Props = OwnProps & RouteComponentProps<any>

const nameof = nameofFactory<Task>()
class TaskCreateComponent extends React.Component<Props, State> {
    formController: FormController = null
    constructor(props: Props) {
        super(props);
        const files = this.props.task.files.map(f => f) || []
        this.state = {
            files: files,
            uploading: false,
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
        const files_ids = this.state.files.map((file) => {return file.id})
        const create = !this.props.task
        if (create)
            data.project = this.props.project.id
        //const hasDataToSave = Object.keys(communityData).length > 0
        this.setFormStatus(FormStatus.submitting)
        const { title, state, priority, description, project,
            responsible, assigned_to,
            due_date, estimated_hours, estimated_minutes,
            category, tags, ...rest } = data
        const updateData = removeEmptyEntriesFromObject(
            {
                title, state, priority, description, project,
                responsible, assigned_to,
                due_date, estimated_hours, estimated_minutes,
                category, tags, files_ids
            })

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
    handleFileUploaded = (file:UploadedFile) => {
        let files = this.state.files.map(f => f)
        files.push(file)
        this.setState({files: files})
    }
    handleFileQueueComplete = () => {
        this.setState({uploading: false});
    }
    handleFileAdded = () => {
        this.setState({uploading: true});
    }
    handleFileError = () => {
        // TODO: ¿Should we display an error message (multi-lang) to the user?
        this.setState({uploading: true});
    }
    handleFileRemoved = (file:UploadedFile) => {
        if (typeof file !== 'undefined' && file != null) {
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files});
        }
    }
    removeFileFromList = (file:UploadedFile, fileList:UploadedFile[]) => {
        let list = fileList.map(f => f)
        let index = list.findIndex((item) => {
            return item.id == file.id;
        });
        if(index >= 0)
        {
            list.splice(index, 1)
        }
        return list
    }
    handleRename = (file: UploadedFile, name: string) => {
        if(!name || name.length == 0)
            return
        ApiClient.updateFilename(file.id, name, (data, status, error) => {
            if(!!data && !error)
            {
                this.setState((prevState:State) => {
                    const files = prevState.files.map(f => f)
                    const index = files.findIndex(f => f.id == data.id)
                    if(index > -1)
                    {
                        files[index] = data
                        return {files}
                    }
                    return
                })
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("Could not update filename"))
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
        var selectedAvailable = task.assigned_to && task.assigned_to.map(id => members.find(m => m.id == id)).filter(p => !!p)
        if (this.state.formValues.assigned_to) {
            selectedAvailable = this.state.formValues.assigned_to.map(id => members.find(m => m.id == id)).filter(p => !!p)
        }
        const selectedResponsible = task.responsible ? [ProfileManager.getProfileById(task.responsible)] : []
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
                            title={translate("task.settings.page.title.additional")}
                            description={translate("task.settings.page.description.additional")}
                        />,
                        <FormMenuItem key="3"
                            form={form}
                            pageId="3"
                            title={translate("task.settings.page.title.files")}
                            description={translate("task.settings.page.description.files")}
                        />
                    ],
                    pages: [
                        <FormPage key="page1" form={this.formController} pageId="1" render={(pageId, form) => {
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
                                <ProfileSelectInput
                                    allowedProfiles={members}
                                    selectedProfiles={selectedResponsible}
                                    ref={form.setFormRef(pageId)}
                                    hasSubmitted={form.hasSubmitted()}
                                    onValueChanged={form.handleValueChanged(pageId)}
                                    errors={form.getErrors}
                                    title={translate("task.module.menu.responsible.title")}
                                    id={nameof("responsible")}
                                    isRequired={false}
                                />
                                <ProfileSelectInput
                                    allowedProfiles={members}
                                    selectedProfiles={selectedAvailable}
                                    ref={form.setFormRef(pageId)}
                                    hasSubmitted={form.hasSubmitted()}
                                    onValueChanged={form.handleValueChanged(pageId)}
                                    multiSelect={true}
                                    autoFocus={false}
                                    errors={form.getErrors}
                                    title={translate("task.module.menu.assigned_to.title")}
                                    id={nameof("assigned_to")}
                                    isRequired={false}
                                />
                            </>
                        }} />,
                            <FormPage key="page2" form={this.formController} pageId="2" render={(pageId, form) => {
                                return <>
                                    <SelectInput
                                        options={states}
                                        errors={form.getErrors}
                                        value={task.state || states[0].value}
                                        title={translate("task.module.menu.state.title")}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        ref={form.setFormRef(pageId)}
                                        id={nameof("state")}
                                        isRequired={false}
                                    />
                                    <SelectInput
                                        options={priorities}
                                        errors={form.getErrors}
                                        value={task.priority}
                                        title={translate("task.module.menu.priority.title")}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        ref={form.setFormRef(pageId)}
                                        id={nameof("priority")}
                                        isRequired={false}
                                    />
                                    <InputGroup className="form-group form-input d-block">
                                        <label className="col-form-label">{translate("task.module.menu.estimated-time.title")}</label>
                                        <div className="hours-minutes-group">
                                            <NumberInput
                                                errors={form.getErrors}
                                                value={task.estimated_hours && task.estimated_hours.toString()}
                                                title={translate("date.format.hours.long")}
                                                ref={form.setFormRef(pageId)}
                                                placeholder={translate("date.format.hours.long")}
                                                onValueChanged={form.handleValueChanged(pageId)}
                                                id={nameof("estimated_hours")}
                                                isRequired={false}
                                            />
                                            <NumberInput
                                                errors={form.getErrors}
                                                value={task.estimated_minutes && task.estimated_minutes.toString()}
                                                title={translate("date.format.minutes.long")}
                                                ref={form.setFormRef(pageId)}
                                                placeholder={translate("date.format.minutes.long")}
                                                onValueChanged={form.handleValueChanged(pageId)}
                                                id={nameof("estimated_minutes")}
                                                isRequired={false}
                                            />
                                        </div>
                                    </InputGroup>
                                    <DateInput
                                        title={translate("task.due_date.title")}
                                        min={moment().startOf('day')}
                                        allowHoursPicker={false}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        ref={form.setFormRef(pageId)}
                                        id={nameof("due_date")}
                                        value={task.due_date}
                                    />
                                    <SelectCreateInput
                                        canCreateValue={(value: string) => true}
                                        errors={form.getErrors}
                                        selectableValues={tags}
                                        title={translate("task.tags")}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        ref={form.setFormRef(pageId)}
                                        id={nameof("tags")}
                                        isRequired={false}
                                    />
                                    <SelectInput
                                        options={[]}
                                        errors={form.getErrors}
                                        value={task.category}
                                        title={translate("task.category.title")}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        ref={form.setFormRef(pageId)}
                                        id={nameof("category")}
                                        isRequired={false}
                                    />
                                </>
                        }} />,
                            <FormPage key="page3" form={this.formController} pageId="3" render={(pageId, form) => {
                                return <>
                                    <InputGroup className="form-group form-input d-block">
                                        <label className="col-form-label">{translate("task.module.menu.file-upload.title")}</label>
                                        <FilesUpload
                                            files={this.state.files}
                                            onFileAdded={this.handleFileAdded}
                                            onFileRename={this.handleRename}
                                            onFileQueueComplete={this.handleFileQueueComplete}
                                            onFileError={this.handleFileError}
                                            onFileRemoved={this.handleFileRemoved}
                                            onFileUploaded={this.handleFileUploaded}
                                            communityId={project.community}/>
                                    </InputGroup>
                                </>
                    }} />]
                }
            }}
        >
        </FormController>
    }
}

export default withRouter(TaskCreateComponent)
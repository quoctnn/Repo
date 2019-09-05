import { FileUploader } from '../../network/ApiClient';
import { UploadedFile, UploadedFileType, UploadedFileResponse } from '../../types/intrasocial_types';
export enum FileQueueStatus {
    Pending,
    Success,
    Error,
    Progress
}
export interface ExtendedFile extends File {
    id:number
    tempId?:string
    preview?:string
    extension?:string
    fileType?:UploadedFileType
}
export class FileQueueObject {
    public file: ExtendedFile;
    public status: FileQueueStatus = FileQueueStatus.Pending;
    public progress: number = 0;
    public request: FileUploader<UploadedFileResponse>;
    public response: UploadedFile;
    public error: any;

    constructor(file: any) {
        this.file = file;
    }

    // actions
    public upload = () => { /* set in service */ };
    public cancel = () => { /* set in service */ };
    public remove = () => { /* set in service */ };

    // statuses
    public isPending = () => this.status === FileQueueStatus.Pending;
    public isSuccess = () => this.status === FileQueueStatus.Success;
    public isError = () => this.status === FileQueueStatus.Error;
    public inProgress = () => this.status === FileQueueStatus.Progress;
    public isUploadable = () => this.status === FileQueueStatus.Pending || this.status === FileQueueStatus.Error;
}

export class FileUploaderService {

    private _files: FileQueueObject[] = [];

    constructor() 
    {
    }
    // public events

    public onFailedItem = (queueObj: FileQueueObject) => {
    }
    public onCompleteItem = (queueObj: FileQueueObject) => {
    }
    public onAddedItem = (queueObj: FileQueueObject) => {
    }
    public onQueueUpdated = (queue:FileQueueObject[]) => {
    }
    public queue = () => {
        return this._files
    }

    // public functions
    public addToQueue = (data: ExtendedFile[]) => {
        // add file to the queue
        data.forEach(file => this._addToQueue(file))
    }

    public clearQueue = () => {
        // clear the queue
        this._files = [];
        this.onQueueUpdated(this._files);
    }

    public uploadAll = () => {
        // upload all except already successfull or in progress
        this._files.forEach((queueObj) => {
            if (queueObj.isUploadable()) {
                this._upload(queueObj);
            }
        });
    }

    // private functions
    private _addToQueue = (file: any) => {
        const queueObj = new FileQueueObject(file);

        // set the individual object events
        queueObj.upload = () => this._upload(queueObj);
        queueObj.remove = () => this._removeFromQueue(queueObj);
        queueObj.cancel = () => this._cancel(queueObj);

        // push to the queue
        this._files.push(queueObj);
        this.onAddedItem(queueObj)
        this.onQueueUpdated(this._files);
    }

    private _removeFromQueue = (queueObj: FileQueueObject) => {
        const index = this._files.indexOf(queueObj)
        if(index > -1)
        {
            this._files.splice(index, 1)
            this.onQueueUpdated(this._files);
        }
    }

    private _upload = (queueObj: FileQueueObject) => {

        queueObj.request = FileUploader.fromUploadedFile(queueObj.file, (progress) => {
            this._uploadProgress(queueObj, progress)
        })
        queueObj.request.doUpload((file, error) => {
            if(error || !file || !file.files[0])
                this._uploadFailed(queueObj, error);
            else 
                this._uploadComplete(queueObj, file.files[0])
        })
        return queueObj;
    }

    private _cancel = (queueObj: FileQueueObject) => {
        // update the FileQueueObject as cancelled
        queueObj.request.abort()
        queueObj.progress = 0;
        queueObj.status = FileQueueStatus.Pending;
        this.onQueueUpdated(this._files);
    }

    private _uploadProgress = (queueObj: FileQueueObject, progress: number) => {
        // update the FileQueueObject with the current progress
        queueObj.progress = progress;
        queueObj.status = FileQueueStatus.Progress;
        this.onQueueUpdated(this._files);
    }

    private _uploadComplete = (queueObj: FileQueueObject, file: UploadedFile) => {
        // update the FileQueueObject as completed
        queueObj.progress = 100;
        queueObj.status = FileQueueStatus.Success;
        queueObj.response = file;
        this.onCompleteItem(queueObj);
        this.onQueueUpdated(this._files);
    }

    private _uploadFailed = (queueObj: FileQueueObject, error: any) => {
        // update the FileQueueObject as errored
        queueObj.progress = 0;
        queueObj.status = FileQueueStatus.Error;
        queueObj.error = error;
        this.onFailedItem(queueObj);
        this.onQueueUpdated(this._files);
    }

}
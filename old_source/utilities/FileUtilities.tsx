import VideoPlayer from '../components/general/video/VideoPlayer';
import React = require('react');
import { IntraSocialUtilities } from './IntraSocialUtilities';
import { UploadedFile } from '../types/intrasocial_types2';
export class FileUtilities {
    static renderDocument(file:UploadedFile)
    {
        let iconClass = "document " + file.extension
        let url = IntraSocialUtilities.appendAuthorizationTokenToUrl( file.file )
        return (
            <div className={iconClass} key={file.id}>
                <a href={url} target="_blank">
                    <i className="fa file-icon"></i>
                    {file.filename}
                </a>
            </div>
        )
    }
    static renderImage(file:UploadedFile) {
        let i = IntraSocialUtilities.appendAuthorizationTokenToUrl( file.image )
        return <img src={i} className="img-responsive" key={i}/>;
    }
    static renderVideo(file:UploadedFile)
    {
        if(VideoPlayer.canPlay(file.file))
        {
            return (<VideoPlayer link={file.file} key={file.id}/>)
        }
        return null
    }
    static getFileRepresentation(file:UploadedFile)
    {
        var data:JSX.Element = null
        switch(file.type)
        {
            case "document": data = this.renderDocument(file);break;
            case "audio":
            case "video": data = this.renderVideo(file);break;
            case "image": data = this.renderImage(file);break;
            default: break;
        }
        if(!data)
        {
            data = <>{file.file}</>
        }
        return data
    }
    static blobToDataURL = (blob:Blob, callback:(result:string) => void) => {
        var reader = new FileReader();
        reader.onload = (e) => 
        {
            callback(reader.result as string)
        }
        reader.readAsDataURL(blob);
    }
    static dataUrlToBlob = (dataurl:string) => 
    {
        let arr = dataurl.split(',')
        let mime = arr[0].match(/:(.*?);/)[1]
        let bstr = atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while(n--){
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], {type:mime})
    }
    static humanFileSize = (size) => {
        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return parseFloat((size / Math.pow(1024, i) ).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
}

  
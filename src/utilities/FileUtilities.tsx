import { UploadedFile } from '../reducers/conversations';
import { appendTokenToUrl } from './Utilities';
import VideoPlayer from '../components/general/video/VideoPlayer';
import { ImageGallery, GalleryImage, GalleryItemType } from '../components/general/gallery/ImageGallery';
import React = require('react');
export class FileUtilities {
    static getThumbnailContent(item:GalleryImage) {
        return <img src={item.src} className="img-responsive"/>;
    }
    static renderDocument(file:UploadedFile)
    {
        let iconClass = "document " + file.extension
        let url = appendTokenToUrl( file.file )
        return (
            <div className={iconClass} key={file.id}>
                <a href={url} target="_blank">
                    <i className="fa file-icon"></i>
                    {file.filename}
                </a>
            </div>
        )
    }
    static getImagesInPhotoswipeFormat(photos:UploadedFile[]):GalleryImage[] 
    {
        if (photos.length === 1) {
            // When showing just one image, show the full size:
            return [new GalleryImage(photos[0])];
        } else {
            return photos.map((item) => {
                return new GalleryImage(item);
            })
        }
    }
    static renderImages(files:UploadedFile[])
    {
        return <ImageGallery items={this.getImagesInPhotoswipeFormat(files)} thumbnailContent={this.getThumbnailContent}/>
    }
    static renderImage(file:UploadedFile) {
        let i = appendTokenToUrl( file.image )
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
}

  
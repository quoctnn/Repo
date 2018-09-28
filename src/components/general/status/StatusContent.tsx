import { ImageGallery, GalleryImage } from '../gallery/ImageGallery';
import Embedly from '../Embedly';
import * as React from 'react';
import classNames from "classnames";
import Constants from "../../../utilities/Constants";
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import { Status } from '../../../reducers/statuses';
import { appendTokenToUrl, getTextContent } from '../../../utilities/Utilities';
import VideoPlayer from '../video/VideoPlayer';
import GoogleDocEmbedCard from '../GoogleDocEmbedCard';
import { UploadedFile } from '../../../reducers/conversations';
import { ProfileManager } from '../../../main/managers/ProfileManager';
require("./StatusContent.scss");

export interface Props 
{
    status:Status
    embedLinks:boolean
}
interface State 
{
}
export default class StatusContent extends React.Component<Props, State> {     
    getThumbnailContent(item) {
        return <img src={item.thumbnail} className="img-responsive"/>;
    }

    getImagesInPhotoswipeFormat(photos:UploadedFile[]):GalleryImage[] 
    {
        if (photos.length === 1) {
            // When showing just one image, show the full size:
            let i = appendTokenToUrl( photos[0].image )
            return [{
                src: i, thumbnail: i,
                w: photos[0].image_width, h: photos[0].image_height,id: photos[0].id
            }];
        } else {
            return photos.map((item) => {
                let i = appendTokenToUrl( item.image )
                return {
                    src: i, thumbnail: i,
                    w: item.image_width, h: item.image_height, id: item.id
                };
            })
        }
    }
    getTextForField(field)
    {
        if (this.props.status.highlights) 
        {
            let v = this.props.status.highlights[field]
            if(v && v.length > 0)
            {
                return v[0]
            }
        }
        return this.props.status[field]
    }

    renderDescription() {
        let text = this.getTextForField("text")
        if (text) {
            return (
                <div className="col-12">
                    <p className="item-description">
                        <span className="text">
                        {getTextContent(text, ProfileManager.getProfiles(this.props.status.mentions) )}
                        </span>
                    </p>
                </div>
            )
        }
    }

    renderLink() {
        if (this.props.status.link) {
            if (VideoPlayer.canPlay(this.props.status.link)) {
                return (<VideoPlayer link={this.props.status.link}/>);
            } else if(this.props.status.link.startsWith("https://docs.google.com/")){
                return (<GoogleDocEmbedCard url={this.props.status.link}/>);
            }

            return (<Embedly url={this.props.status.link}/>);
        }
    }

    renderFilesVideoPlayer(type) {
        let mediaFiles = StatusUtilities.filterStatusFileType(this.props.status, type)

        if (mediaFiles.length == 0) return null;

        return (
            <div>
                {
                    mediaFiles.map(function (item) {
                        if (VideoPlayer.canPlay(item.file)) {
                            return (
                                <VideoPlayer link={item.file} key={item.id}/>)
                        }
                    })
                }
            </div>
        );
    }


    renderDocuments() {
        let documents = StatusUtilities.filterStatusFileType(this.props.status, "document")

        if (documents.length == 0) return null;

        return (
            <div className="status-documents">
                {
                    documents.map(function (item) {
                        let iconClass = classNames("col-6 col-sm-4 document", item.extension)
                        let url = Constants.urlsRoute.openUploadedFile(item.id)
                        return (
                            <div className={iconClass} key={item.id}>
                                <a href={url} target="_blank">
                                    <h4>
                                        <i className="fa fa-2x file-icon"></i>
                                        {item.filename}
                                    </h4>
                                </a>
                            </div>
                        )
                    })
                }
            </div>
        );
    }

    renderGallery() {
        let imageFiles = StatusUtilities.filterStatusFileType(this.props.status, "image")
        let images = this.getImagesInPhotoswipeFormat(imageFiles)

        if (images.length == 0) return null;

        return (
            <div className="row">
                <div className="col-md-12 photos">
                    <ImageGallery items={images}
                                   thumbnailContent={this.getThumbnailContent}/>
                    <div className="clearfix"></div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="panel-body">
                {this.renderDescription()}
                <div className="clearfix"></div>
                { this.props.embedLinks && this.renderLink()}
                {this.renderFilesVideoPlayer("video")}
                {this.renderGallery()}
                {this.renderFilesVideoPlayer("audio")}
                {this.renderDocuments()}
            </div>
        )
    }
}
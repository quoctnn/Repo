import * as React from "react";
import { ElasticResultFile, UploadedFileType, UploadedFile, ElasticSearchType } from '../../types/intrasocial_types';
import { IntraSocialUtilities } from "../../utilities/IntraSocialUtilities";
import PhotoSwipeComponent from '../general/gallery/PhotoSwipeComponent';
import { SearchResultItem, getTextForField, breadcrumbs, getBreadcrumbDataFromContext } from './SearchComponent';
import classnames = require("classnames");
import { translate } from "../../localization/AutoIntlProvider";
import { TimeComponent } from "../general/TimeComponent";
import { SecureImage } from "../general/SecureImage";

type FileResultItemProps = {
    file:ElasticResultFile
    onNavigate:(uri:string) => (event:React.SyntheticEvent) => void
}
type FileResultItemState = {
    visible:boolean
}
export default class FileResultItem extends React.Component<FileResultItemProps, FileResultItemState> {
    imagaRef = React.createRef<HTMLDivElement>()
    constructor(props:FileResultItemProps) {
        super(props);
        this.state = {
            visible:false
        }
    }
    componentWillUnmount = () => {
        this.imagaRef = null
    }
    shouldComponentUpdate = (nextProps:FileResultItemProps, nextState:FileResultItemState) => {
        const ret =  nextProps.file != this.props.file ||
                    nextState.visible != this.state.visible
        return ret
    }
    handleFileClick = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        //event.stopPropagation()
        const file = this.props.file
        if(file.type != UploadedFileType.IMAGE && file.type != UploadedFileType.IMAGE360)
        {
            this.downloadCurrent()
        }
        else {
            this.setState({visible:true})
        }
    }
    downloadCurrent = () => {
        const file = this.props.file
        if(file.file && file.filename){
            const url = IntraSocialUtilities.appendAuthorizationTokenToUrl(file.file)
            var element = document.createElement("a")
            element.setAttribute("href", url)
            element.setAttribute("download", file.filename)
            element.setAttribute("target", "_blank")
            element.setAttribute("crossOrigin", "anonymous")
            element.style.display = "none"
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
        }
    }
    onModalClose = () =>
    {
        this.setState({visible:false})
    }
    renderModal = () =>
    {
        if(!this.state.visible)
            return null
        const options:PhotoSwipe.Options = {index:0, getThumbBoundsFn:(index) => {
            const child = this.imagaRef && this.imagaRef.current
            if(child)
            {
                const rect = child.getBoundingClientRect()
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width}
            }
            return null
        }}
        return <PhotoSwipeComponent items={[this.props.file as any as UploadedFile]} options={options} visible={this.state.visible} onClose={this.onModalClose}/>
    }
    renderName = () => {
        return <div className="text-truncate">{this.props.file.filename}</div>
    }
    preventDefault = (e:React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
    }
    renderContent = () => {

        const item = this.props.file
        const hasThumbnail = !!item.thumbnail
        const cn = classnames("img-container", item.type, item.extension)
        const left = <div ref={this.imagaRef} className={cn}>
                        {hasThumbnail && <SecureImage className="img-responsive sec-img" setBearer={true} setAsBackground={true} url={item.thumbnail}  />
                        ||
                        <i className="fa file-icon"></i>
                        }
                    </div>
        const creatorLink = breadcrumbs({profile:item.user_id}, this.props.onNavigate)
        const bcContext = getBreadcrumbDataFromContext(item.context_natural_key, item.context_object_id, this.props.onNavigate)
        bcContext.community = item.community
        bcContext.status = item.status_id
        const bc = breadcrumbs(bcContext, this.props.onNavigate)
        const hasBreadcrumbs = bc.length > 0
        const footer = <div className="text-bolder">
                            {creatorLink}{hasBreadcrumbs ? " " + translate("in_context") + " ": ""}{bc}{" "}<TimeComponent date={item.created_at} />
                            </div>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const fn = getTextForField(item, "filename", 150)
        const filename = <span dangerouslySetInnerHTML={{__html: fn}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={filename} footer={footer} left={left} right={right} />
    }
    render()
    {
        const {file} = this.props
        const cl = classnames("", file.type, file.extension)
        return (<div onClick={this.handleFileClick} className={cl}>
                    {this.renderContent()}
                    {this.renderModal()}
                </div>)
    }
}
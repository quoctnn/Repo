import * as React from 'react'
import classnames from "classnames"
import "./FileListItem.scss"
import { UploadedFile, UploadedFileType } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import { FileUtilities } from '../../utilities/FileUtilities';
import { SecureImage } from '../../components/general/SecureImage';
import PhotoSwipeComponent from '../../components/general/gallery/PhotoSwipeComponent';

type OwnProps = {
    file:UploadedFile
}
type State = {
    visible:boolean
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class FileListItem extends React.Component<Props, State> {
    imagaRef = React.createRef<HTMLDivElement>()
    constructor(props:Props) {
        super(props);
        this.state = {
            visible:false
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.file != this.props.file ||
                    nextState.visible != this.state.visible
        return ret
    }
    handleFileClick = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        const file = this.props.file
        if(file.type != UploadedFileType.IMAGE)
        {
            this.downloadCurrent()
        }
        else {
            this.setState({visible:true})
        }
    }
    downloadCurrent = () => {

        const file = this.props.file
        var element = document.createElement("a")
        element.setAttribute("href", file.file)
        element.setAttribute("download", file.filename)
        element.setAttribute("target", "_blank")
        element.setAttribute("crossOrigin", "anonymous")
        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
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
        return <PhotoSwipeComponent items={[this.props.file]} options={options} visible={this.state.visible} onClose={this.onModalClose}/>
    }
    render()
    {
        const {file, className, children, ...rest} = this.props
        const cl = classnames("file-list-item file-item", className, file.type, file.extension)
        const name = file.filename
        const fileSize = FileUtilities.humanFileSize(file.size || 0)
        const hasThumbnail = !!file.thumbnail
        return (<Link onClick={this.handleFileClick} to={"#"} {...rest} className={cl}>
                    <div className="d-flex file-content drop-shadow hover-card">
                        <div ref={this.imagaRef}  className="img-container">
                            {hasThumbnail && <SecureImage className="sec-img" setBearer={true} setAsBackground={true} url={file.thumbnail}  /> 
                            ||
                            <i className="fa file-icon"></i>
                            }
                        </div>
                        <div className="d-flex flex-grow-1 flex-column content-container">
                            <div className="text-truncate">{name}</div>
                            <div className="d-flex text-muted text-truncate">
                                <div className="text-truncate">{fileSize}</div>
                                <div className="flex-grow-1"></div>
                                <div className="theme-box theme-bg-gradient flex-shrink-0">
                                    {file.extension}
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderModal()}
                </Link>)
    }
}
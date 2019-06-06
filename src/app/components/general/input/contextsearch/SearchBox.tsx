
import * as React from 'react';
import {Editor, EditorState, ContentState, convertToRaw, CompositeDecorator, Modifier, SelectionState, DraftHandleValue} from 'draft-js'
import { SearcQueryManager, searchDecorators, searchEntities, SearchEntityType, SearchOption, InsertEntity, ContextSearchData } from "./extensions";
import classnames from "classnames";
import "./SearchBox.scss"

type Props = {
    onChange:(es:EditorState) => void
    placeholder?:string
    data:ContextSearchData
    onBlur?:(event:React.SyntheticEvent<any>) => void
    onFocus?:(event:React.SyntheticEvent<any>) => void
    onEnter?:(event:React.SyntheticEvent<any>) => void
    onKeyDown?:(event:React.SyntheticEvent<any>) => void
    className?:string
    id?:string
    onClick?:(event:React.SyntheticEvent<any>) => void
    allowedSearchOptions:SearchOption[]
    multiline:boolean
}
type State = {
    editorState:EditorState
    text:string
}
export class SearchBox extends React.Component<Props, State>{
    search = React.createRef<Editor>();
    constructor(props:Props)
    {
        super(props)

        const decorator = new CompositeDecorator(searchDecorators);
        const contentState = SearcQueryManager.convertToContentState(props.data, this.props.allowedSearchOptions)
        this.state = {
            editorState: EditorState.createWithContent(contentState, decorator),
            text:""
        }
    }
    componentDidMount = () => {

        const editorState = EditorState.moveSelectionToEnd(this.state.editorState)
        this.setState({editorState})
    }
    componentWillUnmount() {
        this.search = null;
    }
    editorState = () => {
        return this.state.editorState
    }
    applyState = (editorState:EditorState, forceOnChange = false) => {
        this.setState({ editorState: editorState } ,() => {this.onChange(editorState, forceOnChange)})
    }
    getFocusOffset = () => {
        return this.state.editorState.getSelection().getFocusOffset()
    }
    focus = () => {
        this.search.current.focus()
    }
    blur = () => {
        this.search.current.blur()
    }
    onTouchDown = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        event.stopPropagation()
    }
    handleReturn = (event:React.SyntheticEvent<any>, editorState:EditorState):DraftHandleValue => {
        if(this.props.onKeyDown)
            this.props.onKeyDown(event)

        if(this.props.onEnter)
            this.props.onEnter(event)
        return 'handled'
    }
    clearTerm = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        event.stopPropagation()
        this.props.onClick && this.props.onClick(event)
        let editorState = SearcQueryManager.clearState(this.state.editorState)
        this.applyState(editorState, true)
    }
    logState(editorState:EditorState){
        const content = editorState.getCurrentContent()
        console.log("state", convertToRaw(content))
    }
    onChange = (es:EditorState, forceOnChange = false) => {
        const selection = es.getSelection()
        let editorState = SearcQueryManager.getStateWithEntities(es, this.props.allowedSearchOptions)
        editorState = EditorState.acceptSelection(editorState, selection)
        this.logState(editorState)
        const newText = es.getCurrentContent().getPlainText()
        const sendOnChange = forceOnChange || newText != this.state.text
        this.setState({editorState:editorState, text:newText}, () => {
            if(sendOnChange)
            {
                this.props.onChange(this.state.editorState)
            }
        })
    }
    onFocus = (event: React.SyntheticEvent<any>) => {
        this.props.onFocus && this.props.onFocus(event)
        this.props.onChange(this.state.editorState)
    }
    onBlur = (event: React.SyntheticEvent<any>) => {
        this.props.onBlur && this.props.onBlur(event)
    }
    render() {
        let clearVisible = this.state.editorState.getCurrentContent().getPlainText().length > 0
        let cl = clearVisible ? "fa fa-times-circle searchclear" : "hidden searchclear"
        const cn = classnames("search-box anim-transition", this.props.className)
        const editorClass = classnames("editor form-control", {"multiline": this.props.multiline})
        return (
          <div onClick={this.props.onClick} id={this.props.id} className={cn}>
            <div className={editorClass} onClick={this.focus}>
                <span className="icon"><i className="fa fa-search fa-lg"></i></span>
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    handleReturn={this.handleReturn}
                    placeholder={this.props.placeholder}
                    ref={this.search}
                />
                <span className={cl} onMouseDown={this.onTouchDown} onClick={this.clearTerm}></span>
            </div>
          </div>
        )
    }
}

import * as React from 'react';
import {Editor, EditorState, ContentState, convertToRaw, CompositeDecorator, Modifier, SelectionState, DraftHandleValue} from 'draft-js'
import { SearcQueryManager, searchDecorators, searchEntities } from "./extensions";
import classnames from "classnames";
import "./SearchBox.scss"

type Props = {
    termChanged:(term:string, offset:number) => void
    placeholder?:string
    term:string
    onBlur?:(event:React.SyntheticEvent<any>) => void
    onFocus?:(event:React.SyntheticEvent<any>) => void
    onEnter?:(event:React.SyntheticEvent<any>) => void
    onKeyDown?:(event:React.SyntheticEvent<any>) => void
    className?:string
    id?:string
    onClick?:(event:React.SyntheticEvent<any>) => void
} 
type State = {
    term:string
    editorState:EditorState
}
export class SearchBox extends React.Component<Props, State>{
    search = React.createRef<Editor>();
    constructor(props:Props)
    {
        super(props)

        const decorator = new CompositeDecorator(searchDecorators);
        const blocks = SearcQueryManager.convertToContentState(props.term)
        this.state = {
          editorState: EditorState.createWithContent(blocks, decorator),
          term:""
        }
    }
    appendTextToState = (text:string, editorState:EditorState, focus:boolean) => {
        let state = editorState
        state = EditorState.moveSelectionToEnd(state)
        let contentState = state.getCurrentContent()
        const selectionState = state.getSelection()
        contentState = Modifier.insertText(contentState, selectionState, text) 

        state = EditorState.push(
            state,
            contentState,
            'insert-characters'
        )
        if(focus)
            state = EditorState.moveFocusToEnd(state)
        return state
    }
    appendText = (text:string, focus:boolean) =>{
        let editorState = this.state.editorState
        editorState = this.appendTextToState(text, editorState, focus)
        this.setState({ editorState: editorState }, () => {this.onChange(editorState)})
    }
    insertEntity = (type:string, text:string, data:Object, start:number, end:number, appendSpace:boolean) => {
        let editorState = this.state.editorState
        let contentState = editorState.getCurrentContent()
        const contentBlock = editorState.getCurrentContent().getBlockMap().first()
        const blockKey = contentBlock.getKey();
        const blockSelection = SelectionState
          .createEmpty(blockKey)
          .merge({
          anchorOffset: start,
          focusOffset: end,
        }) as SelectionState;
        const meta = searchEntities[type]
        const contentStateWithEntity = contentState.createEntity(
            meta.type,
            meta.mutability,
            data
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        contentState = Modifier.applyEntity(
            contentStateWithEntity,
            blockSelection,
            entityKey
        )
        contentState = Modifier.replaceText(contentState, blockSelection, text, null, entityKey)
        editorState = EditorState.push( editorState, contentState, 'insert-characters')
        if(appendSpace)
            editorState = this.appendTextToState(" ", editorState, true)
        else 
            editorState = EditorState.moveFocusToEnd(editorState)
        this.setState({ editorState: editorState } ,() => {this.onChange(editorState)})
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
        let editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''), 'remove-range');
        editorState = EditorState.moveFocusToEnd(editorState)
        this.setState({ editorState }, () => {
            this.props.termChanged("", 0)
        });
    }
    onChange = (es:EditorState) => {
        const selection = es.getSelection()
        let editorState = SearcQueryManager.getStateWithEntities(es)
        editorState = EditorState.acceptSelection(editorState, selection)
        const selectionOffset = editorState.getSelection().getFocusOffset()
        let text = editorState.getCurrentContent().getPlainText()
        const oldTerm = this.state.term
        //this.logState()
        this.setState({editorState, term:text}, () => {
            if(oldTerm != text)
            {
                this.props.termChanged(text, selectionOffset)
            }
        })
    }
    render() {
        let clearVisible = this.props.term.length > 0
        let cl = clearVisible ? "fa fa-times-circle searchclear" : "hidden searchclear"
        const cn = classnames("search-box anim-transition", this.props.className)
        return (
          <div onClick={this.props.onClick} id={this.props.id} className={cn}>
            <div className="editor form-control" onClick={this.focus}>
                <span className="icon"><i className="fa fa-search fa-lg"></i></span>
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    onFocus={this.props.onFocus} 
                    onBlur={this.props.onBlur} 
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
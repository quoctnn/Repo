import * as React from "react";
import * as ReactDOM from "react-dom";

import { EditorState, DraftHandleValue, Modifier, SelectionState , } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import "draft-js-mention-plugin/lib/plugin.css";
import "draft-js-emoji-plugin/lib/plugin.css";
import createMentionPlugin, { defaultSuggestionsFilter } from "draft-js-mention-plugin";
import createEmojiPlugin from "draft-js-emoji-plugin";
import emojiPositionSuggestions from "./emojiPositionSuggestion";
import {defaultTheme} from 'draft-js-emoji-plugin'
import { UserProfile } from "../../../types/intrasocial_types";
import { IntraSocialUtilities } from "../../../utilities/IntraSocialUtilities";
import { Settings } from "../../../utilities/Settings";
import { SecureImage } from '../SecureImage';
import { userFullName } from "../../../utilities/Utilities";
require("./MentionEditor.scss");

let theme = {...defaultTheme, emojiSelectPopover:"emojiSelectPopover " + defaultTheme.emojiSelectPopover}
export const emojiReplacements = {
    ':-)': "😀", 
    ':)': "😀", 
    ':]': "😀", 
    ':-]': "😀", 
    ':D':"🤣",
    ':-D':"🤣",
    ':/':'😕',
    ':-/':'😕',
    ':(':'🙁',
    ':-(':'🙁',
    ':[':'😡', 
    ':-[':'😡',
    '</3':'💔',
    '<3':'❤️',
    ':-O':'😲',
    ':O':'😲',
    ';)':'😉', 
    ';-)':'😉'
}
export class Mention {
    name: string;
    key: string;
    avatar: string;
    id: number;
    constructor(name: string, key: string, avatar: string, id: number) {
        this.name = name;
        this.avatar = avatar;
        this.key = key;
        this.id = id;
    }
    static fromUser(user:UserProfile)
    {
        return new Mention(userFullName(user),
        user.username,
        IntraSocialUtilities.appendAuthorizationTokenToUrl(user.avatar || user.avatar_thumbnail),
        user.id)
    }
}
interface EntryProps {
  mention: Mention;
  searchValue: string;
  isFocused: boolean;
}
const Entry = (props: EntryProps) => {
    const {
            mention,
            searchValue, // eslint-disable-line no-unused-vars
            isFocused, // eslint-disable-line no-unused-vars
            ...parentProps
    } = props;

    return (
        <div {...parentProps}>
        <div className="mentionSuggestionsEntryContainer">
            <div className="mentionSuggestionsEntryContainerLeft">
            <SecureImage
                url={mention.avatar}
                className="mentionSuggestionsEntryAvatar"
                role="presentation"
            />
            </div>

            <div className="mentionSuggestionsEntryContainerRight">
            <div className="mentionSuggestionsEntryText">{mention.name}</div>

            <div className="mentionSuggestionsEntryTitle">{mention.key}</div>
            </div>
        </div>
        </div>
    );
};
const positionSuggestions = ({ state, props }) => {
    let transform;
    let transition;

    if (state.isActive && props.suggestions.length > 0) {
        transform = "scaleY(1)";
        transition = "all 0.25s cubic-bezier(.3,1.2,.2,1)";
    } else if (state.isActive) {
        transform = "scaleY(0)";
        transition = "all 0.25s cubic-bezier(.3,1,.2,1)";
    }

    return {
        transform,
        transition,
        position: "relative",
        padding: "0",
        boxShadow: "none",
        margin: "0.5rem 0.5rem -0.5rem -0.5rem",
        marginBottom: "4px",
        marginLeft:"4px",
        maxWidth: "initial",
        maxHeight: "150px",
        overflowY: "auto"
    };
};

type OwnProps = {
    editorState: EditorState;
    onChange?: (editorState: EditorState) => void;
    filesAdded?:(files:File[]) => void
    mentionSearch:(search:string, completion:(mentions:Mention[]) => void) => void
    onHandleUploadClick?:(event) => void
    placeholder?:string
    keyBindings?:(event:any) => string
    handleKeyCommand?:(command: string) => DraftHandleValue

}
type DefaultProps = {
    showEmojiPicker:boolean
    onBlur?(e: React.SyntheticEvent<{}>): void
    onFocus?(e: React.SyntheticEvent<{}>): void
}
type State = {
    suggestions: Mention[]
    emojiSelectOpen: boolean
    search:string
}
type Props = DefaultProps & OwnProps
export default class MentionEditor extends React.Component<Props, State> {
    mentionPlugin: any;
    editor = React.createRef<Editor>();
    rootElement: any;
    positioningElement: any;
    observer:MutationObserver
    emojiPlugin = createEmojiPlugin({
        positionSuggestions: emojiPositionSuggestions,
        useNativeArt: true,
        theme:theme
    });

    private emojiButton = React.createRef<HTMLButtonElement>();
    private container = React.createRef<HTMLDivElement>();
    private fileUploader = React.createRef<HTMLInputElement>();
    static defaultProps:DefaultProps = {
            showEmojiPicker:true
    }
    constructor(props) {
        super(props);

        this.mentionPlugin = createMentionPlugin({
            positionSuggestions
        });
        this.state = {
            suggestions: [],
            emojiSelectOpen: false,
            search:""
        };
        this.rootElement = null;
        this.positioningElement = null;
        this.observer = null;
    }
    componentWillUnmount = () => {
        this.removeBackDrop()
        this.mentionPlugin = null;
        this.editor = null;
        this.state = null;
        this.rootElement = null;
        this.positioningElement = null;
        this.observer = null;
        this.emojiPlugin = null;
        this.emojiButton = null;
        this.container = null;
        this.fileUploader = null;
    }
    onChange = (editorState: EditorState) => {
        if (this.props.onChange) {
            this.props.onChange(editorState);
        }
    }
    onSearchChange = ({ value }) => {
        this.props.mentionSearch(value, (mentions) => {
            this.setState({
                suggestions: defaultSuggestionsFilter(value, mentions),
                search:value
            });
        })
    }

    onAddMention = (mention) => {
        // get the mention object selected
        console.log("mention", mention);
    }

    focus = (e?:React.SyntheticEvent<any>) => {
        if(e){
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
        }
        this.editor.current.focus();
    }
    onEmojiButtonMouseUp = (e) => {
        this.toggleEmojiPanel(e)
    }
    handleRootClick = (e) =>
    {
        this.toggleEmojiPanel(e)
    }
    addBackDrop = () => {

        const { EmojiSelect } = this.emojiPlugin;
        if (!this.rootElement) {
            this.rootElement = document.createElement("div");
            this.rootElement.className = "emoji-backdrop";
            this.rootElement.addEventListener("click", this.handleRootClick);
            document.body.appendChild(this.rootElement);

            this.positioningElement = document.createElement("div");
            this.positioningElement.className = "context-positioning-element";
            document.body.appendChild(this.positioningElement);

            this.addObservers();
            this.updatePositioningElementStyle();
            let windowHeight = window.innerHeight;
            let buttonRect = this.emojiButton.current.getBoundingClientRect() as any;
            var bodyRect = document.documentElement.getBoundingClientRect();
            let offset = buttonRect.top + buttonRect.height - bodyRect.top;
            let up = offset > 360 && buttonRect.y >= windowHeight / 2;
            let tranform = up ? "translate(0, calc(-100% - 55px))" : "none";
            ReactDOM.render(
                <div className="emoji-picker-container" style={{ transform: tranform }}>
                    <EmojiSelect isOpen={this.state.emojiSelectOpen} />
                </div>,
                this.positioningElement
            );
            this.updatePositioningElementStyle();
        }
    }
    updatePositioningElementStyle = () =>
    {
        if (this.positioningElement)
        {
            let buttonRect = this.emojiButton.current.getBoundingClientRect() as any
            var bodyRect = document.documentElement.getBoundingClientRect()
            let offset = buttonRect.top + buttonRect.height - bodyRect.top
            let top = offset + 10
            let width = buttonRect.x + buttonRect.width
            this.positioningElement.style.top = top + "px"
            this.positioningElement.style.width = width + "px"
            this.positioningElement.style.position = "absolute"
        }

    }
    removeBackDrop = () => {
        let el = this.rootElement;
        if (el) {
            this.rootElement = null;
            el.parentNode.removeChild(el);
        }
        el = this.positioningElement;
        if (el) {
            this.positioningElement = null;
            el.parentNode.removeChild(el);
        }
        this.removeObservers();
    }
    addObservers = () =>
    {
        var observer = new MutationObserver(this.observeCallback)
        var config = {childList: true, subtree: true}
        observer.observe(this.container.current, config);
        this.observer = observer
        window.addEventListener("resize", this.observeCallback)
    }
    removeObservers = () =>
    {
        if(this.observer)
        {
            this.observer.disconnect()
            this.observer = null
        }
        window.removeEventListener("resize", this.observeCallback)
    }
    observeCallback = (mutations) =>
    {
        this.updatePositioningElementStyle()
    }
    toggleEmojiPanel = (e) =>
    {
        e.preventDefault();
        let visible = !this.state.emojiSelectOpen;
        this.setState(() => {
            return { emojiSelectOpen: visible }
        }, () => {
            if (visible) {
                this.addBackDrop();
            } else {
                this.removeBackDrop();
            }
        })

    }
    uploadFileChanged = (event) => {
        let filesList = this.fileUploader.current.files
        let files = []
        for (var i = 0; i < filesList.length; i++)
        {
            let file = filesList.item(i)
            files.push(file)
        }
        this.fileUploader.current.value = ""
        this.props.filesAdded(files)
    }
    onFileuploadButtonClick = (event) => {
        if(this.props.filesAdded)
            this.fileUploader.current.click()
        else if(this.props.onHandleUploadClick)
            this.props.onHandleUploadClick(event)
    }
    private replaceText = (start:number, end:number, text:string, newOffset:number, editorState: EditorState) => {
        const selection = editorState.getSelection();
        const block = editorState.getCurrentContent().getBlockForKey(selection.getAnchorKey());
        const blockSelection = SelectionState
            .createEmpty(block.getKey())
            .merge({
            anchorOffset: start,
            focusOffset: end,
          }) as SelectionState
        let contentState = editorState.getCurrentContent();
        contentState = Modifier.replaceText(contentState, blockSelection, text)
        let state = EditorState.push( editorState, contentState, 'insert-characters')
        const newselection = new SelectionState({
            anchorKey: block.getKey(),
            anchorOffset: newOffset,
            focusKey: block.getKey(),
            focusOffset: newOffset,
            isBackward: false,
        })
        state = EditorState.forceSelection(
            state,newselection
        )
        this.onChange(state)
    }
    onHandleBeforeInput = (chars: string, editorState: EditorState):DraftHandleValue => {

        const selection = editorState.getSelection();
        const block = editorState.getCurrentContent().getBlockForKey(selection.getAnchorKey());
        const value = block.getText()
        const charsInputPos = selection.getEndOffset()
        const text = value.slice(0, charsInputPos);
        if(chars == " ")
        {
            var word = ""
            var i = text.length
            while(i >= 0)
            {
                let char = text.substring(i - 1, i)
                if(char == " " || i == 0)
                {
                    let replacement = emojiReplacements[word]
                    if (replacement)
                    {
                        const text = replacement + " "
                        this.replaceText(i, charsInputPos, text, i + text.length, editorState)
                        return "handled" 
                    }
                }
                else 
                {
                    word = char + word
                }
                i--
            }
        }
        return "not-handled"    
    }
    render = () => {
        const { MentionSuggestions } = this.mentionPlugin;
        const plugins = [this.mentionPlugin];
        return (
        <div ref={this.container} className="mention-editor" onClick={this.focus}>
            <div>
                <div className="d-flex">
                <div className="flex-grow-1 editor-container">
                    <div className="editor-inner-container">
                        <Editor
                            editorState={this.props.editorState}
                            onChange={this.onChange}
                            plugins={plugins}
                            ref={this.editor}
                            onBlur={this.props.onBlur}
                            onFocus={this.props.onFocus}
                            placeholder={this.props.placeholder}
                            keyBindingFn={this.props.keyBindings}
                            handleBeforeInput={this.onHandleBeforeInput}
                            handleKeyCommand={this.props.handleKeyCommand}
                            
                        />
                    </div>
                </div>
                <div className="d-flex align-items-end">
                    {this.props.showEmojiPicker &&
                        <button
                            ref={this.emojiButton}
                            className="emojiButton editor-button btn btn-default"
                            onMouseUp={this.onEmojiButtonMouseUp}
                            type="button" >
                                <i className="far fa-smile fa-lg"></i>
                        </button>
                    }
                    {(this.props.filesAdded || this.props.onHandleUploadClick) &&
                        <button 
                            className="upload-button editor-button btn btn-default"
                            type="button" onClick={this.onFileuploadButtonClick} >
                            {this.props.filesAdded && 
                                <input ref={this.fileUploader} 
                                        accept={Settings.allowedTypesFileUpload} 
                                        multiple={true} 
                                        className="form-control" 
                                        type="file" 
                                        onChange={this.uploadFileChanged} /> }
                            <i className="fa fa-paperclip fa-lg"></i>
                        </button>}
                </div>
            </div>
            </div>

            <MentionSuggestions
                onSearchChange={this.onSearchChange}
                suggestions={this.state.suggestions}
                onAddMention={this.onAddMention}
                entryComponent={Entry}
                />
        </div>
        );
    }
}

import * as React from "react";
import MentionEditor from "../input/MentionEditor";
import { EditorState, ContentState, getDefaultKeyBinding, KeyBindingUtil,  SelectionState, Modifier, DraftHandleValue} from "draft-js";
import { Mention } from '../input/MentionEditor';
import { nullOrUndefined, uniqueId, MENTION_REGEX, MentionData } from '../../../utilities/Utilities';
import "./ChatMessageComposer.scss"
import classnames from 'classnames';
import { NavigationUtilities } from '../../../utilities/NavigationUtilities';
import { Settings } from '../../../utilities/Settings';

const { isCtrlKeyCommand } = KeyBindingUtil;

export type EditorContent = {text:string, mentions:number[]}
interface MentionEntry
{
    entityKey:string,
    blockKey: string,
    blockData:{offset:number, length:number},
    entity:Mention,
    start?:number,
    end?:number
}
function getEntities(contentState:ContentState, entityType = null) {
  const entities:MentionEntry[] = [];
  let blocks = getBlocks(contentState)
  contentState.getBlocksAsArray().forEach((block) => {
    let selectedEntity:MentionEntry = null;
    block.findEntityRanges(
      (character) => {
        if (character.getEntity() !== null) {
          const entity = contentState.getEntity(character.getEntity());
          if (!entityType || (entityType && entity.getType() === entityType)) {
            selectedEntity = {
              entityKey: character.getEntity(),
              blockKey: block.getKey(),
              blockData:blocks[block.getKey()],
              entity: contentState.getEntity(character.getEntity()).getData().mention,
            };
            return true;
          }
        }
        return false;
      },
      (start, end) => {
        entities.push({ ...selectedEntity, start, end });
      });
  });
  return entities;
}
const findMentionEntities = (contentState:ContentState) => {
  let k = getEntities(contentState,"mention")
  return k
};
const getBlocks = (contentState:ContentState) => {
    let blocks:{[id:string]: {offset:number, length:number}} = {}
    var offset = 0
    contentState.getBlocksAsArray().forEach(b => {
        let length = b.getLength()
        blocks[b.getKey()] = {offset, length}
        offset += length + 1
    })
    return blocks
}
const generateContentState = (content:string):ContentState =>
{
    var contentState = ContentState.createFromText(content || "")
    const selectionsToReplace:{mention:Mention, selectionState:any}[] = [];
    var indexes:{[block:string]:{index:number,length:number, mention:Mention}[]} = {}
    if(content && content.length > 0)
    {
        const blockMap = contentState.getBlockMap()
        blockMap.forEach((block) => {
            let text = block.getText()
            var match:RegExpExecArray = null
            while (match = MENTION_REGEX.exec(text)) {
                let key = block.getKey()
                let arr = indexes[key] || []
                const data = MentionData.fromRegex(match)
                arr.push({index:match.index, length:MENTION_REGEX.lastIndex - match.index, mention: Mention.fromMentionData(data)})
                indexes[key] = arr
            }
        })
        Object.keys(indexes).forEach(k => {
            let arr = indexes[k].sort((a,b) => a.index - b.index)
            for(var i = 0; i < arr.length; i++)
            {
                let ix = arr[i]
                let length = ix.length
                let newLength = ix.mention.name.length
                let diff = newLength - length
                if(diff != 0)
                {
                    for(var j = i + 1; j < arr.length; j++) // move following
                    {
                        arr[j].index = arr[j].index + diff
                    }
                }
                const blockSelection = SelectionState
                        .createEmpty(k)
                        .merge({
                            anchorOffset: ix.index,
                            focusOffset: ix.index + ix.length,
                        });

                    selectionsToReplace.push({mention:ix.mention, selectionState:blockSelection})
            }
        })
    }
    selectionsToReplace.forEach(state => {
        const contentStateWithEntity = contentState.createEntity("mention", "SEGMENTED", {mention:state.mention})
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        contentState = Modifier.replaceText(
            contentState,
            state.selectionState,
            state.mention.name,
            null,
            entityKey,
        )
    })
    return contentState
}
type OwnProps = {
    onSubmit:(text:string, mentions:number[]) => void,
    onDidType:(unprocessedText:string) => void
    filesAdded?:(files:File[]) => void
    content:string
    mentionSearch:(search:string, completion:(mentions:Mention[]) => void) => void
    onHandleUploadClick?:(event) => void
    canSubmit?:boolean
    className?:string
    placeholder?:string
    showEmojiPicker?:boolean
    onBlur?(e: React.SyntheticEvent<{}>): void
    onFocus?(e: React.SyntheticEvent<{}>): void
    focusEnd?:(f:() => void) => void
    forceUpdate?:string
    submitOnEnter:ConstrainBoolean
}
type DefaultProps = {
    showSubmitButton:boolean
    submitOnEnter:boolean
    singleLine:boolean
    minimumTextLength:number
    useAdaptiveFontSize:boolean
}
type Props = OwnProps & DefaultProps
interface State
{
    plainText:string
    editorState:EditorState
}
export class ChatMessageComposer extends React.Component<Props,State> {

    private inputRef = React.createRef<MentionEditor>()
    private protectKey = uniqueId()
    static defaultProps:DefaultProps = {
        showSubmitButton:true,
        submitOnEnter:false,
        singleLine:false,
        minimumTextLength:1,
        useAdaptiveFontSize:false
    }
    getNavigationProtectionKeys = () => {
        return [this.protectKey]
    }
    constructor(props:Props) {
        super(props)
        this.state = {
            plainText:this.props.content || "",
            editorState:EditorState.createWithContent(generateContentState(this.props.content))
        }
    }
    componentDidMount = () => {
        this.props.focusEnd && this.props.focusEnd(this.focusEnd)
    }
    componentWillUnmount = () => {
        NavigationUtilities.protectNavigation(this.protectKey, false);
        this.inputRef = null;
        this.protectKey = null;
    }
    focus = () => {
        this.inputRef.current.focus()
    }

    focusEnd = () => {
        this.setState((prevState) => {
            const editorState = EditorState.moveFocusToEnd(prevState.editorState)
            return {editorState: editorState}
        }, this.inputRef.current.focus)
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const update = nextProps.canSubmit != this.props.canSubmit ||
                nextState.editorState != this.state.editorState ||
                nextProps.content != this.props.content ||
                nextProps.className != this.props.className ||
                nextProps.forceUpdate != this.props.forceUpdate ||
                nextProps.singleLine != this.props.singleLine 
        return update
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.state.plainText == "" && this.props.forceUpdate != prevProps.forceUpdate && this.props.content && this.props.content.length > 0)
        {
            this.setState((prevState) => {
                const editorState = EditorState.push(prevState.editorState, generateContentState(this.props.content), "change-block-data");
                const text = editorState.getCurrentContent().getPlainText()
                return {plainText:text, editorState: editorState}
            }, this.sendDidType)
        }
    }
    clearEditorContent = () => {

    }
    getContent = () => {
        return this.getProcessedText()
    }
    getPlainText = () => {
        return this.state.editorState.getCurrentContent().getPlainText()
    }
    handleSubmit = (e?:any) => {
        e && e.preventDefault();
        let {text, mentions} = this.getProcessedText()
        if (text.length >= this.props.minimumTextLength) {
            this.props.onSubmit(text, mentions)
            const editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''), "remove-range");
            this.setState({plainText: '', editorState})
            NavigationUtilities.protectNavigation(this.protectKey, false);
            this.focusEnd()
        }
        return false
    }
    keyBindings = (e: any) => {

        if (e.keyCode === 13 )
        {
            if(isCtrlKeyCommand(e) || e.nativeEvent.shiftKey)
            {
                if(this.props.submitOnEnter)
                    return "insert-linebreak"
                else
                    return "submit"
            }
            if(this.props.submitOnEnter)
                return "submit"
        }
        return getDefaultKeyBinding(e);
    }
    handleKeyCommand = (command: string): DraftHandleValue => {
        if (command == "submit") {
            if(this.canSubmit())
            {
                this.handleSubmit()
            }
            return 'handled';
        }
        else if (command == "insert-linebreak")
        {
            this.setState((prevState:State) => {
                const editorState = this.insertLinebreak(prevState.editorState)
                return {editorState}
            })
            return 'handled';
        }
        return 'not-handled';
    }
    insertLinebreak = (editorState: EditorState): EditorState => {
        const contentState = Modifier.insertText(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          '\n',
          editorState.getCurrentInlineStyle(),
          null,
        );

        const newEditorState = EditorState.push(
          editorState,
          contentState,
          'insert-characters',
        );

        return EditorState.forceSelection(
          newEditorState,
          contentState.getSelectionAfter(),
        );
    }
    sendDidType = () =>{
        this.props.onDidType(this.state.plainText)
    }
    fixFocusInput = () => {
        // For mobile devices that doesn't show soft keyboard
        //this.inputRef.current.click;
    }
    onChange = (state:EditorState) => {
        let text = state.getCurrentContent().getPlainText()
        NavigationUtilities.protectNavigation(this.protectKey, text != "")
        const hasChanged = this.state.plainText != text
        const f = hasChanged ? this.sendDidType : undefined
         this.setState(() => {
            return {plainText:text, editorState:state}
         }, f)
    }
    private getProcessedText = () => {
        if(!this.state.editorState)
        {
            return {text:"", mentions:[]}
        }
        var text = this.state.editorState.getCurrentContent().getPlainText()
        let entries = findMentionEntities(this.state.editorState.getCurrentContent()).reverse()
        let mentions:{[id:number]:number} = {}
        entries.forEach(e => {
            mentions[e.entity.id] = e.entity.id
            text = text.splice(e.start + e.blockData.offset, e.end - e.start, "@" + e.entity.key)
        })
        return {text, mentions:Object.keys(mentions).map(k => parseInt(k))}
    }
    canSubmit = () => {
        // Trim whitespaces from text input. Sending only whitespace is invalid.
        const textLength = this.state.plainText.replace(/\s/g, '').length
        const canSubmit = textLength >= this.props.minimumTextLength
        if( !nullOrUndefined( this.props.canSubmit) )
            return canSubmit && this.props.canSubmit
        return canSubmit
    }
    render = () => {
        const canSubmit = this.canSubmit()
        const largeText = this.props.useAdaptiveFontSize ? this.state.plainText.length < Settings.StatusAdaptiveFontSizeLimit && this.state.plainText.length > 0 : false
        const cn = classnames("chat-message-composer", this.props.className, {"single-line":this.props.singleLine, "af":largeText})
        return (
            <div className={cn}>
                <form className="clearfix" action="." onSubmit={this.handleSubmit}>
                    <div className="input-group">
                        <div className="input-wrap"
                            onFocus={this.fixFocusInput}>
                            <MentionEditor
                                onHandleUploadClick={this.props.onHandleUploadClick}
                                filesAdded={this.props.filesAdded}
                                mentionSearch={this.props.mentionSearch}
                                editorState={this.state.editorState}
                                ref={this.inputRef}
                                onChange={this.onChange}
                                placeholder={this.props.placeholder}
                                showEmojiPicker={this.props.showEmojiPicker}
                                onBlur={this.props.onBlur}
                                onFocus={this.props.onFocus}
                                keyBindings={this.keyBindings}
                                handleKeyCommand={this.handleKeyCommand}
                            />
                        </div>
                        {this.props.showSubmitButton &&
                            <div className="button-wrap d-flex flex-column-reverse">
                                <button disabled={!canSubmit} className="btn btn-submit btn-default align-items-end message-send-button">
                                    <i className="fas fa-location-arrow" />
                                </button>
                            </div>
                        }
                    </div>
                </form>
            </div>
        )
    }
}
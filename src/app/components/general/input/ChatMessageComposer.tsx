
import * as React from "react";
import MentionEditor from "../input/MentionEditor";
import { EditorState, ContentState, getDefaultKeyBinding, KeyBindingUtil,  SelectionState, Modifier} from "draft-js";
import { Mention } from '../input/MentionEditor';
import { ProtectNavigation, nullOrUndefined } from "../../../utilities/Utilities";
import "./ChatMessageComposer.scss"

const { hasCommandModifier } = KeyBindingUtil;

export type EditorContent = {text:string, mentions:number[]}
export interface IEditorComponent
{
    clearEditorContent:() => void
    getContent:() => EditorContent
}
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
const generateContentState = (content:string, mentions:Mention[]):ContentState =>
{
    var contentState = ContentState.createFromText(content || "")
    const selectionsToReplace:{mention:Mention, selectionState:any}[] = [];
    var indexes:{[block:string]:{index:number,length:number, mention:Mention}[]} = {}
    if(mentions && mentions.length > 0)
    {
        const blockMap = contentState.getBlockMap()
        blockMap.forEach((block) => {
            let text = block.getText()
            mentions.forEach(m => {
                var re = new RegExp("@"+m.key.replace("+","\\+"), 'g')
                var match:RegExpExecArray = null
                while (match = re.exec(text)) {
                    let key = block.getKey()
                    let arr = indexes[key] || []
                    arr.push({index:match.index, length:re.lastIndex - match.index, mention:m})
                    indexes[key] = arr
                }
            })
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
type Props = {
    onSubmit:(text:string, mentions:number[]) => void,
    onDidType:(unprocessedText:string) => void
    filesAdded?:(files:File[]) => void
    content:string
    mentions:Mention[]
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

}
type DefaultProps = {
    showSubmitButton:boolean
}

interface State
{
    plainText:string
    editorState:EditorState
}
export class ChatMessageComposer extends React.Component<Props & DefaultProps,State> implements IEditorComponent {
    
    private inputRef = React.createRef<MentionEditor>()
    static defaultProps:DefaultProps = {
        showSubmitButton:true
    }
    constructor(props) {
        super(props)
        this.state = {
            plainText:this.props.content || "", 
            editorState:EditorState.createWithContent(generateContentState(this.props.content, this.props.mentions))
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.fixFocusInput = this.fixFocusInput.bind(this)
        this.sendDidType = this.sendDidType.bind(this)
        this.getProcessedText = this.getProcessedText.bind(this)
        this.onChange = this.onChange.bind(this)
        this.canSubmit = this.canSubmit.bind(this)
    }
    componentDidMount = () => {
        this.props.focusEnd && this.props.focusEnd(this.focusEnd)
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
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        const update = nextProps.canSubmit != this.props.canSubmit || 
                nextState.editorState != this.state.editorState || 
                nextProps.content != this.props.content || 
                nextProps.className != this.props.className ||
                nextProps.forceUpdate != this.props.forceUpdate ||
                !(nextProps.mentions || []).isEqual(this.props.mentions || [])
        return update
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.state.plainText == "" && this.props.forceUpdate != prevProps.forceUpdate && this.props.content && this.props.content.length > 0)
        {
            this.setState((prevState) => {
                const editorState = EditorState.push(prevState.editorState, generateContentState(this.props.content, this.props.mentions), "change-block-data");
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
    handleSubmit(e) {
        e.preventDefault();
        let {text, mentions} = this.getProcessedText()
        if (text.length > 0) {
            this.props.onSubmit(text, mentions)
            const editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''), "remove-range");
            this.setState({plainText: '', editorState})
            ProtectNavigation(false);
        }
        return false
    }
    keyBindings = (e: any) => {
        if (e.keyCode === 13 && hasCommandModifier(e)) { // Ctrl(Cmd) + Enter Submits the form
          return this.handleSubmit(e)
        }
        return getDefaultKeyBinding(e);
      }

    sendDidType()
    {
        this.props.onDidType(this.state.plainText)
    }
    fixFocusInput() {
        // For mobile devices that doesn't show soft keyboard
        //this.inputRef.current.click;
    }
    onChange(state:EditorState)
    {
        let text = state.getCurrentContent().getPlainText()
        ProtectNavigation(text != "")
        const hasChanged = this.state.plainText != text
        const f = hasChanged ? this.sendDidType : undefined
        this.setState({plainText:text, editorState:state}, f)
    }
    getProcessedText()
    {
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
    canSubmit()
    {
        if( !nullOrUndefined( this.props.canSubmit) )
            return this.props.canSubmit
        return this.state.plainText.length > 0
    }
    render() {
        const canSubmit = this.canSubmit()
        return (
            <div className={"chat-message-composer" + (this.props.className ? " " + this.props.className : "")}>
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
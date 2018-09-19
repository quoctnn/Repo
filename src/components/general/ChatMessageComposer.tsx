
import * as React from "react";
import { ProtectNavigation } from '../../utilities/Utilities';
import MentionEditor from "../input/MentionEditor";
import { EditorState, ContentState } from "draft-js";
import { Mention } from '../input/MentionEditor';
require("./ChatMessageComposer.scss");

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
  console.log(blocks)
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
  };
export interface Props
{
    onSubmit:(text:string, mentions:number[]) => void,
    onDidType:() => void
    mentions:Mention[]
    filesAdded?:(files:File[]) => void
}
interface State
{
    plainText:string
    editorState:EditorState
}
export class ChatMessageComposer extends React.Component<Props,{}> {
    state:State
    throttleTime = 1000
    canPublish = true
    private inputRef = React.createRef<any>()
    constructor(props) {
        super(props)
        this.state = {plainText:"", editorState:EditorState.createEmpty()}
        this.handleTextChange = this.handleTextChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.fixFoucusInput = this.fixFoucusInput.bind(this)
        this.sendDidType = this.sendDidType.bind(this)
        this.getProcessedText = this.getProcessedText.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    handleTextChange(e) {
        ProtectNavigation(e.target.value != "");
        this.setState({text: e.target.value}, this.sendDidType)
    }

    handleSubmit(e) {
        e.preventDefault();
        let {text, mentions} = this.getProcessedText()
        if (text.length > 0) {
            this.props.onSubmit(text, mentions)
            const editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''), "remove-range");
            this.setState({plainText: '', editorState:editorState})
            ProtectNavigation(false);
        }
        return false
    }
    sendDidType()
    {
        if(this.canPublish) 
        {
            this.props.onDidType()
            this.canPublish = false
            setTimeout(() => {
              this.canPublish = true
            }, this.throttleTime)
        }
    }
    fixFoucusInput() {
        // For mobile devices that doesn't show soft keyboard
        this.inputRef.current.click;
    }
    onChange(state:EditorState)
    {
        let text = state.getCurrentContent().getPlainText()
        ProtectNavigation(text != "")
        this.setState({plainText:text, editorState:state}, this.sendDidType)
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
    render() {
        return (
            <div className="chat-message-composer">
                <form className="clearfix" action="." onSubmit={this.handleSubmit}>
                    <div className="input-group">
                        <div className="input-wrap"
                            onFocus={this.fixFoucusInput}>
                            <MentionEditor filesAdded={this.props.filesAdded} mentions={this.props.mentions} editorState={this.state.editorState} ref={this.inputRef} onChange={this.onChange}/> 
                        </div>
                        <div className="button-wrap d-flex flex-column-reverse">
                            <button className="btn btn-submit btn-default align-items-end btn-primary message-send-button">
                                <i className="fas fa-location-arrow" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}
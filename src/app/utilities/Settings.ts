const isTouchDevice = () =>
{
    const w = window as any
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function(query) {
      return window.matchMedia(query).matches;
    }
    if (('ontouchstart' in w) || w.DocumentTouch) {
        return true;
      }
    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
  }
export interface ISettings
{
    isProduction:boolean,
    isElectron:boolean,
    supportsTheming:boolean,
    showEmbedlyCards:boolean,
    searchEnabled:boolean,
    clearSomeoneIsTypingInterval:number
    sendSomeoneIsTypingthrottle:number
    allowedTypesFileUpload:string
    commentMaxLength: number
    maxFileSize: number
    maxStatusPreviewItems: number
    isTouchDevice:boolean
    statusTruncationLength:number
    statusLinebreakLimit:number
    renderLinkTitle:boolean
    mapboxAccessToken:string
    allowReact360:boolean
    compatMajor:number
    compatMinor:number
    CDN:boolean
    CDNHost:string
    CDNPath:string
    FBAppId:string
}
export const Settings:ISettings = {
    isProduction : process.env.NODE_ENV === "production",
    isElectron: navigator.userAgent.toLowerCase().indexOf(' electron/') > -1,
    searchEnabled:true,
    maxFileSize: 400,
    supportsTheming: window.CSS && window.CSS.supports && window.CSS.supports("(--foo: red)"),
    showEmbedlyCards:true,
    clearSomeoneIsTypingInterval: 4000,
    sendSomeoneIsTypingthrottle:1000,
    allowedTypesFileUpload:"image/*,video/*,audio/*,application/pdf," +
    ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pps,.ppsx,.xps,.odp,.ods,.odt,.rtf,.txt,.key," + // Docs
    ".css,.html,.php,.c,.cpp,.h,.hpp," + // Code
    ".dxf,.ai,.psd,.eps,.ps,.svg,.ttf,",
    commentMaxLength: 5000,
    maxStatusPreviewItems:5,
    isTouchDevice:isTouchDevice(),
    statusTruncationLength:200,
    statusLinebreakLimit:5,
    renderLinkTitle:true,
    mapboxAccessToken:"pk.eyJ1IjoiaW50cmFob3VzZSIsImEiOiJjaXJsc3lmc3gwMDJyaGpuaHdvb2oxYnM5In0.2Um0WFRpufTR55w9_6ALDQ",
    allowReact360:false,
    compatMajor:0,
    compatMinor:6,
    CDN:true,
    CDNHost:"cdn.intra.work",
    CDNPath:"5.3.0/2",
    FBAppId:"1011246482308121"
}
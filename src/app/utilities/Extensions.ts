

import * as Immutable from "immutable";
import { nullOrUndefined, SINGLE_EMAIL_REGEX } from "./Utilities";

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
}
String.prototype.trimLeftCharacters = function(charlist:string){
    if (charlist === undefined)
        charlist = "\s";
    return this.replace(new RegExp("^[" + charlist + "]+"), "")
}
String.prototype.format = function(...args:any[]) {
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    })
}
String.prototype.isNumber = function(): boolean
{
   return !isNaN(Number(this.toString()));
}
String.isEmail = (value:string) => {
   const val = SINGLE_EMAIL_REGEX.test(value)
   return val
}
Array.prototype.move = function(oldIndex, newIndex) {
  if (newIndex >= this.length) {
      newIndex = this.length - 1;
  }
  this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
}
Array.prototype.distinct = function() {
  return Array.from(new Set(this))
}
Array.prototype.contains = function<T>(element:T): boolean {
  return this.indexOf(element) >= 0
}
Array.prototype.cloneArray = function() {
  return nullOrUndefined(this) ? this : Immutable.fromJS(this).toJS()
}
Array.prototype.isEqual = function<T>(arr2:T[]) 
{
    if(!this || !arr2) 
        return false
    if(this.length == 0 && arr2.length == 0)
        return true
    if(this.length != arr2.length)
        return false
    let result = false;
    this.forEach((e1,i)=>arr2.forEach(e2=>{
        
            if(Array.isArray(e1) && Array.isArray(e2) && e1.length > 1 && e2.length)
            {
                result = e1.isEqual(e2)
            }
            else if(e1 !== e2 )
            {
                result = false
            }
            else
            {
                result = true
            }
        })
    )
    return result
}
Array.prototype.toggleElement = function<T>(element:T){
    const index = this.indexOf(element)
    if(index > -1)
        this.splice(index, 1)
    else 
        this.push(element)
}

Array.prototype.remove = function<T>(element:T):T[]{
    const index = this.indexOf(element)
    if(index > -1)
       return this.splice(index, 1)
}

Array.prototype.except = function<T>(element:T){
    const index = this.indexOf(element)
    if(index > -1)
        this.splice(index, 1)
    return this
}

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};
Number.prototype.isNumber = function(): boolean
{
   return !isNaN(Number(this.toString()));
}

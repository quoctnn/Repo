import * as React from 'react';
export interface StyleSheet {
    [key: string]: React.CSSProperties;
}
export class GlobalStyleSheet 
{
    static primaryColor = "#428BCA"
    static styles:StyleSheet = {
        link:{
            fontWeight:600,
            color:GlobalStyleSheet.primaryColor
        }
    }
}
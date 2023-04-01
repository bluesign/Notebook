import React from "react";
import { mergeStyleSets } from '@fluentui/merge-styles';


export default function Stack({direction='row',children}) {
    const styles = mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: {direction},
            flexWrap: 'nowrap',
            width: 'auto',
            height: 'auto',
            boxSizing: 'border-box',
            '> *': {
                textOverflow: 'ellipsis',
            },
            '> :not(:first-child)': {
                marginTop: '0px',
            },
            '> *:not(.ms-StackItem)': {
                flexShrink: 1,
            },
        },
    })


    return <div className={styles.root}>{children}</div>

}


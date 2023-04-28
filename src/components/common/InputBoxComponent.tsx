import $ from 'jquery';
import { copyOutline } from 'ionicons/icons';
import { IonButton, IonIcon } from '@ionic/react';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface IInputBoxCallable {
    getText(): string;
    setText(text: string): void;
};

const InputBoxComponent = forwardRef<IInputBoxCallable, {
    readonly?: boolean;
    copybtn?: boolean;
    text: string;
    id: string;
}>((props, ref) => {
    useImperativeHandle(ref, () => ({
        getText: getText,
        setText: setText,
    }));

    const textAreaRef = React.createRef<HTMLTextAreaElement>();
    const [body, setBody] = useState<string>(props.text || '');

    useEffect(() => {
        $(`textarea[id^="${props.id}"]`).off('keydown');
        $(`textarea[id^="${props.id}"]`).on('keydown', function (e) {
            var field = $(this);
            if (e.key === 'Tab') {
                e.preventDefault();
                setTimeout(() => {
                    var end = field.prop('selectionEnd');
                    var start = field.prop('selectionStart');
                    var value = field.prop('value').substring(0, start) + "\t" + field.prop('value').substring(end);
                    field.prop('value', value);
                    field.prop('selectionEnd', start + 1);
                    field.prop('selectionStart', start + 1);
                }, 0);
            }
        });
    }, []);

    const setText = (text: string) => setBody(text);
    const getText = () => body;
    const copyToClipboard = () => {
        let data = textAreaRef.current?.value;
        if (data) navigator.clipboard.writeText(JSON.stringify(data));
    };

    return (
        <div className="relative w-full">
            {props.copybtn && <IonButton fill='clear' onClick={copyToClipboard} className="absolute top-0 right-0 p-1 opacity-50 hover:bg-black"><IonIcon icon={copyOutline} /></IonButton>}
            <textarea
                value={body}
                id={props.id}
                ref={textAreaRef}
                spellCheck="false"
                readOnly={props.readonly}
                placeholder="Write your code here..."
                onChange={e => setBody(e.target.value)}
                className="resize-none p-2 h-40 w-full bg-black text-white text-lg" />
        </div>
    )
});

export default InputBoxComponent;

import { useHistory } from 'react-router';
import Capacitor from '../utils/Capacitor';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { getQueryParam } from '../utils/common/helper';
import { DropletValidator, IDropletSchema } from '../utils/schemas';
import InputBoxComponent, { IInputBoxCallable } from '../components/common/InputBoxComponent';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';

import { addDoc, collection } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './NewDroplet.css';

const screen = { width: 0, name: 'sm' };
const NewDroplet: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    const history = useHistory();
    const [loading, setLoading] = useState<boolean>(false);
    const [cid,] = useState(getQueryParam()['cid']);
    const [bid,] = useState(getQueryParam()['bid']);
    const [length,] = useState(getQueryParam()['length']);

    const bodyRef = React.createRef<IInputBoxCallable>();
    const titleRef = React.createRef<HTMLIonInputElement>();
    const noteRef = React.createRef<HTMLIonInputElement>();

    const breakPointTrigger = (width: number | undefined, name: string | undefined) => {
        screen.width = width as number;
        screen.name = name as string;
    };

    useEffect(() => { if (props.rendering) { props.onHideTabs(); } });
    useEffect(() => { if (!getQueryParam()['cid'] || !getQueryParam()['bid'] || !getQueryParam()['length']) return history.goBack(); }, []);

    // useEffect(() => {
    //     document.addEventListener('keyup', hotkeys, false);
    //     return () => document.removeEventListener('keyup', hotkeys, false);
    // }, []);

    // function hotkeys(e: KeyboardEvent) {
    //     if (e.key === 'Escape') { history.goBack(); }
    // };

    const onSubmitHandler = () => {
        const data: IDropletSchema = {
            body: bodyRef.current?.getText() || '',
            note: noteRef.current?.value?.toString() || '',
            title: titleRef.current?.value?.toString() || '',
            index: Math.max(0, (+length) - 1),
        };
        const result = DropletValidator.validate(data);
        if (result.error != null) Capacitor.toast(result.error?.message);
        else {
            setLoading(true);
            firebase().then(async e => {
                await addDoc(collection(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid, collections.DROPLETS), result.value);
                Capacitor.toast(`New droplet has created`);
                setLoading(false);
                history.goBack();
            });
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>New Droplet</IonTitle>
                    <IonButtons slot="start">
                        <IonButton>
                            <IonBackButton defaultHref='/' />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <Resizer onChange={breakPointTrigger} />
            <IonContent fullscreen>
                <div className='ion-padding'>
                    <h1 className="text-4xl font-bold">Create</h1>
                </div>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Title</strong></IonLabel>
                        <IonInput ref={titleRef} clearOnEdit={true} placeholder="Make a cake" />
                    </IonItem>
                    <IonItem>
                        <InputBoxComponent ref={bodyRef} text={''} id="anything" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Note</strong></IonLabel>
                        <IonInput ref={noteRef} clearOnEdit={true} placeholder="Please make sure to buy eggs" />
                    </IonItem>
                </IonList>
            </IonContent>
            <IonToolbar>
                <IonButtons slot='end'>
                    <IonSpinner hidden={!loading} />
                    <IonButton onClick={onSubmitHandler}>Ok, Create</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonPage>
    )
}

export default NewDroplet;
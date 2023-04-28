import _ from 'lodash';
import { useHistory } from 'react-router';
import Capacitor from '../utils/Capacitor';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { getQueryParam } from '../utils/common/helper';
import { DropletValidator, IDropletSchema } from '../utils/schemas';
import InputBoxComponent, { IInputBoxCallable } from '../components/common/InputBoxComponent';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';

import { doc, getDoc, updateDoc } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './EditDroplet.css';

const screen = { width: 0, name: 'sm' };
const EditDroplet: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [cid,] = useState(getQueryParam()['cid']);
    const [bid,] = useState(getQueryParam()['bid']);
    const [did,] = useState(getQueryParam()['did']);
    const [original, setOriginal] = useState<IDropletSchema>();

    const bodyRef = React.createRef<IInputBoxCallable>();
    const titleRef = React.createRef<HTMLIonInputElement>();
    const noteRef = React.createRef<HTMLIonInputElement>();

    const getDropletData = _.debounce(() => {
        setLoading(true);
        firebase().then(async e => {
            getDoc(doc(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid, collections.DROPLETS, did)).then((snap) => {
                setOriginal({ ...snap.data(), id: snap.id } as IDropletSchema);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, 0);

    useEffect(() => { if (!getQueryParam()['cid'] || !getQueryParam()['bid'] || !getQueryParam()['did']) return history.goBack(); }, []);
    useEffect(() => { if (props.rendering) { props.onHideTabs(); } });
    useEffect(() => { bodyRef.current?.setText(original?.body || '') });
    useEffect(() => { getDropletData(); }, []);

    const breakPointTrigger = (width: number | undefined, name: string | undefined) => {
        screen.width = width as number;
        screen.name = name as string;
    };

    const onSubmitHandler = () => {
        const data: IDropletSchema = {
            body: bodyRef.current?.getText() || '',
            note: noteRef.current?.value?.toString() || '',
            title: titleRef.current?.value?.toString() || '',
        };
        setOriginal(data);
        const result = DropletValidator.validate(data);
        if (result.error != null) Capacitor.toast(result.error?.message);
        else {
            setLoading(true);
            firebase().then(async e => {
                const docRef = doc(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid, collections.DROPLETS, did);
                await updateDoc(docRef, result.value);
                setLoading(false);
                history.goBack();
            });
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Update Droplet</IonTitle>
                    <IonButtons slot="start">
                        <IonButton>
                            <IonBackButton defaultHref='/' />
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonSpinner hidden={!loading} />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <Resizer onChange={breakPointTrigger} />
            <IonContent fullscreen>
                <div className='ion-padding'>
                    <h1 className="text-4xl font-bold">Update</h1>
                </div>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Title</strong></IonLabel>
                        <IonInput ref={titleRef} clearOnEdit={true} placeholder={original?.title || 'Loading...'} value={original?.title || ''} />
                    </IonItem>
                    <IonItem>
                        <InputBoxComponent ref={bodyRef} text={original?.body || ''} id="updating" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Note</strong></IonLabel>
                        <IonInput ref={noteRef} clearOnEdit={true} placeholder={original?.note || 'Loading...'} value={original?.note || ''} />
                    </IonItem>
                </IonList>
            </IonContent>
            <IonToolbar>
                <IonButtons slot='end'>
                    <IonSpinner hidden={!loading} />
                    <IonButton onClick={onSubmitHandler}>Ok, Update</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonPage>
    )
}

export default EditDroplet;
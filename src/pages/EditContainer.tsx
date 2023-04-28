import _ from 'lodash';
import { useHistory } from 'react-router';
import Capacitor from '../utils/Capacitor';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { getQueryParam } from '../utils/common/helper';
import { ContainerValidator, IContainerSchema } from '../utils/schemas';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';

import { doc, getDoc, updateDoc } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './EditContainer.css';

const screen = { width: 0, name: 'sm' };
const EditContainer: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [cid,] = useState(getQueryParam()['cid']);
    const [original, setOriginal] = useState<IContainerSchema>();

    const titleRef = React.createRef<HTMLIonInputElement>();
    const subtitleRef = React.createRef<HTMLIonInputElement>();

    const getContainerData = _.debounce(() => {
        setLoading(true);
        firebase().then(async e => {
            getDoc(doc(e.db, collections.CONTAINERS, cid)).then((snap) => {
                setOriginal({ ...snap.data(), id: snap.id } as IContainerSchema);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, 0);

    useEffect(() => { if (!getQueryParam()['cid']) return history.goBack(); }, []);
    useEffect(() => { if (props.rendering) { props.onHideTabs(); } });
    useEffect(() => { getContainerData(); }, []);

    const breakPointTrigger = (width: number | undefined, name: string | undefined) => {
        screen.width = width as number;
        screen.name = name as string;
    };

    const onSubmitHandler = () => {
        const data: IContainerSchema = {
            title: titleRef.current?.value?.toString() || '',
            subtitle: subtitleRef.current?.value?.toString() || '',
        };
        setOriginal(data);
        const result = ContainerValidator.validate(data);
        if (result.error != null) Capacitor.toast(result.error?.message);
        else {
            setLoading(true);
            firebase().then(async e => {
                const docRef = doc(e.db, collections.CONTAINERS, cid);
                await updateDoc(docRef, result.value);
                Capacitor.toast(`Document updated with id ${cid}`);
                setLoading(false);
                history.goBack();
            });
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Update Container</IonTitle>
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
                        <IonLabel position="stacked"><strong>Subtitle</strong></IonLabel>
                        <IonInput ref={subtitleRef} clearOnEdit={true} placeholder={original?.subtitle || 'Loading...'} value={original?.subtitle || ''} />
                    </IonItem>
                </IonList>
            </IonContent>
            <IonToolbar>
                <IonButtons slot='end'>
                    <IonButton onClick={onSubmitHandler}>Ok, Update</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonPage>
    )
}

export default EditContainer;
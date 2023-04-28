import { useHistory } from 'react-router';
import Capacitor from '../utils/Capacitor';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { ContainerValidator, IContainerSchema } from '../utils/schemas';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';

import { addDoc, collection } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './NewContainer.css';

const screen = { width: 0, name: 'sm' };
const NewContainer: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    const history = useHistory();
    const [loading, setLoading] = useState<boolean>(false);

    const titleRef = React.createRef<HTMLIonInputElement>();
    const subtitleRef = React.createRef<HTMLIonInputElement>();

    const breakPointTrigger = (width: number | undefined, name: string | undefined) => {
        screen.width = width as number;
        screen.name = name as string;
    };

    useEffect(() => { if (props.rendering) { props.onHideTabs(); } });

    const onSubmitHandler = () => {
        const data: IContainerSchema = {
            title: titleRef.current?.value?.toString() || '',
            subtitle: subtitleRef.current?.value?.toString() || '',
        };
        const result = ContainerValidator.validate(data);
        if (result.error != null) Capacitor.toast(result.error?.message);
        else {
            setLoading(true);
            firebase().then(async e => {
                const response = await addDoc(collection(e.db, collections.CONTAINERS), result.value);
                Capacitor.toast(`New document created with id ${response?.id}`);
                setLoading(false);
                history.goBack();
            });
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>New Container</IonTitle>
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
                        <IonInput ref={titleRef} clearOnEdit={true} placeholder="Team A" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Subtitle</strong></IonLabel>
                        <IonInput ref={subtitleRef} clearOnEdit={true} placeholder="Team dedicated for design work for the company" />
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

export default NewContainer;
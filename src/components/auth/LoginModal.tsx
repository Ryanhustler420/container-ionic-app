import { useRef } from 'react';
import {
    IonButtons,
    IonButton,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonPage,
    IonItem,
    IonInput,
    IonLabel,
} from '@ionic/react';

const LoginModal = ({ onDismiss }: { onDismiss: (data?: { email: string, password: string } | null) => void; }) => {
    const emailRef = useRef<HTMLIonInputElement>(null);
    const passwordRef = useRef<HTMLIonInputElement>(null);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color="medium" onClick={() => onDismiss(null)}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Auth</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onDismiss({
                            email: emailRef.current!.value!.toString(),
                            password: passwordRef.current!.value!.toString()
                        })} strong={true}>
                            Login
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked"><strong>Email</strong></IonLabel>
                    <IonInput ref={emailRef} clearOnEdit={true} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked"><strong>Password</strong></IonLabel>
                    <IonInput ref={passwordRef} type='password' clearOnEdit={true} />
                </IonItem>
            </IonContent>
        </IonPage>
    );
};

export default LoginModal;
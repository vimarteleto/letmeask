import {createContext, ReactNode, useEffect, useState} from "react";
import {auth, firebase} from "../services/firebase";
import {useHistory} from "react-router-dom";

type User = {
    id: string,
    name: string,
    avatar: string
}

type AuthContextType = {
    user: User | undefined,
    signInWithGoogle: () => Promise<void>
}

type AuthContextProviderProps = {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthContextProvider(props: AuthContextProviderProps) {

    const [user, setUser] = useState<User>()
    const history = useHistory()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const {displayName, photoURL, uid} = user

                if (!displayName || !photoURL) {
                    throw new Error('Missing information from Google account')
                }

                setUser({
                    id: uid,
                    name: displayName,
                    avatar: photoURL
                })
            }
        })

        return () => {
            unsubscribe()
        }
    }, [])

    async function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider()

        const result = await auth.signInWithPopup(provider)

        if (result.user) {
            const {displayName, photoURL, uid} = result.user

            if (!displayName || !photoURL) {
                throw new Error('Missing information from Google account')
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL
            })
        }

    }

    //TODO
    // async function signOut() {
    //     await auth.signOut()
    //     setUser({} as User)
    //     history.push('/')
    // }

    return (
        <AuthContext.Provider value={ {user, signInWithGoogle} }>
            {props.children}
        </AuthContext.Provider>
    )
}
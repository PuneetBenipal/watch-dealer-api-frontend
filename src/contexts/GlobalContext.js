import React, { createContext, useState } from 'react';

export const GlobalContext = createContext({});

const initialize = {
    company: null,
}

export const GlobalContextProvider = ({ children }) => {
    const [state, setState] = useState(initialize);

    const update = (newState) => {
        setState(prevState => ({ ...prevState, ...newState }));
    }

    return (
        <GlobalContext.Provider value={{ state, setState, update }}>
            {children}
        </GlobalContext.Provider>
    )
}

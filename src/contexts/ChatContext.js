import React, { useState, createContext } from "react"

const ChatContext = createContext({});


const ChatProvider = ({ children }) => {
    return (
        <ChatContext.Provider value={{  }}>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatProvider;
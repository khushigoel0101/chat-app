import { createContext } from "react";
import { AuthContext } from "./AuthContext";
import { useState, useContext } from "react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";



export const ChatContext = createContext();

   const [messages, setMessages] = useState([]);
   const [user, setUser] = useState([]);
   const [selectedUser, setSelectedUser] = useState(null);
   const [unseenMessages, setUnseenMessages] = useState({});

   const {socket, axios} = useContext(AuthContext)

   //function to get all users for sidebar
   const getUsers = async () => {
    try {
        await axios.get("/api/messages/users")
        if(data.success) {
            setUser(data.users)
            setUnseenMessages(data.unseenMessages)
        }
    } catch (error) {
        toast.error(error.message)
    }
   }

   //function to get messages for selected user
   const getMessages = async (userId)=> {
    try {
       const {data} = await axios.get(`/api/messages/${userId}`)
       if (data.success) {
        setMessages(data.messages)
       }
    } catch (error) {
        toast.error(error.message)
    }
   }
    
   //function to send message to selected user
   const sendMessage = async (messageData)=> {
     try {
        const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
        if (data.success) {
            setMessages((prevMessages) => [...prevMessages, data.newMessage])
        }else {
            toast.error(data.message)
        }

     } catch (error) {
        toast.error(error.message)
     }
   }

   //function to subscribe to message for selected user
   const subscribeToMessages = async () => {
     if(!socket) return;
        
     socket.on("newMessage", (newMessage)=> {
        if(selectedUser && newMessage.senderId === selectedUser._id) {
            newMessage.seen = true;
            setMessages((prevMessages)=> [...prevMessages, newMessage])
            axios.put(`/api/messsages/mark/${newMessage._id}`)
        } else {
            setUnseenMessages((prevUnseenMessages)=>( {
               ...prevUnseenMessages, [newMessage.senderId] : 
               prevUnseenMessages [newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
            }))
        }
     })
   }


   //func to unsubscribe message
   const unsubscribeFromMessages =()=> {
    if(socket) socket.off("newMessage")
   }

   useEffect(()=>{
    subscribeToMessages();
    return()=> unsubscribeFromMessages();
   },[socket, selectedUser])

    const value = {
       messages, user, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }

export const ChatProvider = ({ children }) => {
    return (
        <ChatContext.Provider value={value}>
        {children}
        </ChatContext.Provider>
    )
}
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import classes from "./HomePage.module.css";
import io from "socket.io-client";
import { addDataToStorage } from "../../Handle Storage/saveUsersToStorage";

export default function HomePage() {
  const userName = useParams().username;
  const itemName = "users";
  let connectionOptions = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  //useStates
  const [inputMessage, setinputMessage] = useState("");
  const [yourID, setYourID] = useState();
  const [messages, setMessages] = useState([]);
  const [connectedUserInfo, setconnectedUserInfo] = useState([]);
  const [totalConnectedUsers, settotalConnectedUsers] = useState([]);

  let totalUsers = window.localStorage.getItem(itemName);
  if (totalUsers !== null || totalUsers !== "") {
    //settotalConnectedUsers();
    totalUsers = JSON.parse(totalUsers);
    //console.log(JSON.parse(totalUsers));
  }

  //console.log(totalUsers);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:8000", connectionOptions);

    socketRef.current.on("set_id", (data) => {
      setYourID(data.id);
    });

    let newUserData = {
      message: `${userName} connected`,
      time: getCurrentTime(),
      name: userName,
      id: yourID,
      isOnline: true,
    };

    socketRef.current.emit("new-user", newUserData);

    socketRef.current.on("user-connected", (userData) => {
      setconnectedUserInfo((oldData) => [...oldData, userData]);
    });
    socketRef.current.on("user-count", (array) => {
      settotalConnectedUsers([]);
      settotalConnectedUsers(array);
    });

    socketRef.current.on("message", (message) => {
      receivedMessage(message);
    });
    socketRef.current.on("user-disconnected", (array) => {
      settotalConnectedUsers(array);
    });
  }, []);

  function receivedMessage(message) {
    setMessages((oldMsgs) => [...oldMsgs, message]);
  }

  let getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  function sendMessage(e) {
    e.preventDefault();
    const messageObject = {
      message: inputMessage,
      id: yourID,
      name: userName,
      time: getCurrentTime(),
    };
    setinputMessage("");
    socketRef.current.emit("send_message", messageObject);
  }

  return (
    <div className={classes.homePageWrapper}>
      <h1 className={classes.heading}>Welcome {userName}</h1>
      <div className={classes.chatScreenWrapper}>
        <div className={classes.chatLeftDivWrapper}>
          <h3>Current users</h3>
          <ul className={classes.userListWrapper}>
            {/* {connectedUserInfo.length > 0 &&
              connectedUserInfo[connectedUserInfo.length - 1].usersList.map(
                (item, pos) => {
                  const { name } = item;
                  return <li key={pos}>{name}</li>;
                }
              )} */}
            {totalConnectedUsers.length > 0 &&
              totalConnectedUsers.map((item, pos) => {
                const { name } = item;
                return <li key={pos}>{name}</li>;
              })}
          </ul>
        </div>
        <div className={classes.verticleLine}></div>
        <div className={classes.chatrightDivWrapper}>
          <div className={classes.messageDivWrapper}>
            {connectedUserInfo &&
              connectedUserInfo.map((item, pos) => {
                const { id } = item.data;
                let isIdMatched = false;
                if (id === yourID) isIdMatched = true;
                return (
                  <CreateConnectedUsers
                    key={pos}
                    data={item.data}
                    idMatched={isIdMatched}
                  />
                );
              })}
            {messages.map((item, pos) => {
              const { id } = item;
              let isIdMatched = false;
              if (id === yourID) isIdMatched = true;
              return (
                <CreateMessageBox
                  key={pos}
                  data={item}
                  idMatched={isIdMatched}
                />
              );
            })}
          </div>
          <div className={classes.messageEditorDiv}>
            <input
              value={inputMessage}
              onChange={(e) => setinputMessage(e.target.value)}
              type="text"
            />
            <button
              onClick={(e) => {
                sendMessage(e);
              }}
            >
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CreateMessageBox = (props) => {
  const { name, message, time, id } = props.data;
  let isIdMatched = props.idMatched;
  return (
    <div className={classes.messageBox}>
      <p>{time}</p>
      <h4>{isIdMatched ? `You: ${message}` : `${name}: ${message}`}</h4>
    </div>
  );
};
const CreateConnectedUsers = (props) => {
  const { name, message, time, id } = props.data;
  let isIdMatched = props.idMatched;
  return (
    <div className={classes.conneceduserInfoBox}>
      <p>{time}</p>
      <h4>{isIdMatched ? `Welcome ${name}` : `${name} Joined`}</h4>
    </div>
  );
};

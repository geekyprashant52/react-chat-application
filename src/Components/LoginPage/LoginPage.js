import React, { useState } from "react";
import classes from "./LoginPage.module.css";
import { useHistory } from "react-router-dom";

export default function LoginPage() {
  const [inputText, setinputText] = useState("");
  const [isError, setisError] = useState(false);
  const history = useHistory();

  const handleSubmit = (input) => {
    if (input.toString().trim().length > 3) {
      setisError(false);
      history.push(`/join/${input}`);
    } else {
      setisError(true);
    }
  };

  return (
    <div className={classes.LoginPageWrapper}>
      <h1>Join to chat app</h1>
      <div className={classes.loginFormWrapper}>
        <p>Username</p>
        <div className={classes.loginFormInputsWrapper}>
          <input
            value={inputText}
            onChange={(e) => setinputText(e.target.value)}
            type="text"
            placeholder="Enter username"
          />
          <button
            onClick={() => {
              handleSubmit(inputText);
            }}
          >
            Join
          </button>
        </div>

        {isError ? (
          <div className={classes.loginPageErrorWrapper}>
            <p>Please enter valid username</p>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

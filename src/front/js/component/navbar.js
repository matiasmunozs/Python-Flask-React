import React from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import { useContext } from "react";
import { useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const navigate =useNavigate()
  useEffect(() => {

  }, [])

  useEffect(() => {
      if(store.currentUser !== null) navigate('/');
  }, [store])
 
  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link to="/">
          <span className="navbar-brand mb-0 h1">
            Authentication system with Python Flask and React.js
          </span>
        </Link>
        <div className="ml-auto">
          

        {!!store.currentUser ? "":
            <Link to="/signup">
              <button className="btn btn-primary me-1 ">Signup</button>
            </Link>
}

{!!store.currentUser ?
            <button
            onClick={() => actions.handleLogout()}
            className="btn btn-primary">
              Log out
            </button>
         :
            <Link to="/login">
              <button className="btn btn-primary">Log in</button>
            </Link>
}

          {!!store.currentUser ?
            <Link to="/private">
              <button  className="btn btn-primary ms-1 ">
                This is Private
              </button>
           </Link>:""
}
          
        </div>
      </div>
    </nav>
  );
};

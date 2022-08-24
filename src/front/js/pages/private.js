import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Private = () => {

	const { store, actions } = useContext(Context);
	const navigate = useNavigate()
  
	useEffect(() => {
        if (store.currentUser === null) navigate('/');
    }, [store])

	return (
		<div >
			<h1>Welcome to the private link</h1>
			<p>Please don't <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">click here</a> ... You will be out of this website if you do so...</p>
			 		

		
		</div>
	);
};

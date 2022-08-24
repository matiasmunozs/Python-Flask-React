
const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			apiURl: 'https://3001-4geeksacade-reactflaskh-r85vmbfy07y.ws-us62.gitpod.io',
            email: '',
            password: '',
			name: '',
            errors: null,
            currentUser: null,
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			]
		},
		actions: {
			// Use getActions to call a function within a fuction

            handleChange: e => {
                const { name, value } = e.target;
                setStore({
                    [name]: value
                })
            },
            handleLogin: async (e,navigate) => {
                e.preventDefault();
                const { apiURl, email, password } = getStore();
                const fields = {
                    email: email,
                    password: password
                }
                const response = await fetch(`${apiURl}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fields)
                });

                const data  = await response.json();

                console.log(data);

                if (response.status !== 200 ) {
                    alert('Login failed');
                }

                if (response.status === 200 ) {
					alert("Login successful");
			
                    sessionStorage.setItem('currentUser', data.access_token);
                    setStore({
                        currentUser: data,
                        email: '',
                        password: '',
                    })
					navigate('/')
                } 

            },

			handleRegister: async (e,navigate) => {
                e.preventDefault();
                const { apiURl, email, password } = getStore();
                const fields = {
                    email: email,
                    password: password
                }
                const response = await fetch(`${apiURl}/api/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fields)
                });

                const data  = await response.json();

                console.log(data);

                if (response.status !== 201) {
                    alert('user already exist');
                }

                if (response.status === 201) {
					alert("User created sucessfully");
			
                    sessionStorage.setItem('currentUser', data.access_token);
                    setStore({
                        currentUser: data,
                        password: '',
                    })	
				navigate('/')
                } 

            },

            checkAuthentication: () => {
                if (sessionStorage.getItem('currentUser')) {
                    setStore({
                        currentUser: sessionStorage.getItem('currentUser')
                    })
                }
            },



            handleLogout: () => {
                if (sessionStorage.getItem('currentUser')) {
                    sessionStorage.removeItem('currentUser');
                    setStore({
                        email: '',
                        password: '',
                        currentUser: null,
                    })
                    getActions().checkAuthentication();
                }
            },


			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;

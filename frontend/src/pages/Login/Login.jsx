import React from "react";
import style from "./Login.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { NotificationContext } from "../../context/NotificationControls/NotificationControls";
import { AuthenticationContext } from "../../context/AuthenticationContext/AuthenticationContext";
import { api } from "../../utils/api";
import CustomButton from "../../components/CustomButton/CustomButton";

export default function Login() {
	const [addNotification] = useContext(NotificationContext);
	const { dispatchAuthentication } = useContext(AuthenticationContext);
	const navigate = useNavigate();
	const [userTag, setUsertag] = useState("");
	const [password, setPassword] = useState("");
	const [rememberPassword, setRememberPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const user = { userTag, password, rememberPassword };
		try {
			const { status } = await api.login(user);
			if (status === 400) {
				addNotification({ type: "error", message: "Wrong password", title: "Login failed", duration: 5000 });
			} else if (status === 404) {
				addNotification({ type: "error", message: "User not found", title: "Login failed", duration: 5000 });
			} else if (status === 200) {
				const { status, data } = await api.getAuthUserInfo();
				if (status !== 200) return;

				dispatchAuthentication({ type: "login", user: data, rememberPassword });
				addNotification({ type: "success", message: "Login successful", title: "Login successful", duration: 2000 });
				navigate(`/user/${userTag}`);
			}
		} catch (error) {
			addNotification({ type: "error", message: "Internal server error", title: "Network problems", duration: 5000 });
		}

		setUsertag("");
		setPassword("");
	};

	return (
		<div className={style["main-content"]}>
			<h1 className={style["title"]}>Login</h1>
			<form className={style["login-form"]} onSubmit={handleSubmit}>
				<label htmlFor="usertag">Usertag:</label>
				<input type="text" id="usertag" value={userTag} name="usertag" placeholder="Usertag" onChange={(e) => setUsertag(e.target.value)} />
				<label htmlFor="password">Password:</label>
				<input
					type="password"
					id="password"
					value={password}
					name="password"
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
				/>
				<label htmlFor="remember-me">Remember me:</label>
				<input
					type="checkbox"
					id="remember-me"
					name="remember-me"
					checked={rememberPassword}
					onChange={(e) => setRememberPassword(e.target.checked)}
				/>
				<CustomButton type="submit" defaultValue="login">
					Login
				</CustomButton>
			</form>
			<div className={style["register-login-container"]}>
				<label htmlFor="register">New user? Register here:</label>
				<CustomButton className={style["register-button"]} to="/register">
					Register
				</CustomButton>
			</div>
		</div>
	);
}

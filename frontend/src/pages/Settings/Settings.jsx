import { useState, useEffect, useContext } from "react";
import style from "./Settings.module.scss";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationControls/NotificationControls";
import { AuthenticationContext } from "../../context/AuthenticationContext/AuthenticationContext";
import { api } from "../../utils/api";
import CustomButton from "../../components/CustomButton/CustomButton";
import { ImageUploaderContext } from "../../components/ImageUploader/ImageUploader";
import UserPicture from "../../components/UserPicture/UserPicture";

export default function Settings() {
	const { imageUploader } = useContext(ImageUploaderContext);
	const [addNotification] = useContext(NotificationContext);
	const { authentication, dispatchAuthentication } = useContext(AuthenticationContext);
	const [username, setUsername] = useState("");
	const [userTag, setUserTag] = useState("");
	const [bio, setBio] = useState("");
	const [profilePicture, setProfilePicture] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		if (!authentication.user) return;

		setUsername(authentication.user.username);
		setUserTag(authentication.user.userTag);
		setBio(authentication.user.bio);
		setProfilePicture(authentication.user.profilePicture);
	}, [authentication]);

	const callback = async () => {
		let userData = { username, userTag, bio, profilePicture };

		if (username.length < 3 || username.length > 20)
			return addNotification({
				type: "error",
				message: "Username must be between 3 and 20 characters",
				title: "Invalid username",
				duration: 5000,
			});

		if (userTag.length < 3 || userTag.length > 20)
			return addNotification({
				type: "error",
				message: "UserTag must be between 3 and 20 characters",
				title: "Invalid userTag",
				duration: 5000,
			});

		if (bio.length > 200)
			return addNotification({ type: "error", message: "Bio must be less than 200 characters", title: "Invalid bio", duration: 5000 });

		if (!bio) {
			userData.bio = "";
		}

		const { status } = await api.updateAuthUser(userData);

		if (status === 403) {
			dispatchAuthentication({ type: "callback", callback });
			navigate("/authentication");
			return;
		}

		if (status === 409) {
			addNotification({ type: "error", message: "UserTag already taken", title: "Invalid userTag", duration: 5000 });
			navigate("/settings");
			return;
		}

		if (status !== 200) return;
		addNotification({ type: "success", message: "Settings updated succesfully", title: "Authentication successful", duration: 2000 });

		const { status: status2, data } = await api.getAuthUserInfo();
		if (status2 !== 200)
			return addNotification({ type: "error", message: "Failed to get user info", title: "Failed to get user info", duration: 5000 });

		dispatchAuthentication({ type: "update", user: data });
		navigate(`/user/${userTag}`);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		callback();
	};

	return (
		<div>
			<h1>Settings</h1>
			<form className={style["header-edit-form"]} onSubmit={handleSubmit}>
				<CustomButton
					purpose="action"
					type="button"
					className={style["change-profile-picture-button"]}
					onClick={() => {
						imageUploader((url) => setProfilePicture(url));
					}}
				>
					<UserPicture src={authentication.user.profilePicture} /> Change profile picture
				</CustomButton>
				<br />
				<label>
					Username
					<input type="text" name="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
				</label>
				<br />
				<label>
					User Tag
					<input type="text" name="userTag" placeholder="UserTag" value={userTag} onChange={(e) => setUserTag(e.target.value)} />
				</label>

				<br />
				<label>
					Bio
					<textarea name="bio" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
				</label>
				<br />
				<CustomButton className={style["save-button"]} type="submit">
					Save Changes
				</CustomButton>
			</form>
		</div>
	);
}

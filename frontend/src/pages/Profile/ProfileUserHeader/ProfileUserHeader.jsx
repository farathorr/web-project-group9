import React from "react";
import style from "./ProfileUserHeader.module.scss";
import { useState, useEffect, useContext } from "react";
import { AuthenticationContext } from "../../../context/AuthenticationContext/AuthenticationContext";
import { NotificationContext } from "../../../context/NotificationControls/NotificationControls";
import { api } from "../../../utils/api";
import UserProfileData from "../UserProfileData/UserProfileData";
import UserPicture from "../../../components/UserPicture/UserPicture";
import CustomButton from "../../../components/CustomButton/CustomButton";
import EditIcon from "../../../svg/EditIcon";
import FriendButton from "../../../svg/FriendButton";
import RemoveFriend from "../../../svg/RemoveFriend";

export default function ProfileUserHeader({ userData, showLikedPosts, showPosts, showComments }) {
	const [isFollowing, setIsFollowing] = useState(false);
	const [followers, setFollowers] = useState(userData?.followerIds);
	const [followButtonText, setFollowButtonText] = useState("Follow");
	const [isFriend, setIsFriend] = useState(false);
	const [friendButtonText, setFriendButtonText] = useState("Add as friend");
	const [isButtonVisible, setIsButtonVisible] = useState(false);
	const { authentication, updateAuthentication } = useContext(AuthenticationContext);
	const [addNotification] = useContext(NotificationContext);
	const [user, setUser] = useState({});

	const fetchData = async () => {
		if (!userData?._id) return;

		try {
			const { data, status } = await api.getUserById(userData?._id);
			if (status !== 200) return;
			setFollowers(data.followerIds.length);
		} catch (err) {
			console.log(err);
		}
		try {
			const currentUser = authentication.user;
			if (!currentUser?._id) return;
			const { data, status } = await api.getUserById(currentUser._id);
			if (status !== 200) return;
			setUser(data);
			const isAlreadyFollowed = data.followedIds?.some((id) => id === userData?._id);
			setIsFollowing(isAlreadyFollowed);
			// update the follow button text
			if (isAlreadyFollowed) setFollowButtonText("Unfollow");
			else setFollowButtonText("Follow");

			const isAlreadyFriend = data.friendList?.some((id) => id === userData?._id);
			setIsFriend(isAlreadyFriend);

			if (isAlreadyFriend) setFriendButtonText("Remove friend");
			else setFriendButtonText("Add as friend");
		} catch (err) {
			console.log(err);
		}
	};

	const checkAuthentication = (operationType) => {
		if (authentication.isAuthenticated) {
			return true;
		} else {
			addNotification({
				type: "error",
				message: "You must be logged in to " + operationType.toLowerCase() + " users",
				title: operationType + " failed",
				duration: 5000,
			});
			return false;
		}
	};

	const checkIfOwnProfile = (operationType) => {
		if (user.userTag === userData?.userTag) {
			addNotification({
				type: "error",
				message: "You can't " + operationType.toLowerCase() + " yourself",
				title: operationType + " failed",
				duration: 5000,
			});
			return true;
		}
		return false;
	};

	const handleFollow = async () => {
		// check if the user is logged in and if the user is trying to follow himself
		if (!checkAuthentication("Follow") || checkIfOwnProfile("Follow")) return;

		console.log(user);
		// follow/unfollow the user
		try {
			const action = isFollowing ? api.unfollowUser : api.followUser;
			const { data } = await action(userData?.userTag);
			console.log(data);
			setFollowers(data.followerIds.length);
			setIsFollowing(!isFollowing);
			updateAuthentication();
		} catch (err) {
			console.log(err);
		}
	};

	const handleFriend = async () => {
		if (!checkAuthentication("Friend") || checkIfOwnProfile("Friend")) return;

		try {
			const action = isFriend ? api.removeFriend : api.addFriend;
			await action(userData?.userTag);
			setFriendButtonText(`${!isFriend ? "Remove" : "Add as"} friend`);
			setIsFriend(!isFriend);
			updateAuthentication();
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (!userData?.username) return;
		setIsButtonVisible(authentication?.user?.userTag !== userData?.userTag);

		fetchData();
	}, [authentication.user, userData?.followerIds?.length, isFollowing]);

	if (!userData) return null;

	return (
		<div className={style["profile-container"]}>
			<div className={style["right-content"]}>
				<UserPicture src={userData?.profilePicture} size={"big"} />
				<div className={style["buttons"]}>
					{isButtonVisible && (
						<CustomButton className={style["follow-button"]} onClick={handleFollow}>
							{followButtonText}
						</CustomButton>
					)}
					{isButtonVisible && (
						<CustomButton className={style["add-to-friend"]} onClick={handleFriend}>
							{isFriend ? <RemoveFriend className={style["edit-svg"]} /> : <FriendButton className={style["edit-svg"]} />}
						</CustomButton>
					)}
					{!isButtonVisible && (
						<CustomButton to="/settings">
							<EditIcon className={style["edit-svg"]} /> Edit
						</CustomButton>
					)}
				</div>
			</div>
			<div className={style["left-content"]}>
				<UserProfileData userData={userData} followers={followers} />
				<div className={style["filter-buttons"]}>
					<FilterButton onClick={showPosts} defaultChecked={true}>
						Feed
					</FilterButton>
					<FilterButton onClick={showLikedPosts}>Likes</FilterButton>
					<FilterButton onClick={showComments}>Replies</FilterButton>
				</div>
			</div>
		</div>
	);
}

const FilterButton = ({ children, onClick, ...props }) => {
	return (
		<label className={style["filter-button"]}>
			<input type="radio" name="filtering" {...props} />
			<div className={style["button-content"]} onClick={onClick}>
				{children}
			</div>
		</label>
	);
};

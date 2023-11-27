import React from "react";
import style from "./Profile.module.scss";
import PostComponent from "../PostComponent/PostComponent";
import ProfileUserHeader from "./ProfileUserHeader/ProfileUserHeader";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Profile() {
	const params = useParams();
	const [profileData, setProfileData] = useState(null);
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const fetchServices = async () => {
			try {
				const { data: profileData } = await axios.get(`http://localhost:4000/users/userTag/${params.usertag}`);
				if (profileData) setProfileData(profileData);
				const { data: posts } = await axios.get(`http://localhost:4000/posts/author/${params.usertag}`);
				if (posts) setPosts(posts);
			} catch (err) {
				console.log(err);
			}
		};

		fetchServices();
	}, []);

	return (
		<div className={style["profile-page"]}>
			<ProfileUserHeader
				username={profileData?.username}
				userTag={profileData?.userTag}
				userId = {profileData?._id}
				bio={profileData?.bio}
				followers={profileData?.followerIds}
				following={profileData?.followedIds.length}
				joinDate={formatDate(profileData?.updatedAt)}
			/>
			{posts.map((post) => (
				<PostComponent
					key={post._id}
					postId={post._id}
					username={profileData?.username}
					userTag={profileData?.userTag}
					text={post.postText}
					date={post.createdAt}
					comments={post.comments.length}
					likes={post.likes.length}
					dislikes={post.dislikes.length}
					onRemove={setPosts}
				/>
			))}
		</div>
	);
}

function formatDate(utcTime) {
	if (!utcTime) return utcTime;

	const options = { year: "numeric", month: "long", day: "numeric" };
	const time = new Date(utcTime);
	return time.toLocaleDateString("en-US", options);
}

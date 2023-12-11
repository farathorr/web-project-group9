import style from "./Feed.module.scss";
import { useState, useContext, useEffect } from "react";
import PostComponent from "../PostComponent/PostComponent";
import { AuthenticationContext } from "../AuthenticationControls/AuthenticationControls";
import PostSearch from "../PostSearch/PostSearch";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api";
import PostForm from "../PostForm/PostForm";

export default function Feed() {
	const { authentication } = useContext(AuthenticationContext);
	const [searchParams] = useSearchParams();
	const [posts, setPosts] = useState([]);
	const [updatePostContent, setUpdatePostContent] = useState(false);

	useEffect(() => {
		async function fetchPosts() {
			try {
				const { data } = await api.getUserFeedPosts();
				setPosts(data);
			} catch (err) {}
		}

		fetchPosts();
	}, [searchParams, updatePostContent, authentication]);

	return (
		<>
			<PostSearch />
			<h1 className={style["title"]}>Feed</h1>
			<section className={style["main-content"]}>
				<PostForm title="New post" updateInterface={setUpdatePostContent} type="post" />
				<div className={style["feed-posts"]}>
					{posts.map((post) => (
						<NestPosts key={post._id} post={post} onUpdate={setPosts} />
					))}
				</div>
			</section>
		</>
	);
}

const NestPosts = ({ post, onUpdate }) => {
	if (!post.originalPostParentId) {
		return <PostComponent post={post} onUpdate={onUpdate} />;
	}

	if (post.originalPostParentId._id == post.replyParentId._id) {
		return (
			<PostComponent post={post.originalPostParentId} onUpdate={onUpdate} children={<PostComponent post={post} onUpdate={onUpdate} />} />
		);
	}

	return (
		<PostComponent
			post={post.originalPostParentId}
			onUpdate={onUpdate}
			children={
				<PostComponent post={post.replyParentId} onUpdate={onUpdate} children={<PostComponent post={post} onUpdate={onUpdate} />} />
			}
		/>
	);
};

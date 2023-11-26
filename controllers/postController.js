const mongoose = require("mongoose");
const Post = require("../models/posts");
const User = require("../models/users");

// get all posts
const getPosts = async (req, res) => {
	try {
		const posts = await Post.find();
		res.json(posts);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// get post by id
const getPostById = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send(`No post with id: ${id}`);
	}
	const post = await Post.findById(id).populate("comments");
	console.log(post);
	res.status(200).json(post);
};

//get posts by userTag
const getPostsByAuthor = async (req, res) => {
	const { userTag } = req.params;
	try {
		const user = await User.findOne({ userTag: userTag });
		if (!user) return res.status(400).json({ message: "User does not exist." });
		const posts = await Post.find({ userId: user._id }).populate("comments");
		res.json(posts);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// create post
const createPost = async (req, res) => {
	const { userTag: postAuthor, ...post } = req.body;
	const newPost = new Post(req.body);
	if (!postAuthor) {
		return res.status(400).json({ message: "UserTag is required." });
	}
	if (!post.postText) {
		return res.status(400).json({ message: "Post text is required." });
	}
	try {
		const user = await User.findOne({ userTag: postAuthor });
		if (!user) return res.status(400).json({ message: "User does not exist." });
		try {
			newPost.populate("user");
			await newPost.save();
			res.status(201).json(newPost);
		} catch (error) {
			res.status(409).json({ message: error.message });
		}
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const updatePost = async (req, res) => {
	const { id } = req.params;
	const { userTag: postAuthor, ...post } = req.body;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send(`No post with id: ${id}`);
	}
	try {
		const user = await User.findOne({ userTag: postAuthor });
		if (!user) return res.status(400).json({ message: "User does not exist." });
		const updatedPost = await Post.findByIdAndUpdate(id, { ...post, userId: user._id, userTag: postAuthor }, { new: true });
		res.json(updatedPost);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const deletePost = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send(`No post with id: ${id}`);
	}
	try {
		await Post.findByIdAndRemove(id);
		res.json({ message: "Post deleted successfully." });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const likePost = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send(`No post with id: ${id}`);
	}
	try {
		const post = await Post.findById(id);
		const updatedPost = await Post.findByIdAndUpdate(id, { likes: ++post.likes }, { new: true });
		res.json(updatedPost);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const dislikePost = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send(`No post with id: ${id}`);
	}
	try {
		const post = await Post.findById(id);
		const updatedPost = await Post.findByIdAndUpdate(id, { likes: --post.likes }, { new: true });
		res.json(updatedPost);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const replyToPost = async (req, res) => {
	const { id } = req.params;
	const { userTag: replyAuthor, ...post } = req.body;
	const newPost = new Post(req.body);
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send(`No post with id: ${id}`);
	}
	try {
		const user = await User.findOne({ userTag: replyAuthor });
		if (!user) return res.status(400).json({ message: "User does not exist." });
		const post = await Post.findById(id);
		console.log(post);
		console.log(newPost._id);
		post.comments.push(newPost);
		if (!post.originalPostParentId) {
			newPost.originalPostParentId = id;
		} else {
			newPost.originalPostParentId = post.originalPostParentId;
		}
		newPost.replyParentId = id;
		await post.save();
		post.populate("comments");
		try {
			await newPost.save();
		} catch (error) {
			return res.status(409).json({ message: error.message });
		}

		return res.json(post);
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const getComments = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send(`No post with id: ${id}`);
	}
	try {
		const post = await Post.findById(id);
		res.json(post.comments);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

module.exports = {
	getPosts,
	getPostById,
	getPostsByAuthor,
	createPost,
	updatePost,
	deletePost,
	likePost,
	dislikePost,
	replyToPost,
	getComments,
};

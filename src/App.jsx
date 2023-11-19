import { BrowserRouter, Routes, Route } from "react-router-dom";
import HeaderNav from "./components/HeaderNav/HeaderNav";
import Chat from "./components/Chat/Chat";
import Feed from "./components/Feed/Feed";
import Profile from "./components/Profile/Profile";
import Post from "./components/Post/Post";

import "./App.scss";

function App() {
	return (
		<BrowserRouter>
			<HeaderNav />
			<Routes>
				<Route path="/" element={<div>Home</div>} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/feed" element={<Feed />} />
				<Route path="/login" element={<div>login</div>} />
				<Route path="/register" element={<div>register</div>} />
				<Route path="/post" element={<Post />} />
				<Route path="/chat" element={<Chat />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
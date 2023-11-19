import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./components/Chat/Chat";
import Feed from "./components/Feed/Feed";

import "./App.scss";

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<div>Home</div>} />
					<Route path="/profile" element={<div>profile</div>} />
					<Route path="/feed" element={<Feed />} />
					<Route path="/login" element={<div>login</div>} />
					<Route path="/register" element={<div>register</div>} />
					<Route path="/post" element={<div>post</div>} />
					<Route path="/chat" element={<Chat />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
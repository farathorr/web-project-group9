import { useContext, useEffect, useRef, useState } from "react";
import style from "./ChatField.module.scss";
import { api } from "../../../utils/api";
import { ChatContext } from "../Chat";
import { ImageUploaderContext } from "../../../components/ImageUploader/ImageUploader";

export default function ChatField({ groupId }) {
	const { imageUploader } = useContext(ImageUploaderContext);
	const { addNewMessage } = useContext(ChatContext);
	const [fieldText, setFieldText] = useState("");
	const textArea = useRef(null);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!fieldText || !groupId) return;
		try {
			const { data, status } = await api.sendMessage({ groupId, text: fieldText });
			setFieldText("");
			if (status === 201) addNewMessage(data);
		} catch (err) {}
	};

	useEffect(() => {
		if (fieldText.length === 0) sizeTextArea();
	}, [fieldText]);

	const sizeTextArea = () => {
		if (!textArea.current) return;
		textArea.current.style.height = "";
		textArea.current.style.height = textArea.current.scrollHeight + "px";
	};

	return (
		<div className={style["chat-footer"]}>
			<form className={style["chat-input"]} onSubmit={handleSubmit}>
				<textarea
					className={style["text-field"]}
					autoComplete="off"
					autoCorrect="off"
					spellCheck="false"
					autoCapitalize="off"
					name="message"
					placeholder="Type a message..."
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit(e);
						}
					}}
					ref={textArea}
					onChange={(e) => {
						setFieldText(e.target.value);
						sizeTextArea();
					}}
					value={fieldText}
				/>
				<button className={style["send-button"]} type="submit">
					Send
				</button>
				<button
					className={style["attach-button"]}
					type="button"
					onClick={() => {
						imageUploader(async (url) => {
							const { data, status } = await api.sendMessage({ groupId, text: url });
							if (status === 201) addNewMessage(data);
						});
					}}
				>
					Attach
				</button>
			</form>
		</div>
	);
}

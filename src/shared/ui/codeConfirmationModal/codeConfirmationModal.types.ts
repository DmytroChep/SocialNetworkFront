import { Dispatch, SetStateAction } from "react";

export interface CodeConfirmationModalProps {
	title: string;
	email: string;
	setStep: Dispatch<SetStateAction<number>>
	onConfirm?: () => Promise<void>;
}

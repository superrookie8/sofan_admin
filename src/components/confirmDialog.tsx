// components/ConfirmDialog.tsx
import React from "react";

interface ConfirmDialogProps {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	message,
	onConfirm,
	onCancel,
}) => {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded shadow-lg">
				<p className="mb-4">{message}</p>
				<div className="flex justify-end">
					<button
						onClick={onCancel}
						className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDialog;

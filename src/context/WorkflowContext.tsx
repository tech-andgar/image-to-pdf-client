import { createContext, useContext, type ReactNode } from "react";
import { useImageWorkflow } from "../hooks/useImageWorkflow";

type WorkflowContextValue = ReturnType<typeof useImageWorkflow>;

const WorkflowContext = createContext<WorkflowContextValue | undefined>(
	undefined,
);

interface WorkflowProviderProps {
	readonly children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
	const workflow = useImageWorkflow();
	return (
		<WorkflowContext.Provider value={workflow}>
			{children}
		</WorkflowContext.Provider>
	);
}

export function useWorkflow() {
	const context = useContext(WorkflowContext);
	if (context === undefined) {
		throw new Error(
			"useWorkflow must be used within a WorkflowProvider. Make sure WorkflowProvider wraps the component tree.",
		);
	}
	return context;
}

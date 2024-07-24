import React, { useEffect, useRef } from "react";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { createRoot } from "react-dom/client";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";
import {
	ConnectionPlugin,
	Presets as ConnectionPresets,
} from "rete-connection-plugin";

type Schemes = GetSchemes<
	ClassicPreset.Node,
	ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = ReactArea2D<Schemes>;

const ImageEditor: React.FC = () => {
	const editorRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!editorRef.current) return;

		async function init() {
			const container = editorRef.current!;
			const editor = new NodeEditor<Schemes>();

			const area = new AreaPlugin<Schemes, AreaExtra>(container);
			const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

			render.addPreset(Presets.classic.setup());

			editor.use(area);
			area.use(render);

			const connection = new ConnectionPlugin<Schemes, AreaExtra>();
			connection.addPreset(ConnectionPresets.classic.setup());
			area.use(connection);

			const socket = new ClassicPreset.Socket("socket");

			const nodeA = new ClassicPreset.Node("A");
			nodeA.addControl("a", new ClassicPreset.InputControl("text", {}));
			nodeA.addOutput("a", new ClassicPreset.Output(socket));
			await editor.addNode(nodeA);

			const nodeB = new ClassicPreset.Node("B");
			nodeB.addControl("b", new ClassicPreset.InputControl("text", {}));
			nodeB.addInput("b", new ClassicPreset.Input(socket));
			await editor.addNode(nodeB);

			await editor.addConnection(
				new ClassicPreset.Connection(nodeA, "a", nodeB, "b")
			);

			await area.translate(nodeB.id, { x: 270, y: 0 });

			AreaExtensions.zoomAt(area, editor.getNodes());
			AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
				accumulating: AreaExtensions.accumulateOnCtrl(),
			});
			AreaExtensions.simpleNodesOrder(area);

			// Replace `request` and `process` calls with actual functionality
			// Check the documentation for the correct way to handle node updates in v2
		}

		init();
	}, []);

	return (
		<div ref={editorRef} style={{ width: "800px", height: "600px" }}></div>
	);
};

export default ImageEditor;

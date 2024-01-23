"use client";

import "reactflow/dist/style.css";

import dagre from "@dagrejs/dagre";
import { toPng } from "html-to-image";
import { uniqBy } from "lodash";
import { DownloadIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo } from "react";
// eslint-disable-next-line import/no-named-as-default
import ReactFlow, {
	Background,
	BackgroundVariant,
	Edge,
	getRectOfNodes,
	getTransformForBounds,
	MiniMap,
	Node,
	Panel,
	Position,
	ReactFlowProvider,
	useReactFlow,
} from "reactflow";

import { PostgresTable, TableNodeData } from "@/lib/models";

import { TABLE_NODE_ROW_HEIGHT, TABLE_NODE_WIDTH, TableNode } from "./TableSchema";

// eslint-disable-next-line @typescript-eslint/require-await
async function getGraphDataFromTables(tables: PostgresTable[]): Promise<{
	nodes: Node<TableNodeData>[];
	edges: Edge[];
}> {
	if (!tables.length) {
		return { nodes: [], edges: [] };
	}

	const nodes = tables.map((table) => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const columns = (table.columns || []).map((column) => {
			return {
				id: column.id,
				type_name: column.type_name,
				isPrimary: table.primary_keys.some((pk) => pk.name === column.name),
				name: column.name,
				format: column.format,
				isNullable: column.is_nullable,
				isUnique: column.is_unique,
				isUpdateable: column.is_updatable,
				isIdentity: column.is_identity,
			};
		});

		return {
			id: `${table.id}`,
			type: "table",
			data: {
				schema: table.schema,
				name: table.name,
				isForeign: false,
				columns,
			},
			position: { x: 0, y: 0 },
		};
	});

	const edges: Edge[] = [];
	const currentSchema = tables[0].schema;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	const uniqueRelationships = uniqBy(
		tables.flatMap((t) => t.relationships),
		"id"
	);

	for (const rel of uniqueRelationships) {
		if (rel.target_table_schema !== currentSchema) {
			nodes.push({
				id: rel.constraint_name,
				type: "table",
				data: {
					schema: rel.target_table_schema,
					name: `${rel.target_table_schema}.${rel.target_table_name}.${rel.target_column_name}`,
					isForeign: true,
					columns: [],
				},
				position: { x: 0, y: 0 },
			});

			const [source, sourceHandle] = findTablesHandleIds(tables, rel.source_table_name, rel.source_column_name);

			if (source) {
				edges.push({
					id: String(rel.id),
					source,
					sourceHandle,
					target: rel.constraint_name,
					targetHandle: rel.constraint_name,
				});
			}

			continue;
		}

		const [source, sourceHandle] = findTablesHandleIds(tables, rel.source_table_name, rel.source_column_name);
		const [target, targetHandle] = findTablesHandleIds(tables, rel.target_table_name, rel.target_column_name);

		// We do not support [external->this] flow currently.
		if (source && target) {
			edges.push({
				id: String(rel.id),
				source,
				sourceHandle,
				target,
				targetHandle,
			});
		}
	}
	return getLayoutedElements(nodes, edges);
}

function findTablesHandleIds(tables: PostgresTable[], table_name: string, column_name: string): [string?, string?] {
	for (const table of tables) {
		if (table_name !== table.name) continue;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		for (const column of table.columns || []) {
			if (column_name !== column.name) continue;

			return [String(table.id), column.id];
		}
	}

	return [];
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	dagreGraph.setGraph({
		rankdir: "LR",
		align: "UR",
		nodesep: 30,
		ranksep: 50,
	});

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, {
			width: TABLE_NODE_WIDTH / 2,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-plus-operands
			height: (TABLE_NODE_ROW_HEIGHT / 2) * (node.data.columns.length + 1), // columns + header
		});
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	nodes.forEach((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		node.targetPosition = Position.Left;
		node.sourcePosition = Position.Right;
		node.position = {
			x: nodeWithPosition.x - nodeWithPosition.width / 2,
			y: nodeWithPosition.y - nodeWithPosition.height / 2,
		};

		return node;
	});

	return { nodes, edges };
};

const TablesGraph = ({ tables }: { tables: PostgresTable[] }): React.JSX.Element => {
	const { resolvedTheme } = useTheme();
	const maskColor = resolvedTheme === "dark" ? "#020024" : "#F2F2F2";

	const reactFlowInstance = useReactFlow();
	const nodeTypes = useMemo(
		() => ({
			table: TableNode,
		}),
		[]
	);
	const downloadImage = (): void => {
		const bounds = getRectOfNodes(reactFlowInstance.getNodes());
		const transform = getTransformForBounds(bounds, window.innerWidth, window.innerHeight, 1, 3);
		// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
		void toPng(document.querySelector(".react-flow__viewport") as HTMLElement, {
			style: {
				transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
			},
		}).then((dataUrl) => {
			const link = document.createElement("a");
			link.download = "schema.png";
			link.href = dataUrl;
			link.click();
		});
	};

	useEffect(() => {
		void getGraphDataFromTables(tables).then(({ nodes, edges }) => {
			reactFlowInstance.setNodes(nodes);
			reactFlowInstance.setEdges(edges);
			setTimeout(() => reactFlowInstance.fitView({})); // it needs to happen during next event tick
		});
	}, [tables, resolvedTheme]);
	return (
		<>
			<div className="h-full w-full">
				<ReactFlow
					defaultNodes={[]}
					defaultEdges={[]}
					defaultEdgeOptions={{
						type: "smoothstep",
						animated: true,
						className: "text-accent-foreground",
						style: {
							strokeWidth: 1,
						},
					}}
					nodeTypes={nodeTypes}
					fitView
					minZoom={0.8}
					maxZoom={1.8}
					proOptions={{ hideAttribution: true }}>
					<Panel position="top-right">
						<DownloadIcon
							className="h-5 w-5 cursor-pointer text-accent-foreground"
							onClick={downloadImage}
						/>
					</Panel>
					<Background gap={16} variant={BackgroundVariant.Dots} className="text-accent-foreground" />
					<MiniMap
						nodeColor={"#DEDEDE"}
						maskColor={maskColor}
						pannable
						zoomable
						className="rounded-md border shadow-sm"
					/>
				</ReactFlow>
			</div>
		</>
	);
};

const SchemaGraph = ({ tables }: { tables: PostgresTable[] }): React.JSX.Element => {
	return (
		<ReactFlowProvider>
			<TablesGraph tables={tables} />
		</ReactFlowProvider>
	);
};

export default observer(SchemaGraph);

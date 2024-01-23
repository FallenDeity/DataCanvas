import { type LucideIcon } from "lucide-react";
import { Session } from "next-auth";

export interface UserModel {
	id: string;
	name: string;
	email: string;
	email_verified: Date | null;
	image: string;
	created_at: Date;
	updated_at: Date;
}

export interface AccountModel {
	user_id: string;
	provider_id: string;
	provider_type: string;
	provider_account_id: string;
	refresh_token: string;
	access_token: string;
	expires_at: Date | null;
	token_type: string;
	scope: string;
	id_token: string;
	session_state: string;
}

export interface VerificationTokenModel {
	identifier: string;
	token: string;
	expires: Date;
}

export interface SessionModel {
	id: number;
	expires: Date;
	session_token: string;
	user_id: string;
}

export interface DatabaseModel {
	user_id: string;
	db_name: string;
	db_user: string;
	db_password: string;
	created_at: Date;
	updated_at: Date;
}

export interface UserSessionModel extends Session {
	user: UserModel & { emailVerified: boolean };
	db: DatabaseModel;
	expires: string;
}

export interface NavItem {
	title: string;
	href: string;
	icon: LucideIcon;
	color?: string;
	isChidren?: boolean;
	children?: NavItem[];
}

export interface PostgresColumn {
	id: string;
	name: string;
	type_name: string;
	format: string;
	is_nullable: boolean;
	is_unique: boolean;
	is_identity: boolean;
	is_updatable: boolean;
	is_primary_key: boolean;
	default_value: string | null;
}

export interface PostgresRelationship {
	id: string;
	constraint_name: string;
	target_table_name: string;
	target_column_name: string;
	target_table_schema: string;
	source_table_name: string;
	source_column_name: string;
}

export interface PostgresTable {
	schema: string;
	id: string;
	name: string;
	primary_keys: { name: string }[];
	relationships: PostgresRelationship[];
	columns: PostgresColumn[];
}

export interface TableNodeData {
	schema: string;
	name: string;
	isForeign: boolean;
	columns: {
		id: string;
		isPrimary: boolean;
		isNullable: boolean;
		isUnique: boolean;
		isIdentity: boolean;
		name: string;
		format: string;
		type_name: string;
	}[];
}

export interface TableModel {
	schema: string;
	name: string;
	rowCount: number;
	size: number;
	columns: PostgresColumn[];
	relationships: PostgresRelationship[];
	indexes: {
		id: string;
		name: string;
		columns: string[];
	}[];
	referencedBy: Record<string, PostgresRelationship>;
}

export interface DatabaseLogModel {
	database_id: string;
	database_size: number;
	created_at: Date;
}

export interface UserLogModel {
	date: Date;
	total: number[];
	durations: number[];
}

export interface UserDataLogModel {
	user_id: string;
	command_type: string;
	command: string;
	duration: number;
	count: number;
	created_at: Date;
}

export { default } from "next-auth/middleware";

export const config = {
	matcher: ["/"], // add path to be excluded from middleware, for api use `getServerSession` in route.ts
};
